(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name PhotogramProfileCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('PhotogramProfileCtrl', PhotogramProfileController);

  function PhotogramProfileController($stateParams, $scope, $ionicSideMenuDelegate, Photogram, User) {
    var vm = this;
    vm.changeTab = changeTab;
    vm.user = {};

    init();
    changeTab('list');
    $scope.showMenu = function() {
      $ionicSideMenuDelegate.toggleLeft();
    }
    function changeTab(tab) {
      if (tab === 'list') {
        vm.tab = {
          list: true,
          grid: false
        };
      } else {
        vm.tab = {
          list: false,
          grid: true
        };
      }
    }

    function init() {
      getFollower();
      getGallery();
    }

    function getFollower() {
      vm.loadingFollowers = true;
      vm.loadingFollowing = true;
      vm.loadingPhotos = true;

      Photogram
        .getUserGalleryQtd()
        .then(function (qtdPhotos) {
          console.log(qtdPhotos);
          vm.user.qtdPhotos = qtdPhotos;
          vm.loadingPhotos = false;
        });

      User
        .getFollowers()
        .then(function (qtdFollowers) {
          console.log('qtdFollower: seguindo', qtdFollowers);
          vm.user.qtdFollowers = qtdFollowers;
          vm.loadingFollowers = false;
        });

      User
        .getFollowing()
        .then(function (qtdFollowing) {
          console.log('qtdFollowing: seguidores', qtdFollowing);
          vm.user.qtdFollowing = qtdFollowing;
          vm.loadingFollowing = false;
        });
    }


    function getGallery() {
      vm.loading = true;

      Photogram
        .getUserGallery()
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
  }


})();