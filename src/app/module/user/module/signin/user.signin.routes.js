(function () {
  'use strict';
  var path = 'app/module/user/module/signin';

  angular
    .module('user.merge')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {
    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('user.signin', {
        url: '/signin',
        views: {
          tabLogin: {
            controller: 'UserSigninCtrl',
            controllerAs: 'vm',
            templateUrl: path + '/view/user.signin.html'
          }
        }
      });

  }

})();