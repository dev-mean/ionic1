(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name UserRecoveryPassCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('UserRecoveryPassCtrl', UserRecoveryPassController);

  function UserRecoveryPassController(User, Notify) {
    var vm = this;
    vm.form = {};
    vm.submitForgot = submitForgot;

    function submitForgot() {
      User
        .forgot(vm.form)
        .then(function (resp) {
          console.log(resp);
        })
        .catch(function (resp) {
          Notify.alert('Ops', resp);
        });
    }
  }


})();