(function () {
  'use strict';
  angular
    .module('app.activity')
    .config(configRoutes);

  var path = 'app/module/photogram/module/activity';

  function configRoutes($stateProvider, $translatePartialLoaderProvider) {

    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('photogram.activity', {
        url: '/activity',
        views: {
          tabActivity: {
            controller: 'PhotogramActivityCtrl',
            controllerAs: 'vm',
            templateUrl: path + '/view/photogram.activity.html'
          }
        }
      })

    ;
  }

})();