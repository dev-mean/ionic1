(function () {
  'use strict';

  angular
    .module('ion-photo')
    .directive('photoFilter', photoFilter);

  function photoFilter(config, CamanJs) {
    return {
      restrict: 'E',
      scope: {
        image: '='
      },
      templateUrl: config.path + '/view/photo.filter.html',
      link: function ($scope, elem) {
        $scope.applyFilter = function (elem, effect) {
          $scope.loading = true;
          if (effect) {
            CamanJs
              .effect(elem, effect, true)
              .then(function (resp) {
                $scope.loading = false;
              });
          }
        };
      }
    };
  }
})();