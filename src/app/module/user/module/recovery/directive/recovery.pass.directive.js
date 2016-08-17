(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name recoveryPass
   *
   * @description
   * _Please update the description and restriction._
   *
   * @restrict E
   * */

  angular
    .module('app.user')
    .directive('recoveryPass', recoveryPassDirective);

  function recoveryPassDirective(User, $ionicPopup, Loading, Notify) {
    return {
      restrict: 'A',
      scope: {
        login: '@',
        register: '@',
      },
      link: function ($scope, elem) {

        elem.bind('click', openModal);

        function openModal() {

          $scope.form = {
            recovery: ''
          };

          $scope.erro = '';

          $scope.text = {
            button: (''),
            input: ('Email')
          };

          $ionicPopup
            .show({
              scope: $scope,
              template: '<div class="popup-recovery"><form name="form.recovery" form-manager><label class="item item-input"><i class="icon ion-email placeholder-icon"></i><input type="email" ng-model="email" id="email" name="email" placeholder="{{ text.input }}" required ng-maxlength="80"></label><span class="error-msg">{{erro}}</span></form></div>',
              title: ('A new password will be sent to your e-mail address'),
              buttons: [{
                text: ('Cancel'),
                type: 'button-positive'
              }, {
                text: ('Send'),
                type: 'button-positive',
                onTap: function (e) {
                  if ($scope.form.recovery.$valid) {
                    return $scope.form.recovery.email.$viewValue;
                  } else {
                    //não permite o usuário fechar até ele digitar o email
                    e.preventDefault();
                    $scope.erro = ('Invalid Email');
                  }
                }
              }]
            })
            .then(function (res) {
              if (!angular.isUndefined(res)) {
                var email = res;

                console.log(res);

                Loading.start();

                User
                  .forgot(email)
                  .then(function (resp) {
                    console.log(resp);
                    Notify.alert({
                      login: ('Forgot your password'),
                      text: ('Access your accout mail')
                    });
                    Loading.end();
                  })
                  .catch(function (resp) {
                    Notify.alert({
                      login: 'Ops',
                      text: resp
                    });
                    Loading.end();
                  });
              }
            });

        }
      }
    };
  }


})();