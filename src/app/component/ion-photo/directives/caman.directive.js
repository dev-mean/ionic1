(function () {
  'use strict';

  angular
    .module('ion-photo')
    .directive('caman', camanDirective);

  function camanDirective(CamanJs, $timeout) {
    return {
      restrict: 'A',
      scope: {
        name: '=',
        image: '=',
        filter: '=',
        loading: '='
      },
      template: '<img ng-src="{{ image }}" id="{{ name }}">',
      link: camanDirectiveLink
    };

    function camanDirectiveLink($scope) {
      $scope.loading = true;
      $timeout(function () {
        CamanJs
          .effect($scope.name, $scope.filter)
          .then(function () {
            $scope.loading = false;
          });
      }, 500);
    }
  }
})();