(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name LoadingCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.loading')
    .controller('LoadingCtrl', LoadingController);

  function LoadingController($rootScope, AppConfig, $state) {
    var user = $rootScope.currentUser;
    console.log('User', user);

    if (user) {
      console.log(user);
      if (user.email) {
        $state.go(AppConfig.routes.home);
      } else {
        $state.go('profileSetup', {
          clear: true
        });
      }
    } else {
      $state.go('user.signin');
    }
  }


})();