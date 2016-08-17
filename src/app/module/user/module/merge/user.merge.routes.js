(function () {
  'use strict';
  var path = 'app/module/user/module/merge';

  angular
    .module('user.merge')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {
    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('usermerge', {
        url: '/merge',
        controller: 'UserMergeCtrl',
        controllerAs: 'vm',
        templateUrl: path + '/view/user.merge.html'
      });

  }

})();