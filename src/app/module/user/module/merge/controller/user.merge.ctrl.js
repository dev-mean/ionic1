(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name UserMergeCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('UserMergeCtrl', UserMergeController);

  function UserMergeController(User, $rootScope, AppConfig, $state, Notify, UserForm) {
    var vm = this;
    vm.submitMerge = submitMerge;
    init();

    function init() {
      vm.form = $rootScope.tempUser;
      vm.form.password = '';
    }

    function submitMerge() {

      if (vm.form.password != '') {
        var dataForm = angular.copy(vm.form);
        var form = {
          email: dataForm.email,
          password: dataForm.password
        };

        console.log(form);

        User
          .login(form)
          .then(function (user) {
            console.log(user);
            User
              .facebookLink(user)
              .then(function (resp) {
                console.log(resp);
                $state.go(AppConfig.routes.home, {
                  clear: true
                })
              })
          })
          .catch(function (resp) {
            Notify.alert({
              title: 'Ops',
              text: resp.message
            });
          });
      } else {
        Notify.alert({
          title: ('Invalid form'),
          text: ('Please enter your email')
        });
      }

    }

  }


})();