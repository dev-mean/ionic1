(function () {
  'use strict';
  angular
    .module('ngCache', ['angular-cache'])
    .config(cacheConfig)
    .factory('Cache', Cache);

  function cacheConfig(CacheFactoryProvider) {
    angular.extend(CacheFactoryProvider.defaults, {
      maxAge: 15 * 60 * 1000
    });
  }

  function Cache(CacheFactory) {

    return {
      model: model,
      data: data
    };

    function model(model, options) {
      if (!CacheFactory.get(model)) {
        CacheFactory.createCache(model, {
          deleteOnExpire: options.deleteOnExpire || 'aggressive',
          recycleFreq: options.recycleFreq || 60000,
          storageMode: options.mode || 'localStorage'
        });
      }

      return CacheFactory.get(model);
    }

    function data(modelName, keys) {
      var cache = model(modelName);
      var keys = cache.keys();
      var data = [];
      keys.map(function (key) {
        data.push(cache.get(key));
      });

      return data;
    }


  }

})();