(function () {
  'use strict';

  angular
    .module('ionic-cache-src')
    .factory('cacheSrcStorage', cacheSrcStorage);

  function cacheSrcStorage($localStorage) {
    var c = {};
    c._cache = $localStorage.cache_src;
    c.get = function (url) {
      return c._cache[url] && (getCacheDir() + c._cache[url]);
    };
    c.set = function (url, localUrl) {
      c._cache[url] = localUrl;
      return c;
    };
    return c;
  }
})();