(function () {
  'use strict';
  angular
    .module('app.photogram')
    .factory('PhotogramSetting', PhotogramSettingFactory);

  function PhotogramSettingFactory($window, Cache, $q) {

    var CacheSetting = Cache.model('Setting', {
      mode: 'sessionStorage'
    });
    var SettingKeys = CacheSetting.keys();

    return {
      init: init,
      get: get
    };

    function init() {
      var defer = $q.defer();
      var data = [];

      if (SettingKeys.length) {
        var settings = Cache.data('Setting');
        console.log(settings);
        defer.resolve(settings);
      } else {
        new Parse
          .Query('GallerySetting')
          .find()
          .then(function (resp) {
            resp.map(function (item) {
              var obj = {
                key: item.attributes.key,
                value: item.attributes.value
              };
              CacheSetting.put(obj.key, obj.value);
              data.push(obj);

            });
            defer.resolve(data);
          }, error);
      }


      return defer.promise;

    }

    function error(err) {
      alert(err);
    }

    function get(key) {
      return CacheSetting.get(key);
    }

  }


})();