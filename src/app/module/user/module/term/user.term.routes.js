(function () {
  'use strict';
  var path = 'app/module/user/module/term';

  angular
    .module('user.merge')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {
    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider

    ;

  }

})();