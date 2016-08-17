(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name UserProfileCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('UserProfileCtrl', UserProfileController);

  function UserProfileController($rootScope, User, UserForm) {
    var vm = this;
    vm.form = $rootScope.currentUser;
    vm.formFields = UserForm.profile;
    vm.submitProfile = submitProfile;

    function submitProfile(rForm, form) {
      if (rForm.$valid) {
        var formData = angular.copy(form);

        User
          .update(formData)
          .then(function (resp) {
            console.log(resp);
          });
      }
    }

  }

})();