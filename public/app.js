"use strict";

function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
var app = document.querySelector("#app");
var state = {
  view: "collections",
  collection: null,
  book: null,
  page: 1,
  pages: 0,
  version: null,
  jumpOpen: false
};
var enc = encodeURIComponent;
function dec(value) {
  return decodeURIComponent(value.replace(/\+/g, "%20"));
}
function pathState() {
  var parts = window.location.pathname.split("/").filter(Boolean).map(dec);
  if (parts.length === 0) return {
    view: "collections",
    collection: null,
    book: null,
    page: 1,
    pages: 0,
    version: null,
    jumpOpen: false
  };
  var page = Number(parts[parts.length - 1]);
  if (Number.isInteger(page) && page > 0 && parts.length >= 2) {
    return {
      view: "reader",
      collection: parts.slice(0, -2).join("/"),
      book: parts[parts.length - 2],
      page: page,
      pages: 0,
      version: null,
      jumpOpen: false
    };
  }
  return {
    view: "books",
    collection: parts.join("/"),
    book: null,
    page: 1,
    pages: 0,
    version: null,
    jumpOpen: false
  };
}
function statePath() {
  var next = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : state;
  if (next.view === "collections") return "/";
  if (next.view === "books") return "/".concat(next.collection.split("/").map(enc).join("/"));
  return "/".concat(next.collection.split("/").map(enc).join("/"), "/").concat(enc(next.book), "/").concat(next.page);
}
function api(_x, _x2) {
  return _api.apply(this, arguments);
}
function _api() {
  _api = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(path, options) {
    var response, _t, _t2, _t3;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return fetch(path, options);
        case 1:
          response = _context.v;
          if (response.ok) {
            _context.n = 4;
            break;
          }
          _t = Error;
          _context.n = 2;
          return response.json();
        case 2:
          _t2 = _context.v.error;
          if (_t2) {
            _context.n = 3;
            break;
          }
          _t2 = "Request failed";
        case 3:
          _t3 = _t2;
          throw new _t(_t3);
        case 4:
          return _context.a(2, response.json());
      }
    }, _callee);
  }));
  return _api.apply(this, arguments);
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
function onPress(element, action) {
  var touched = false;
  element.addEventListener("touchend", function (event) {
    touched = true;
    event.preventDefault();
    action();
  });
  element.addEventListener("click", function () {
    if (touched) {
      touched = false;
      return;
    }
    action();
  });
}
function screen(title, items, onBack) {
  app.innerHTML = "\n    <section class=\"menu\">\n      ".concat(onBack ? '<button class="back">Back to shelves</button>' : "", "\n      <p class=\"eyebrow\">Reading Time</p>\n      <h1>").concat(title, "</h1>\n      <p class=\"helper\">Tap a big card to start reading.</p>\n      <div class=\"list\"></div>\n      <div class=\"menu-actions\"></div>\n    </section>\n  ");
  if (onBack) app.querySelector(".back").addEventListener("click", onBack);
  var list = app.querySelector(".list");
  var _iterator = _createForOfIteratorHelper(items),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var item = _step.value;
      var button = document.createElement("button");
      button.className = item.cover ? "item cover-card" : "item";
      if (item.cover) {
        var coverWrap = document.createElement("span");
        coverWrap.className = "cover-wrap";
        var cover = document.createElement("img");
        cover.className = "cover";
        cover.src = item.cover;
        cover.alt = "".concat(item.label, " cover");
        coverWrap.appendChild(cover);
        var label = document.createElement("span");
        label.className = "item-label";
        label.textContent = item.label;
        button.appendChild(coverWrap);
        button.appendChild(label);
      } else {
        button.textContent = item.label;
      }
      button.addEventListener("click", item.action);
      list.appendChild(button);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
}
function coverUrl(collection, book, version) {
  return "/api/book/".concat(enc(collection), "/").concat(enc(book), "/cover?v=").concat(enc("".concat(version, ":page-cover")));
}
function parentCollection(collection) {
  var parts = collection.split("/");
  parts.pop();
  return parts.join("/") || null;
}
function collectionLabel(collection) {
  var parts = collection.split("/");
  return parts[parts.length - 1];
}
function collectionCover(collection) {
  return collection.firstBook ? coverUrl(collection.coverCollection || collection.name, collection.firstBook, collection.version) : null;
}
function showCollections() {
  return _showCollections.apply(this, arguments);
}
function _showCollections() {
  _showCollections = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var _yield$api, collections, actions, button;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          app.innerHTML = '<p class="loading">Opening the bookshelf...</p>';
          _context3.n = 1;
          return api("/api/collections");
        case 1:
          _yield$api = _context3.v;
          collections = _yield$api.collections;
          screen("Collections", collections.map(function (collection) {
            return {
              label: collection.label,
              cover: collectionCover(collection),
              action: function action() {
                return navigate({
                  view: "books",
                  collection: collection.name,
                  book: null,
                  page: 1,
                  pages: 0,
                  version: null,
                  jumpOpen: false
                });
              }
            };
          }));
          actions = app.querySelector(".menu-actions");
          button = document.createElement("button");
          button.className = "sync";
          button.textContent = "Sync library";
          button.addEventListener("click", /*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
            var _t4;
            return _regenerator().w(function (_context2) {
              while (1) switch (_context2.p = _context2.n) {
                case 0:
                  button.disabled = true;
                  button.textContent = "Syncing...";
                  _context2.p = 1;
                  _context2.n = 2;
                  return api("/api/sync", {
                    method: "POST"
                  });
                case 2:
                  _context2.n = 3;
                  return showCollections();
                case 3:
                  _context2.n = 5;
                  break;
                case 4:
                  _context2.p = 4;
                  _t4 = _context2.v;
                  showError(_t4);
                case 5:
                  return _context2.a(2);
              }
            }, _callee2, null, [[1, 4]]);
          })));
          actions.appendChild(button);
        case 2:
          return _context3.a(2);
      }
    }, _callee3);
  }));
  return _showCollections.apply(this, arguments);
}
function showBooks() {
  return _showBooks.apply(this, arguments);
}
function _showBooks() {
  _showBooks = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var _yield$api2, collections, books, items;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          app.innerHTML = '<p class="loading">Finding the stories...</p>';
          _context5.n = 1;
          return api("/api/collections/".concat(enc(state.collection), "/books"));
        case 1:
          _yield$api2 = _context5.v;
          collections = _yield$api2.collections;
          books = _yield$api2.books;
          items = collections.map(function (collection) {
            return {
              label: collection.label,
              cover: collectionCover(collection),
              action: function action() {
                return navigate({
                  view: "books",
                  collection: collection.name,
                  book: null,
                  page: 1,
                  pages: 0,
                  version: null,
                  jumpOpen: false
                });
              }
            };
          }).concat(books.map(function (book) {
            return {
              label: book.name.replace(/\.pdf$/i, ""),
              cover: coverUrl(state.collection, book.name, book.version),
              action: function () {
                var _action = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
                  var _yield$api3, pages, page, version;
                  return _regenerator().w(function (_context4) {
                    while (1) switch (_context4.n) {
                      case 0:
                        _context4.n = 1;
                        return api("/api/book/".concat(enc(state.collection), "/").concat(enc(book.name), "/meta"));
                      case 1:
                        _yield$api3 = _context4.v;
                        pages = _yield$api3.pages;
                        page = _yield$api3.page;
                        version = _yield$api3.version;
                        navigate({
                          view: "reader",
                          book: book.name,
                          page: page,
                          pages: pages,
                          version: version,
                          jumpOpen: false
                        });
                      case 2:
                        return _context4.a(2);
                    }
                  }, _callee4);
                }));
                function action() {
                  return _action.apply(this, arguments);
                }
                return action;
              }()
            };
          }));
          screen(collectionLabel(state.collection), items, function () {
            var parent = parentCollection(state.collection);
            navigate({
              view: parent ? "books" : "collections",
              collection: parent,
              book: null,
              page: 1,
              pages: 0,
              version: null,
              jumpOpen: false
            });
          });
        case 2:
          return _context5.a(2);
      }
    }, _callee5);
  }));
  return _showBooks.apply(this, arguments);
}
function pageUrl(page) {
  var savePosition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return "/api/book/".concat(enc(state.collection), "/").concat(enc(state.book), "/page/").concat(page, "?v=").concat(enc(state.version), "&save=").concat(savePosition ? "1" : "0");
}
function positionUrl(page) {
  return "/api/book/".concat(enc(state.collection), "/").concat(enc(state.book), "/position/").concat(page);
}
function savePosition(page) {
  api(positionUrl(page), {
    method: "POST"
  }).catch(function (error) {
    return console.error("Failed to save position:", error);
  });
}
function scrollReaderToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
function goPage(nextPage) {
  if (nextPage < 1 || nextPage > state.pages) return;
  navigate({
    page: nextPage,
    jumpOpen: false
  });
  scrollReaderToTop();
}
function preloadPage(page) {
  if (page < 1 || page > state.pages) return;
  var image = new Image();
  image.src = pageUrl(page);
}
function showJumpDialog() {
  state.jumpOpen = true;
  var dialog = document.createElement("div");
  dialog.className = "jump-modal";
  dialog.innerHTML = "\n    <form class=\"jump-box\">\n      <label for=\"jump-page\">Go to page</label>\n      <input id=\"jump-page\" name=\"page\" type=\"number\" min=\"1\" max=\"".concat(state.pages, "\" value=\"1\" inputmode=\"numeric\" />\n      <div class=\"jump-actions\">\n        <button type=\"button\" class=\"cancel\">Cancel</button>\n        <button type=\"submit\">Goto</button>\n      </div>\n    </form>\n  ");
  app.appendChild(dialog);
  var input = dialog.querySelector("input");
  input.focus();
  input.select();
  input.addEventListener("input", function () {
    if (input.value === "") return;
    if (Number(input.value) > state.pages) input.value = String(state.pages);
    if (Number(input.value) < 1) input.value = "1";
  });
  dialog.querySelector(".cancel").addEventListener("click", function () {
    return dialog.parentNode && dialog.parentNode.removeChild(dialog);
  });
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog && dialog.parentNode) dialog.parentNode.removeChild(dialog);
  });
  dialog.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    var page = Number(input.value);
    if (!Number.isInteger(page) || page < 1 || page > state.pages) return;
    if (dialog.parentNode) dialog.parentNode.removeChild(dialog);
    goPage(page);
  });
}
function showReader() {
  return _showReader.apply(this, arguments);
}
function _showReader() {
  _showReader = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
    var _yield$api4, pages, version, page, loader;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          if (state.version) {
            _context6.n = 2;
            break;
          }
          app.innerHTML = '<p class="loading">Opening the book...</p>';
          _context6.n = 1;
          return api("/api/book/".concat(enc(state.collection), "/").concat(enc(state.book), "/meta"));
        case 1:
          _yield$api4 = _context6.v;
          pages = _yield$api4.pages;
          version = _yield$api4.version;
          state = Object.assign({}, state, {
            pages: pages,
            version: version,
            page: Math.min(state.page, pages)
          });
          history.replaceState(null, "", statePath());
        case 2:
          app.innerHTML = "\n    <section class=\"reader\">\n      <button class=\"return\">Books</button>\n      <button class=\"counter\" type=\"button\">".concat(state.page, " / ").concat(state.pages, "</button>\n      <div class=\"loader\"><span>Turning the page...</span></div>\n      <img class=\"page loading-page\" src=\"").concat(pageUrl(state.page, true), "\" alt=\"Page ").concat(state.page, "\" />\n      <button class=\"tap left\" aria-label=\"Previous page\"><span>Prev</span></button>\n      <button class=\"tap right\" aria-label=\"Next page\"><span>Next</span></button>\n    </section>\n  ");
          onPress(app.querySelector(".return"), function () {
            return navigate({
              view: "books",
              book: null,
              page: 1,
              pages: 0,
              version: null,
              jumpOpen: false
            });
          });
          app.querySelector(".counter").addEventListener("click", showJumpDialog);
          app.querySelector(".left").addEventListener("click", function () {
            return goPage(state.page - 1);
          });
          app.querySelector(".right").addEventListener("click", function () {
            return goPage(state.page + 1);
          });
          page = app.querySelector(".page");
          loader = app.querySelector(".loader");
          page.addEventListener("load", function () {
            page.classList.remove("loading-page");
            loader.classList.add("hidden");
            scrollReaderToTop();
            preloadPage(state.page + 1);
          });
          page.addEventListener("error", function () {
            loader.querySelector("span").textContent = "Could not load page";
          });
        case 3:
          return _context6.a(2);
      }
    }, _callee6);
  }));
  return _showReader.apply(this, arguments);
}
function render() {
  if (state.view === "collections") showCollections().catch(showError);
  if (state.view === "books") showBooks().catch(showError);
  if (state.view === "reader") showReader().catch(showError);
}
function showError(error) {
  app.innerHTML = "<section class=\"menu\"><p class=\"eyebrow\">Reading Time</p><h1>Oops</h1><p>".concat(error.message, "</p><button class=\"back\">Back to shelves</button></section>");
  app.querySelector(".back").addEventListener("click", function () {
    return navigate({
      view: "collections",
      collection: null,
      book: null
    });
  });
}
window.addEventListener("error", function (event) {
  return showError(event.error || new Error(event.message));
});
window.addEventListener("unhandledrejection", function (event) {
  return showError(event.reason || new Error("Request failed"));
});
window.addEventListener("popstate", function () {
  state = pathState();
  render();
});
window.addEventListener("keydown", function (event) {
  if (state.view !== "reader") return;
  if (event.key === "ArrowLeft") goPage(state.page - 1);
  if (event.key === "ArrowRight") goPage(state.page + 1);
  if (event.key === "Escape") navigate({
    view: "books",
    book: null,
    page: 1,
    pages: 0,
    version: null,
    jumpOpen: false
  });
});
state = pathState();
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
history.replaceState(null, "", statePath());
render();
