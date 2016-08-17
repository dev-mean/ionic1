(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name PhotogramTabsCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.photogram')
    .controller('PhotogramTabsCtrl', PhotogramTabsController);

  function PhotogramTabsController($scope, $state, AppConfig, $rootScope, Photogram, $ionicModal, Loading,
    PhotogramSetting, PhotoService) {
    var vm = this;
    var path = AppConfig.path;
    vm.postPhoto = open;

    function open() {
      var option = {
        crop: PhotogramSetting.get('imageCrop'),
        allowEdit: PhotogramSetting.get('imageEdit'),
        filter: true,
        //filter: PhotogramSetting.get('imageFilter'),
        allowRotation: PhotogramSetting.get('imageRotation'),
        quality: PhotogramSetting.get('imageQuality'),
        correctOrientation: PhotogramSetting.get('imageEdit'),
        targetWidth: PhotogramSetting.get('imageWidth'),
        targetHeight: PhotogramSetting.get('imageHeight'),
        saveToPhotoAlbum: PhotogramSetting.get('imageSaveAlbum')
      };
      console.log(option);

      PhotoService
        .open(option)
        .then(modalPost)
        .catch(goHome);
    }


    function goHome() {
      console.warn('Deu erro');
      $state.go('photogram.home');
    }

    function modalPost(image) {
      $scope.closePost = closeModalPost;
      $scope.submitPost = submitPost;
      $scope.form = {
        title: '',
        location: '',
        photo: image,
        geo: false
      };

      $ionicModal
        .fromTemplateUrl(path + '/module/share/view/photogram.post.modal.html', {
          scope: $scope,
          focusFirstInput: true
        })
        .then(function (modal) {
          $scope.form.photo = image;
          $scope.modalPost = modal;
          $scope.modalPost.show();
        });

      function closeModalPost() {
        $scope.modalPost.hide();
        $scope.modalPost.remove();
        Loading.end();
      }

      function submitPost(resp) {
        var form = angular.copy(resp);
        console.log(form);
        Loading.start();
        Photogram
          .post(form)
          .then(function () {
            closeModalPost();
            $rootScope.$emit('filterModal:close');
            $rootScope.$emit('PhotogramHome:reload');
          });
      }
    }
  }

})();