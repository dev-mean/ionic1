(function () {
  'use strict';
  angular
    .module('app.intro')
    .config(configRoutes);

  var path = 'app/module/intro';

  function configRoutes($stateProvider, $translatePartialLoaderProvider) {
    $stateProvider
      .state('intro', {
        url: '/intro',
        templateUrl: path + '/view/intro.html',
        controller: 'IntroCtrl',
        controllerAs: 'vm'
      });

    // Translation
    $translatePartialLoaderProvider.addPart(path);
  }

})();