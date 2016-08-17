(function () {
  'use strict';
  var path = 'app/module/user';

  angular
    .module('app.user')
    .config(addRoute);

  function addRoute($stateProvider, $urlRouterProvider, $translatePartialLoaderProvider) {
    $translatePartialLoaderProvider.addPart(path);

    $stateProvider

      .state('user', {
      url: '/user',
      abstract: true,
      templateUrl: path + '/view/user.tabs.html'
    });

    $urlRouterProvider.otherwise('/');

  }

})();