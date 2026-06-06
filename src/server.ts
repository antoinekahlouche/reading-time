import { spawn, spawnSync } from "child_process";
import { existsSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync, readFileSync } from "fs";
import { join, resolve } from "path";

const port = Number(process.env.PORT ?? 3000);
const dataDir = resolve(process.env.DATA_DIR ?? "data");
const tmpDir = resolve(process.env.TMP_DIR ?? "/tmp/reading-time");
const cacheDir = join(tmpDir, "cache");
const cacheStatePath = join(tmpDir, "cache-state.json");
const libraryCachePath = join(tmpDir, "library-cache.json");
const publicDir = resolve("public");
const cacheBeforePages = 2;
const cacheAfterPages = 5;
const renderDpi = String(Number(process.env.RENDER_DPI) || 90);
const jpegQuality = String(Number(process.env.JPEG_QUALITY) || 85);

mkdirSync(tmpDir, { recursive: true });
mkdirSync(cacheDir, { recursive: true });

type CacheState = Record<string, number>;
type CachedBook = { name: string; version: string; pages: number };
type CachedCollection = { name: string; books: CachedBook[]; collections: CachedCollection[] };
type LibraryCache = { collections: CachedCollection[] };

let cacheState: CacheState = loadCacheState();
let libraryCache: LibraryCache = { collections: [] };
libraryCache = loadLibraryCache();
cleanupLegacyImageCache();

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function logAction(action: string, details: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ time: new Date().toISOString(), action, ...details }));
}

function safeResolve(...parts: string[]) {
  const filePath = resolve(dataDir, ...parts);
  if (filePath !== dataDir && !filePath.startsWith(`${dataDir}/`)) {
    throw new Error("Invalid path");
  }
  return filePath;
}

function cleanupLegacyImageCache() {
  for (const entry of readdirSync(cacheDir, { withFileTypes: true })) {
    if (!entry.isFile() || (!entry.name.endsWith(".png") && !entry.name.endsWith(".webp"))) continue;

    const cachePath = join(cacheDir, entry.name);
    unlinkSync(cachePath);
    logAction("legacy-image-cache-removed", { cachePath });
  }
}

function listCollections(collection = "") {
  const collectionDir = safeResolve(collection);
  if (!existsSync(collectionDir)) return [];

  return readdirSync(collectionDir, { withFileTypes: true })
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

function collectionPath(parent: string, name: string) {
  return parent ? `${parent}/${name}` : name;
}

function allCollections(collections = libraryCache.collections): CachedCollection[] {
  return collections.flatMap((collection) => [collection, ...allCollections(collection.collections ?? [])]);
}

function findCollection(collection: string) {
  return allCollections().find((item) => item.name === collection);
}

function firstBookIn(collection: CachedCollection): { collection: CachedCollection; book: CachedBook } | null {
  const firstBook = collection.books[0];
  if (firstBook) return { collection, book: firstBook };

  for (const child of collection.collections ?? []) {
    const childBook = firstBookIn(child);
    if (childBook) return childBook;
  }

  return null;
}

function collectionSummary(collection: CachedCollection) {
  const firstBook = firstBookIn(collection);
  return {
    name: collection.name,
    label: collection.name.split("/").at(-1) ?? collection.name,
    coverCollection: firstBook?.collection.name ?? null,
    firstBook: firstBook?.book.name ?? null,
    version: firstBook?.book.version ?? null,
  };
}

function collectionSummaries() {
  return libraryCache.collections.map(collectionSummary);
}

function bookSummaries(collection: string) {
  const cachedCollection = findCollection(collection);
  if (!cachedCollection) throw new Error("Collection not found");
  return {
    collections: (cachedCollection.collections ?? []).map(collectionSummary),
    books: cachedCollection.books.map(({ name, version }) => ({ name, version })),
  };
}

function getPdfPath(collection: string, book: string) {
  const cachedCollection = findCollection(collection);
  if (!cachedCollection?.books.some((item) => item.name === book)) {
    throw new Error("Book not found");
  }
  return safeResolve(collection, book);
}

function getCachedBook(collection: string, book: string) {
  const cachedBook = findCollection(collection)?.books.find((item) => item.name === book);
  if (!cachedBook) throw new Error("Book not found");
  return cachedBook;
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
  return join(cacheDir, `${Bun.hash(`${pdfPath}:${pdfVersion(pdfPath)}:${page}:${renderDpi}:${jpegQuality}:jpeg`)}.jpg`);
}

function loadCacheState() {
  try {
    return JSON.parse(readFileSync(cacheStatePath, "utf8")) as CacheState;
  } catch {
    return {};
  }
}

function loadLibraryCache() {
  try {
    return JSON.parse(readFileSync(libraryCachePath, "utf8")) as LibraryCache;
  } catch {
    return syncLibraryCache();
  }
}

function saveLibraryCache() {
  writeFileSync(libraryCachePath, JSON.stringify(libraryCache, null, 2));
  logAction("library-cache-saved", { path: libraryCachePath, collections: libraryCache.collections.length });
}

function syncLibraryCache() {
  logAction("library-sync-started", { dataDir, cachePath: libraryCachePath });
  const previousBooks = new Map<string, CachedBook>();
  for (const collection of allCollections(libraryCache?.collections ?? [])) {
    for (const book of collection.books) previousBooks.set(`${collection.name}/${book.name}`, book);
  }

  function syncCollection(name: string): CachedCollection {
    const books = listBooks(name).map((bookName) => {
      const pdfPath = safeResolve(name, bookName);
      const version = pdfVersion(pdfPath);
      const previous = previousBooks.get(`${name}/${bookName}`);
      if (previous?.version === version) {
        logAction("pdf-cache-entry-reused", { collection: name, book: bookName, version });
        return previous;
      }

      const pages = getPageCount(pdfPath);
      logAction(previous ? "pdf-cache-entry-updated" : "pdf-cache-entry-added", { collection: name, book: bookName, version, pages });
      return { name: bookName, version, pages };
    });

    const collections = listCollections(name).map((childName) => syncCollection(collectionPath(name, childName)));
    return { name, books, collections };
  }

  const collections = listCollections().map((name) => syncCollection(name));

  libraryCache = { collections };
  saveLibraryCache();
  logAction("library-sync-finished", {
    collections: libraryCache.collections.length,
    books: allCollections().reduce((total, collection) => total + collection.books.length, 0),
  });
  return libraryCache;
}

function saveCacheState() {
  writeFileSync(cacheStatePath, JSON.stringify(cacheState, null, 2));
  logAction("position-cache-saved", { path: cacheStatePath, entries: Object.keys(cacheState).length });
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
  logAction("image-cache-render-started", { pdfPath, page, cachePath, dpi: renderDpi, format: "jpeg", quality: jpegQuality });
  await runCommand("pdftoppm", ["-f", String(page), "-l", String(page), "-jpeg", "-jpegopt", `quality=${jpegQuality}`, "-singlefile", "-r", renderDpi, pdfPath, outputPrefix]);

  const imagePath = `${outputPrefix}.jpg`;
  renameSync(imagePath, cachePath);
  logAction("image-cache-added", { pdfPath, page, cachePath });
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
  logAction("image-cache-render-queued", { pdfPath, page, priority });
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
  logAction("position-cache-updated", { pdfPath, page: currentPage, totalPages });
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
    if (existsSync(cachePath)) {
      unlinkSync(cachePath);
      logAction("image-cache-removed", { pdfPath, page, cachePath });
    }
  }
}

function cleanupPdfCacheExceptCover(pdfPath: string, totalPages: number) {
  for (let index = renderQueue.length - 1; index >= 0; index -= 1) {
    const item = renderQueue[index];
    if (item.pdfPath !== pdfPath || item.page === 1) continue;

    renderQueue.splice(index, 1);
    queuedKeys.delete(queueKey(item.pdfPath, item.page));
  }

  for (let page = 2; page <= totalPages; page += 1) {
    if (activeRenders.has(queueKey(pdfPath, page))) continue;

    const cachePath = cachePathFor(pdfPath, page);
    if (existsSync(cachePath)) {
      unlinkSync(cachePath);
      logAction("image-cache-removed", { pdfPath, page, cachePath });
    }
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
  for (const collection of allCollections()) {
    for (const book of collection.books) {
      const pdfPath = safeResolve(collection.name, book.name);
      cleanupPdfCacheExceptCover(pdfPath, book.pages);
      enqueuePage(pdfPath, 1);
    }
  }
}

function decodePart(value: string) {
  return decodeURIComponent(value.replace(/\+/g, "%20"));
}

async function handleApi(request: Request, url: URL) {
  const parts = url.pathname.split("/").filter(Boolean).map(decodePart);

  try {
    if (url.pathname === "/api/collections") return json({ collections: collectionSummaries() });

    if (url.pathname === "/api/sync") {
      if (request.method !== "POST") return json({ error: "Not found" }, 404);
      syncLibraryCache();
      return json({ collections: collectionSummaries() });
    }

    if (parts.length === 4 && parts[0] === "api" && parts[1] === "collections" && parts[3] === "books") {
      return json(bookSummaries(parts[2]));
    }

    if (parts.length === 5 && parts[0] === "api" && parts[1] === "book" && parts[4] === "cover") {
      const pdfPath = getPdfPath(parts[2], parts[3]);
      return new Response(await renderPage(pdfPath, 1), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (parts.length === 5 && parts[0] === "api" && parts[1] === "book" && parts[4] === "meta") {
      const pdfPath = getPdfPath(parts[2], parts[3]);
      const { pages, version } = getCachedBook(parts[2], parts[3]);
      return json({ pages, page: cachedPage(pdfPath, pages), version });
    }

    if (parts.length === 6 && parts[0] === "api" && parts[1] === "book" && parts[4] === "page") {
      const page = Number(parts[5]);
      const pdfPath = getPdfPath(parts[2], parts[3]);
      const { pages } = getCachedBook(parts[2], parts[3]);

      if (!Number.isInteger(page) || page < 1 || page > pages) return json({ error: "Invalid page" }, 400);

      if (url.searchParams.get("save") === "1") updatePdfPosition(pdfPath, page, pages);

      return new Response(await renderPage(pdfPath, page), {
        headers: {
          "Content-Type": "image/jpeg",
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
    if (url.pathname.startsWith("/api/")) return handleApi(request, url);

    let filePath = url.pathname === "/" ? join(publicDir, "index.html") : resolve(publicDir, `.${url.pathname}`);
    if (filePath !== publicDir && !filePath.startsWith(`${publicDir}/`)) return new Response("Not found", { status: 404 });

    let file = Bun.file(filePath);
    if (!(await file.exists())) {
      filePath = join(publicDir, "index.html");
      file = Bun.file(filePath);
    }
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
