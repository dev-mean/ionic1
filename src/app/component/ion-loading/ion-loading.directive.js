(function () {
  'use strict';

  angular
    .module('ionic-loading')
    .directive('ionLoading', ionLoading);

  function ionLoading() {
    return {
      restrict: 'E',
      scope: {
        icon: '@',
        loading: '='
      },
      template: '<div class="padding text-center loading" ng-show="loading"><ion-spinner icon="{{ icon }}"></ion-spinner></div>'
    };
  }
})();