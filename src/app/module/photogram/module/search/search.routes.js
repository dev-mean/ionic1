(function () {
  'use strict';
  angular
    .module('app.search')
    .config(configRoutes);

  var path = 'app/module/photogram/module/search';

  function configRoutes($stateProvider, $translatePartialLoaderProvider) {

    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('photogram.search', {
        url: '/search',
        abstract: true,
        views: {
          tabSearch: {
            templateUrl: path + '/view/photogram.search.tabs.html'
          }
        }
      })

    .state('photogram.search.grid', {
        url: '/grid',
        views: {
          tabGrid: {
            controller: 'PhotogramSearchGridCtrl',
            controllerAs: 'vm',
            templateUrl: path + '/view/photogram.search.grid.html'
          }
        }
      })
      .state('photogram.search.map', {
        url: '/map',
        views: {
          tabMap: {
            controller: 'PhotogramSearchMapCtrl',
            controllerAs: 'vm',
            templateUrl: path + '/view/photogram.search.map.html'
          }
        }
      })

    ;
  }

})();