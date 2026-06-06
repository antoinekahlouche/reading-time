import { spawn, spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";

const port = Number(process.env.PORT ?? 3000);
const dataDir = resolve(process.env.DATA_DIR ?? "data");
const tmpDir = resolve(process.env.TMP_DIR ?? "/tmp/reading-time");
const cacheDir = join(tmpDir, "cache");
const cacheStatePath = join(tmpDir, "cache-state.json");
const publicDir = resolve("public");
const cacheBeforePages = 2;
const cacheAfterPages = 5;

mkdirSync(tmpDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

type CacheState = Record<string, number>;
let cacheState: CacheState = loadCacheState();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeResolve(...parts: string[]) {
  const filePath = resolve(dataDir, ...parts);
  if (filePath !== dataDir && !filePath.startsWith(`${dataDir}/`)) {
    throw new Error("Invalid path");
  }
  return filePath;
}

function listCollections() {
  return readdirSync(dataDir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function listBooks(collection: string) {
  const collectionDir = safeResolve(collection);
  return readdirSync(collectionDir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function collectionSummaries() {
  return listCollections().map((name) => {
    const firstBook = listBooks(name)[0] ?? null;
    const firstBookPath = firstBook ? safeResolve(name, firstBook) : null;
    return {
      name,
      firstBook,
      version: firstBookPath ? pdfVersion(firstBookPath) : null,
    };
  });
}

function bookSummaries(collection: string) {
  return listBooks(collection).map((name) => {
    const pdfPath = safeResolve(collection, name);
    return { name, version: pdfVersion(pdfPath) };
  });
}

function getPdfPath(collection: string, book: string) {
  if (!listCollections().includes(collection) || !listBooks(collection).includes(book)) {
    throw new Error("Book not found");
  }
  return safeResolve(collection, book);
}

function getPageCount(pdfPath: string) {
  const result = spawnSync("pdfinfo", [pdfPath], { encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || "pdfinfo failed");

  const match = result.stdout.match(/^Pages:\s+(\d+)/m);
  if (!match) throw new Error("Could not read page count");
  return Number(match[1]);
}

function pdfVersion(pdfPath: string) {
  return String(Math.trunc(statSync(pdfPath).mtimeMs));
}

function cachePathFor(pdfPath: string, page: number) {
  return join(cacheDir, `${Bun.hash(`${pdfPath}:${pdfVersion(pdfPath)}:${page}`)}.png`);
}

function loadCacheState() {
  try {
    return JSON.parse(readFileSync(cacheStatePath, "utf8")) as CacheState;
  } catch {
    return {};
  }
}

function saveCacheState() {
  writeFileSync(cacheStatePath, JSON.stringify(cacheState, null, 2));
}

function pdfKey(pdfPath: string) {
  return `${pdfPath}:${pdfVersion(pdfPath)}`;
}

function cachedPage(pdfPath: string, totalPages: number) {
  return Math.min(Math.max(cacheState[pdfKey(pdfPath)] ?? 1, 1), totalPages);
}

async function renderPage(pdfPath: string, page: number) {
  const cachePath = cachePathFor(pdfPath, page);
  if (existsSync(cachePath)) return Bun.file(cachePath);

  const key = queueKey(pdfPath, page);
  const activeRender = activeRenders.get(key);
  if (activeRender) return activeRender;

  const render = renderPageToCache(pdfPath, page, cachePath).finally(() => activeRenders.delete(key));
  activeRenders.set(key, render);
  return render;
}

async function renderPageToCache(pdfPath: string, page: number, cachePath: string) {
  const outputPrefix = join(tmpDir, `${Bun.hash(`${pdfPath}:${page}:${Date.now()}`)}`);
  await runCommand("pdftoppm", ["-f", String(page), "-l", String(page), "-png", "-singlefile", "-r", "120", pdfPath, outputPrefix]);

  const imagePath = `${outputPrefix}.png`;
  renameSync(imagePath, cachePath);
  return Bun.file(cachePath);
}

function runCommand(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args);
    let stderr = "";

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `${command} failed with code ${code}`));
    });
  });
}

const renderQueue: Array<{ pdfPath: string; page: number }> = [];
const queuedKeys = new Set<string>();
const activeRenders = new Map<string, Promise<Blob>>();
let queueRunning = false;

function queueKey(pdfPath: string, page: number) {
  return `${pdfPath}:${page}`;
}

function enqueuePage(pdfPath: string, page: number, priority = false) {
  if (existsSync(cachePathFor(pdfPath, page))) return;

  const key = queueKey(pdfPath, page);
  if (queuedKeys.has(key)) return;

  queuedKeys.add(key);
  if (priority) renderQueue.unshift({ pdfPath, page });
  else renderQueue.push({ pdfPath, page });
  void processRenderQueue();
}

function cachedWindow(currentPage: number, totalPages: number) {
  return {
    start: Math.max(1, currentPage - cacheBeforePages),
    end: Math.min(totalPages, currentPage + cacheAfterPages),
  };
}

function enqueuePageWindow(pdfPath: string, currentPage: number, totalPages: number, priority = false) {
  const { start, end } = cachedWindow(currentPage, totalPages);
  if (priority) {
    for (let page = end; page >= start; page -= 1) enqueuePage(pdfPath, page, true);
    return;
  }

  for (let page = start; page <= end; page += 1) enqueuePage(pdfPath, page);
}

function updatePdfPosition(pdfPath: string, currentPage: number, totalPages: number) {
  cacheState[pdfKey(pdfPath)] = currentPage;
  saveCacheState();
  cleanupPdfCacheWindow(pdfPath, currentPage, totalPages);
  enqueuePageWindow(pdfPath, currentPage, totalPages, true);
}

function cleanupPdfCacheWindow(pdfPath: string, currentPage: number, totalPages: number) {
  const { start, end } = cachedWindow(currentPage, totalPages);
  for (let index = renderQueue.length - 1; index >= 0; index -= 1) {
    const item = renderQueue[index];
    if (item.pdfPath !== pdfPath) continue;
    if (item.page >= start && item.page <= end) continue;

    renderQueue.splice(index, 1);
    queuedKeys.delete(queueKey(item.pdfPath, item.page));
  }

  for (let page = 1; page <= totalPages; page += 1) {
    if (page >= start && page <= end) continue;
    if (activeRenders.has(queueKey(pdfPath, page))) continue;

    const cachePath = cachePathFor(pdfPath, page);
    if (existsSync(cachePath)) unlinkSync(cachePath);
  }
}

async function processRenderQueue() {
  if (queueRunning) return;
  queueRunning = true;

  while (renderQueue.length > 0) {
    const item = renderQueue.shift();
    if (!item) continue;

    const key = queueKey(item.pdfPath, item.page);
    try {
      await renderPage(item.pdfPath, item.page);
    } catch (error) {
      console.error(`Failed to prerender ${item.pdfPath} page ${item.page}:`, error);
    } finally {
      queuedKeys.delete(key);
    }

    await Bun.sleep(10);
  }

  queueRunning = false;
}

function preRenderStartupPages() {
  for (const collection of listCollections()) {
    for (const book of listBooks(collection)) {
      const pdfPath = safeResolve(collection, book);
      const pages = getPageCount(pdfPath);
      const currentPage = cachedPage(pdfPath, pages);
      cleanupPdfCacheWindow(pdfPath, currentPage, pages);
      enqueuePageWindow(pdfPath, currentPage, pages);
    }
  }
}

function decodePart(value: string) {
  return decodeURIComponent(value.replace(/\+/g, "%20"));
}

async function handleApi(url: URL) {
  const parts = url.pathname.split("/").filter(Boolean).map(decodePart);

  try {
    if (url.pathname === "/api/collections") return json({ collections: collectionSummaries() });

    if (parts.length === 4 && parts[0] === "api" && parts[1] === "collections" && parts[3] === "books") {
      return json({ books: bookSummaries(parts[2]) });
    }

    if (parts.length === 5 && parts[0] === "api" && parts[1] === "book" && parts[4] === "cover") {
      const pdfPath = getPdfPath(parts[2], parts[3]);
      return new Response(await renderPage(pdfPath, 1), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (parts.length === 5 && parts[0] === "api" && parts[1] === "book" && parts[4] === "meta") {
      const pdfPath = getPdfPath(parts[2], parts[3]);
      const pages = getPageCount(pdfPath);
      return json({ pages, page: cachedPage(pdfPath, pages), version: pdfVersion(pdfPath) });
    }

    if (parts.length === 6 && parts[0] === "api" && parts[1] === "book" && parts[4] === "page") {
      const page = Number(parts[5]);
      const pdfPath = getPdfPath(parts[2], parts[3]);
      const pages = getPageCount(pdfPath);

      if (!Number.isInteger(page) || page < 1 || page > pages) return json({ error: "Invalid page" }, 400);

      if (url.searchParams.get("save") === "1") updatePdfPosition(pdfPath, page, pages);

      return new Response(await renderPage(pdfPath, page), {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return json({ error: "Not found" }, 404);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Server error" }, 500);
  }
}

Bun.serve({
  port,
  idleTimeout: 120,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(url);

    const filePath = url.pathname === "/" ? join(publicDir, "index.html") : resolve(publicDir, `.${url.pathname}`);
    if (filePath !== publicDir && !filePath.startsWith(`${publicDir}/`)) return new Response("Not found", { status: 404 });

    const file = Bun.file(filePath);
    if (!(await file.exists())) return new Response("Not found", { status: 404 });
    return new Response(file);
  },
});

console.log(`PDF viewer running on http://localhost:${port}`);

setTimeout(() => {
  try {
    preRenderStartupPages();
  } catch (error) {
    console.error("Failed to queue startup prerender:", error);
  }
}, 100);
