// -------------------------------------------------------------
// Rollbar - must be first
// -------------------------------------------------------------

(function () {
  var _rollbarConfig = {
    accessToken: '582a9a76d9f54e2cbd93d09944ac9de7',
    captureUncaught: true,
    payload: {
      environment: 'test'
    }
  };
  // Rollbar Snippet
  ! function (r) {
    function o(e) {
      if (t[e]) return t[e].exports;
      var n = t[e] = {
        exports: {},
        id: e,
        loaded: !1
      };
      return r[e].call(n.exports, n, n.exports, o), n.loaded = !0, n.exports
    }

    var t = {};
    return o.m = r, o.c = t, o.p = "", o(0)
  }([
    function (r, o, t) {
      "use strict";
      var e = t(1).Rollbar,
        n = t(2);
      _rollbarConfig.rollbarJsUrl = _rollbarConfig.rollbarJsUrl ||
        "https://d37gvrvc0wt4s1.cloudfront.net/js/v1.7/rollbar.min.js";
      var a = e.init(window, _rollbarConfig),
        i = n(a, _rollbarConfig);
      a.loadFull(window, document, !_rollbarConfig.async, _rollbarConfig, i)
    },
    function (r, o) {
      "use strict";

      function t() {
        var r = window.console;
        r && "function" == typeof r.log && r.log.apply(r, arguments)
      }

      function e(r, o) {
        return o = o || t,
          function () {
            try {
              return r.apply(this, arguments)
            } catch (t) {
              o("Rollbar internal error:", t)
            }
          }
      }

      function n(r, o, t) {
        window._rollbarWrappedError && (t[4] || (t[4] = window._rollbarWrappedError), t[5] || (t[5] = window._rollbarWrappedError
          ._rollbarContext), window._rollbarWrappedError = null), r.uncaughtError.apply(r, t), o && o.apply(
          window, t)
      }

      function a(r) {
        this.shimId = ++p, this.notifier = null, this.parentShim = r, this.logger = t, this._rollbarOldOnError =
          null
      }

      function i(r) {
        var o = a;
        return e(function () {
          if (this.notifier) return this.notifier[r].apply(this.notifier, arguments);
          var t = this,
            e = "scope" === r;
          e && (t = new o(this));
          var n = Array.prototype.slice.call(arguments, 0),
            a = {
              shim: t,
              method: r,
              args: n,
              ts: new Date
            };
          return window._rollbarShimQueue.push(a), e ? t : void 0
        })
      }

      function l(r, o) {
        if (o.hasOwnProperty && o.hasOwnProperty("addEventListener")) {
          var t = o.addEventListener;
          o.addEventListener = function (o, e, n) {
            t.call(this, o, r.wrap(e), n)
          };
          var e = o.removeEventListener;
          o.removeEventListener = function (r, o, t) {
            e.call(this, r, o && o._wrapped ? o._wrapped : o, t)
          }
        }
      }

      var p = 0;
      a.init = function (r, o) {
        var t = o.globalAlias || "Rollbar";
        if ("object" == typeof r[t]) return r[t];
        r._rollbarShimQueue = [], r._rollbarWrappedError = null, o = o || {};
        var i = new a;
        return e(function () {
          if (i.configure(o), o.captureUncaught) {
            i._rollbarOldOnError = r.onerror, r.onerror = function () {
              var r = Array.prototype.slice.call(arguments, 0);
              n(i, i._rollbarOldOnError, r)
            };
            var e, a, p =
              "EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload"
              .split(",");
            for (e = 0; e < p.length; ++e) a = p[e], r[a] && r[a].prototype && l(i, r[a].prototype)
          }
          return r[t] = i, i
        }, i.logger)()
      }, a.prototype.loadFull = function (r, o, t, n, a) {
        var i = function () {
            var o;
            if (void 0 === r._rollbarPayloadQueue) {
              var t, e, n, i;
              for (o = new Error("rollbar.js did not load"); t = r._rollbarShimQueue.shift();)
                for (n = t.args, i = 0; i < n.length; ++i)
                  if (e = n[i], "function" == typeof e) {
                    e(o);
                    break
                  }
            }
            "function" == typeof a && a(o)
          },
          l = !1,
          p = o.createElement("script"),
          u = o.getElementsByTagName("script")[0],
          s = u.parentNode;
        p.src = n.rollbarJsUrl, p.async = !t, p.onload = p.onreadystatechange = e(function () {
          if (!(l || this.readyState && "loaded" !== this.readyState && "complete" !== this.readyState)) {
            p.onload = p.onreadystatechange = null;
            try {
              s.removeChild(p)
            } catch (r) {}
            l = !0, i()
          }
        }, this.logger), s.insertBefore(p, u)
      }, a.prototype.wrap = function (r, o) {
        try {
          var t;
          if (t = "function" == typeof o ? o : function () {
              return o || {}
            }, "function" != typeof r) return r;
          if (r._isWrap) return r;
          if (!r._wrapped) {
            r._wrapped = function () {
              try {
                return r.apply(this, arguments)
              } catch (o) {
                throw o._rollbarContext = t() || {}, o._rollbarContext._wrappedSource = r.toString(), window._rollbarWrappedError =
                  o, o
              }
            }, r._wrapped._isWrap = !0;
            for (var e in r) r.hasOwnProperty(e) && (r._wrapped[e] = r[e])
          }
          return r._wrapped
        } catch (n) {
          return r
        }
      };
      for (var u = "log,debug,info,warn,warning,error,critical,global,configure,scope,uncaughtError".split(","), s =
          0; s < u.length; ++s) a.prototype[u[s]] = i(u[s]);
      r.exports = {
        Rollbar: a,
        _rollbarWindowOnError: n
      }
    },
    function (r, o) {
      "use strict";
      r.exports = function (r, o) {
        return function (t) {
          if (!t && !window._rollbarInitialized) {
            var e = window.RollbarNotifier,
              n = o || {},
              a = n.globalAlias || "Rollbar",
              i = window.Rollbar.init(n, r);
            i._processShimQueue(window._rollbarShimQueue || []), window[a] = i, window._rollbarInitialized = !0,
              e.processPayloads()
          }
        }
      }
    }
  ]);
  // End Rollbar Snippet

}());

/* Google Analytics
 * */

(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
    (i[r].q = i[r].q || [])
    .push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'http://www.google-analytics.com/analytics.js', 'ga');
ga('create', 'UA-53950213-5', {
  'cookieDomain': 'none'
});