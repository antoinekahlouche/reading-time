(function () {
  if (!Array.prototype.find) {
    Array.prototype.find = function (predicate, thisArg) {
      if (this == null) throw new TypeError("Array.prototype.find called on null or undefined");
      if (typeof predicate !== "function") throw new TypeError("predicate must be a function");

      var list = Object(this);
      var length = list.length >>> 0;
      for (var index = 0; index < length; index += 1) {
        var value = list[index];
        if (predicate.call(thisArg, value, index, list)) return value;
      }
      return undefined;
    };
  }

  if (!Array.prototype.findIndex) {
    Array.prototype.findIndex = function (predicate, thisArg) {
      if (this == null) throw new TypeError("Array.prototype.findIndex called on null or undefined");
      if (typeof predicate !== "function") throw new TypeError("predicate must be a function");

      var list = Object(this);
      var length = list.length >>> 0;
      for (var index = 0; index < length; index += 1) {
        if (predicate.call(thisArg, list[index], index, list)) return index;
      }
      return -1;
    };
  }

  if (!Number.isInteger) {
    Number.isInteger = function (value) {
      return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
    };
  }

  if (!Object.assign) {
    Object.assign = function (target) {
      if (target == null) throw new TypeError("Cannot convert undefined or null to object");

      var output = Object(target);
      for (var index = 1; index < arguments.length; index += 1) {
        var source = arguments[index];
        if (source == null) continue;

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) output[key] = source[key];
        }
      }
      return output;
    };
  }

  if (!window.Promise) {
    document.getElementById("app").innerHTML = '<section class="menu"><p class="eyebrow">Reading Time</p><h1>Update Needed</h1><p>This iPad is too old to open this bookshelf without a newer browser.</p></section>';
    throw new Error("Promise is not supported");
  }

  if (!window.fetch) {
    window.fetch = function (url, options) {
      options = options || {};
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(options.method || "GET", url, true);

        var headers = options.headers || {};
        for (var header in headers) {
          if (Object.prototype.hasOwnProperty.call(headers, header)) request.setRequestHeader(header, headers[header]);
        }

        request.onload = function () {
          var response = {
            ok: request.status >= 200 && request.status < 300,
            status: request.status,
            statusText: request.statusText,
            text: function () {
              return Promise.resolve(request.responseText);
            },
            json: function () {
              return Promise.resolve(JSON.parse(request.responseText));
            }
          };
          resolve(response);
        };

        request.onerror = function () {
          reject(new TypeError("Network request failed"));
        };

        request.send(options.body || null);
      });
    };
  }
}());
