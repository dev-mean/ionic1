(function () {
  'use strict';
  var path = 'app/module/user/module/signup';

  angular
    .module('user.merge')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {
    //$translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('user.signup', {
        url: '/signup',
        views: {
          tabLogin: {
            controller: 'UserSignupCtrl',
            controllerAs: 'vm',
            templateUrl: path + '/view/user.signup.html'
          }
        }
      });

  }

})();