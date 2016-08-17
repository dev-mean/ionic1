(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name LogoutCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('LogoutCtrl', LogoutController);

  function LogoutController(User) {
    User.logout();
  }

})();