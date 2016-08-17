(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name userAvatar
   *
   * @description
   * _Please update the description and restriction._
   *
   * @restrict A
   * */

  angular
    .module('app.user')
    .directive('userAvatar', userAvatarDirective);

  function userAvatarDirective(PhotoService, PhotogramSetting, User) {
    return {
      restrict: 'A',
      scope: {
        gallery: '@'
      },
      template: '',
      link: function ($scope, elem) {

        elem.bind('click', openModal);

        function openModal() {

          var option = {
            allowEdit: PhotogramSetting.get('imageEdit'),
            filter: PhotogramSetting.get('imageFilter'),
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
            .then(function (imageData) {
              User
                .updateAvatar(imageData)
                .then(function (resp) {
                  console.log(resp);
                });
            })
            .catch(function (resp) {
              console.log(resp);
            });
        }

      }
    };
  }

})();