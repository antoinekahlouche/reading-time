const app = document.querySelector("#app");

let state = {
  view: "collections",
  collection: null,
  book: null,
  page: 1,
  pages: 0,
  version: null,
  jumpOpen: false,
};

const enc = encodeURIComponent;

function dec(value) {
  return decodeURIComponent(value.replace(/\+/g, "%20"));
}

function pathState() {
  const parts = window.location.pathname.split("/").filter(Boolean).map(dec);
  if (parts.length === 0) return { view: "collections", collection: null, book: null, page: 1, pages: 0, version: null, jumpOpen: false };

  const page = Number(parts[parts.length - 1]);
  if (Number.isInteger(page) && page > 0 && parts.length >= 2) {
    return { view: "reader", collection: parts.slice(0, -2).join("/"), book: parts[parts.length - 2], page, pages: 0, version: null, jumpOpen: false };
  }

  return { view: "books", collection: parts.join("/"), book: null, page: 1, pages: 0, version: null, jumpOpen: false };
}

function statePath(next = state) {
  if (next.view === "collections") return "/";
  if (next.view === "books") return `/${next.collection.split("/").map(enc).join("/")}`;
  return `/${next.collection.split("/").map(enc).join("/")}/${enc(next.book)}/${next.page}`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
}

async function api(path, options) {
  const response = await fetch(path, options);
  if (!response.ok) throw new Error((await response.json()).error || "Request failed");
  return response.json();
}

function setState(next) {
  state = Object.assign({}, state, next);
  render();
}

function navigate(next) {
  state = Object.assign({}, state, next);
  history.pushState(null, "", statePath());
  render();
}

function screen(title, items, onBack) {
  app.innerHTML = `
    <section class="menu">
      ${onBack ? '<button class="back">Back to shelves</button>' : ""}
      <p class="eyebrow">Reading Time</p>
      <h1>${title}</h1>
      <p class="helper">Tap a big card to start reading.</p>
      <div class="list"></div>
      <div class="menu-actions"></div>
    </section>
  `;

  if (onBack) app.querySelector(".back").addEventListener("click", onBack);
  const list = app.querySelector(".list");

  for (const item of items) {
    const button = document.createElement("button");
    button.className = item.cover ? "item cover-card" : "item";
    if (item.cover) {
      button.innerHTML = `<span class="cover-wrap"><img class="cover" src="${item.cover}" alt="${escapeHtml(item.label)} cover" loading="lazy" /></span><span class="item-label">${escapeHtml(item.label)}</span>`;
    } else {
      button.textContent = item.label;
    }
    button.addEventListener("click", item.action);
    list.appendChild(button);
  }
}

function coverUrl(collection, book, version) {
  return `/api/book/${enc(collection)}/${enc(book)}/cover?v=${enc(version)}`;
}

function parentCollection(collection) {
  const parts = collection.split("/");
  parts.pop();
  return parts.join("/") || null;
}

function collectionLabel(collection) {
  const parts = collection.split("/");
  return parts[parts.length - 1];
}

function collectionCover(collection) {
  return collection.firstBook ? coverUrl(collection.coverCollection || collection.name, collection.firstBook, collection.version) : null;
}

async function showCollections() {
  app.innerHTML = '<p class="loading">Opening the bookshelf...</p>';
  const { collections } = await api("/api/collections");
  screen("Collections", collections.map((collection) => ({
    label: collection.label,
    cover: collectionCover(collection),
    action: () => navigate({ view: "books", collection: collection.name, book: null, page: 1, pages: 0, version: null, jumpOpen: false }),
  })));

  const actions = app.querySelector(".menu-actions");
  const button = document.createElement("button");
  button.className = "sync";
  button.textContent = "Sync library";
  button.addEventListener("click", async () => {
    button.disabled = true;
    button.textContent = "Syncing...";
    try {
      await api("/api/sync", { method: "POST" });
      await showCollections();
    } catch (error) {
      showError(error);
    }
  });
  actions.appendChild(button);
}

async function showBooks() {
  app.innerHTML = '<p class="loading">Finding the stories...</p>';
  const { collections, books } = await api(`/api/collections/${enc(state.collection)}/books`);
  const items = collections.map((collection) => ({
      label: collection.label,
      cover: collectionCover(collection),
      action: () => navigate({ view: "books", collection: collection.name, book: null, page: 1, pages: 0, version: null, jumpOpen: false }),
    })).concat(books.map((book) => ({
      label: book.name.replace(/\.pdf$/i, ""),
      cover: coverUrl(state.collection, book.name, book.version),
      action: async () => {
        const { pages, page, version } = await api(`/api/book/${enc(state.collection)}/${enc(book.name)}/meta`);
        navigate({ view: "reader", book: book.name, page, pages, version, jumpOpen: false });
      },
    })));
  screen(collectionLabel(state.collection), items, () => {
    const parent = parentCollection(state.collection);
    navigate({ view: parent ? "books" : "collections", collection: parent, book: null, page: 1, pages: 0, version: null, jumpOpen: false });
  });
}

function pageUrl(page, savePosition = false) {
  return `/api/book/${enc(state.collection)}/${enc(state.book)}/page/${page}?v=${enc(state.version)}&save=${savePosition ? "1" : "0"}`;
}

function positionUrl(page) {
  return `/api/book/${enc(state.collection)}/${enc(state.book)}/position/${page}`;
}

function savePosition(page) {
  api(positionUrl(page), { method: "POST" }).catch((error) => console.error("Failed to save position:", error));
}

function goPage(nextPage) {
  if (nextPage < 1 || nextPage > state.pages) return;
  navigate({ page: nextPage, jumpOpen: false });
  savePosition(nextPage);
}

function preloadPage(page) {
  if (page < 1 || page > state.pages) return;
  const image = new Image();
  image.src = pageUrl(page);
}

function preloadPageWindow(startPage) {
  for (let offset = 0; offset < 6; offset += 1) preloadPage(startPage + offset);
}

function showJumpDialog() {
  state.jumpOpen = true;
  const dialog = document.createElement("div");
  dialog.className = "jump-modal";
  dialog.innerHTML = `
    <form class="jump-box">
      <label for="jump-page">Go to page</label>
      <input id="jump-page" name="page" type="number" min="1" max="${state.pages}" value="1" inputmode="numeric" />
      <div class="jump-actions">
        <button type="button" class="cancel">Cancel</button>
        <button type="submit">Goto</button>
      </div>
    </form>
  `;

  app.appendChild(dialog);

  const input = dialog.querySelector("input");
  input.focus();
  input.select();
  input.addEventListener("input", () => {
    if (Number(input.value) > state.pages) input.value = String(state.pages);
    if (Number(input.value) < 1) input.value = "1";
  });

  dialog.querySelector(".cancel").addEventListener("click", () => dialog.parentNode && dialog.parentNode.removeChild(dialog));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && dialog.parentNode) dialog.parentNode.removeChild(dialog);
  });
  dialog.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    const page = Number(input.value);
    if (!Number.isInteger(page) || page < 1 || page > state.pages) return;
    if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
    goPage(page);
  });
}

async function showReader() {
  if (!state.version) {
    app.innerHTML = '<p class="loading">Opening the book...</p>';
    const { pages, version } = await api(`/api/book/${enc(state.collection)}/${enc(state.book)}/meta`);
    state = Object.assign({}, state, { pages, version, page: Math.min(state.page, pages) });
    history.replaceState(null, "", statePath());
    savePosition(state.page);
  }

  app.innerHTML = `
    <section class="reader">
      <button class="return">Books</button>
      <button class="counter" type="button">${state.page} / ${state.pages}</button>
      <div class="loader"><span>Turning the page...</span></div>
      <img class="page loading-page" src="${pageUrl(state.page, true)}" alt="Page ${state.page}" />
      <button class="tap left" aria-label="Previous page"><span>Prev</span></button>
      <button class="tap right" aria-label="Next page"><span>Next</span></button>
    </section>
  `;

  app.querySelector(".return").addEventListener("click", () => navigate({ view: "books", book: null, page: 1, pages: 0, version: null, jumpOpen: false }));
  app.querySelector(".counter").addEventListener("click", showJumpDialog);
  app.querySelector(".left").addEventListener("click", () => goPage(state.page - 1));
  app.querySelector(".right").addEventListener("click", () => goPage(state.page + 1));

  const page = app.querySelector(".page");
  const loader = app.querySelector(".loader");

  page.addEventListener("load", () => {
    page.classList.remove("loading-page");
    loader.classList.add("hidden");
    preloadPage(state.page - 1);
    preloadPage(state.page - 2);
    preloadPageWindow(state.page + 1);
  });

  page.addEventListener("error", () => {
    loader.querySelector("span").textContent = "Could not load page";
  });
}

function render() {
  if (state.view === "collections") showCollections().catch(showError);
  if (state.view === "books") showBooks().catch(showError);
  if (state.view === "reader") showReader().catch(showError);
}

function showError(error) {
  app.innerHTML = `<section class="menu"><p class="eyebrow">Reading Time</p><h1>Oops</h1><p>${error.message}</p><button class="back">Back to shelves</button></section>`;
  app.querySelector(".back").addEventListener("click", () => navigate({ view: "collections", collection: null, book: null }));
}

window.addEventListener("error", (event) => showError(event.error || new Error(event.message)));
window.addEventListener("unhandledrejection", (event) => showError(event.reason || new Error("Request failed")));

window.addEventListener("popstate", () => {
  state = pathState();
  render();
});

window.addEventListener("keydown", (event) => {
  if (state.view !== "reader") return;
  if (event.key === "ArrowLeft") goPage(state.page - 1);
  if (event.key === "ArrowRight") goPage(state.page + 1);
  if (event.key === "Escape") navigate({ view: "books", book: null, page: 1, pages: 0, version: null, jumpOpen: false });
});

state = pathState();
history.replaceState(null, "", statePath());
render();
