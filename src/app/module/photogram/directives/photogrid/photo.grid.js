(function () {
  'use strict';
  angular
    .module('app.photogram')
    .directive('photogramPhotoGrid', photogramPhotoGrid);


  function photogramPhotoGrid(AppConfig) {

    var path = AppConfig.path;

    return {
      restrict: 'E',
      scope: {
        data: '=photogram',
        profile: '=',
        loading: '='
      },
      templateUrl: path + '/directives/photogrid/photogram.photos.grid.html'
    };

  }


})();