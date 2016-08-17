(function () {
  'use strict';
  angular
    .module('app.home')
    .config(configRoutes);

  var path = 'app/module/photogram/module/home';

  function configRoutes($stateProvider) {
    $stateProvider
      .state('photogram.home', {
        url: '/home',
        views: {
          tabHome: {
            controller: 'PhotogramHomeCtrl',
            controllerAs: 'vm',
            templateUrl: path + '/view/home.html'
          }
        }
      });

  }

})();