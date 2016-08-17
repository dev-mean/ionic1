(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name PhotogramProfilePhotoCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('PhotogramProfilePhotoCtrl', PhotogramProfilePhotoController);

  function PhotogramProfilePhotoController(Photogram, $scope) {
    var vm = this;
    var user = Parse.User.current();
    vm.data = [];
    vm.empty = false;

    console.log('Profile Photo');

    Photogram
      .getUserGallery(user.id)
      .then(function (resp) {
        vm.data = resp;
        console.log(resp);
      })
      .then(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        vm.loading = false;
      })
      .catch(function () {
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        vm.loading = false;
      });
  }


})();