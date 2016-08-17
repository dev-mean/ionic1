(function () {
  'use strict';
  var path = 'app/module/user/module/avatar';

  angular
    .module('user.avatar')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {
    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('useravatar', {
        url: '/avatar',
        controller: 'UserAvatarCtrl',
        controllerAs: 'vm',
        templateUrl: path + '/view/user.avatar.html'
      });

  }

})();