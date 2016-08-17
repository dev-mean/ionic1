(function () {
  'use strict';
  angular
    .module('app.loading')
    .config(configRoutes);

  var path = 'app/module/loading';

  function configRoutes($stateProvider) {
    $stateProvider
      .state('router', {
        url: '/',
        templateUrl: path + '/view/loading.html',
        controller: 'LoadingCtrl',
        controllerAs: 'vm'
      });
  }

})();