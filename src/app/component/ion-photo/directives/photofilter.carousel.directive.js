(function () {
  'use strict';

  angular
    .module('ion-photo')
    .directive('photoFilterCarousel', photoFilterCarousel);

  function photoFilterCarousel(CamanJs, config) {
    return {
      restrict: 'E',
      scope: {
        image: '=',
        apply: '='
      },
      templateUrl: config.path + '/view/photo.filter.carousel.html',
      link: function ($scope) {
        $scope.filters = CamanJs.filters;
        $scope.applyFilter = $scope.apply;
      }
    };
  }

})();