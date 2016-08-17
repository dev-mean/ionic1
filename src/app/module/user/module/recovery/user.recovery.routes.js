(function () {
  'use strict';
  var path = 'app/module/user/module/recovery';

  angular
    .module('user.recovery')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {
    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider

    ;

  }

})();