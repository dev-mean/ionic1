(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name openTerms
   *
   * @description
   * _Please update the description and restriction._
   *
   * @restrict A
   * */

  angular
    .module('app.user')
    .directive('openTerms', openTermsDirective);

  function openTermsDirective($cordovaInAppBrowser, AppConfig) {
    return {
      restrict: 'A',
      template: '',
      link: function (scope, elem, attr) {

        elem.bind('click', openModal);
        scope.closeModal = closeModal;

        function openModal() {
          console.log(scope.ngModel);

          $cordovaInAppBrowser
            .open(AppConfig.app.url, '_blank', {
              location: 'no',
              clearcache: 'yes',
              toolbar: 'yes'
            })
            .then(function (event) {
              // success
            })
            .catch(function (event) {
              // error
            });
        }

        function closeModal() {
          scope.modal.hide();
          scope.modal.remove();
        }
      }
    }
  }

})();