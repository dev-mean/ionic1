(function () {
  'use strict';

  angular
    .module('ion-photo')
    .factory('PhotoService', PhotoService);

  function PhotoService($ionicActionSheet, $translate, AppConfig, PhotogramShare, $jrCrop, $rootScope, $ionicModal,
    $cordovaCamera, $cordovaCapture, $q) {

    // Default Setting
    var tempImage;
    var cordova = window.cordova;
    var setting = {
      jrCrop: true,
      quality: 90,
      allowEdit: false,
      filter: true,
      correctOrientation: true,
      targetWidth: 300,
      targetHeight: 300,
      saveToPhotoAlbum: false,
      allowRotation: false,
      aspectRatio: 0
    };

    return {
      open: openModal,
      crop: cropModal,
      filter: filterModal,
      share: shareModal,
    };

    function openModal(option) {
      var defer = $q.defer();
      var options = {
        jrCrop: option.jrCrop ? option.jrCrop : setting.jrCrop,
        filter: option.filter ? option.filter : setting.filter,
        quality: option.quality ? option.quality : setting.quality,
        aspectRatio: option.aspectRatio ? option.aspectRatio : setting.aspectRatio,
        allowRotation: option.allowRotation ? option.allowRotation : setting.allowRotation,
        allowEdit: option.allowEdit ? option.allowEdit : setting.allowEdit,
        correctOrientation: option.correctOrientation ? option.correctOrientation : setting.correctOrientation,
        targetWidth: option.width ? option.width : setting.targetWidth,
        targetHeight: option.height ? option.height : setting.targetHeight,
        saveToPhotoAlbum: option.saveToPhotoAlbum ? option.saveToPhotoAlbum : setting.saveToPhotoAlbum,
        destinationType: window.cordova ? Camera.DestinationType.FILE_URI : null,
        encodingType: window.cordova ? Camera.EncodingType.JPEG : null,
        popoverOptions: window.cordova ? CameraPopoverOptions : null,
      };
      var buttons = [{
        text: '<i class="icon ion-ios-camera"></i>' + $translate.instant('ION-PHOTO.CAMERA')
      }, {
        text: '<i class="icon ion-images"></i>' + $translate.instant('ION-PHOTO.GALLERY')
      }, {
        text: '<i class="icon ion-ios-videocam"></i>' + $translate.instant('ION-PHOTO.VIDEO')
      }];
      var actionSheet = $ionicActionSheet.show({
        buttons: buttons,
        titleText: $translate.instant('ION-PHOTO.SHARE'),
        cancelText: $translate.instant('ION-PHOTO.CANCEL'),
        cancel: buttonCancel,
        buttonClicked: buttonClicked
      });

      function buttonClicked(index) {
        console.log(index);
        actionSheet();
        capture(index, options)
          .then(cropModal)
          .then(filterModal)
          .then(function (resp) {
            console.log('Final rest');
            defer.resolve(resp);
          })
          .catch(buttonCancel);
      }


      function buttonCancel(resp) {
        actionSheet(resp);
      }

      return defer.promise;
    }

    function cropModal(image) {
      var defer = $q.defer();

      if (setting.jrCrop) {
        $jrCrop
          .crop({
            url: image,
            aspectRatio: setting.aspectRatio ? setting.aspectRatio : false,
            allowRotation: setting.allowRotation ? setting.allowRotation : false,
            width: setting.width ? setting.width : setting.targetWidth,
            height: setting.height ? setting.height : setting.targetHeight,
            cancelText: $translate.instant('ION-PHOTO.CANCEL'),
            chooseText: $translate.instant('ION-PHOTO.CROP')
          })
          .then(function (canvas) {
            defer.resolve(canvas.toDataURL());
          })
          .catch(defer.reject);
      } else {
        defer.resolve(image);
      }
      return defer.promise;
    }

    function shareModal(image) {
      var template =
        '<ion-modal-view class="modal-share"> <ion-header-bar class="bar-dark"> <div class="title">{{ \'ION-PHOTO.SHARE\' | translate }}</div> <button class="button button-positive" ng-click="modal.hide()"> <i class="icon ion-arrow-right-b"></i> </button> </ion-header-bar> <ion-content ng-cloak> <div id="image"> <img ng-src="{{form.photo}}"> <div class="title">{{ form.title }}</div></div> <ul class="list"> <li class="padding"> <button ng-repeat="social in sociais" ng-click="share(form, social)"class="button button-block button-{{ social }}"><i class="icon ion-social-{{ social }}"></i>{{ social | uppercase }} </button> </li> </ul> </ion-content> </ion-modal-view>';

      if (image === undefined) return false;
      var scope = $rootScope.$new(true);
      var socials = [
        'facebook',
        'instagram',
        'whatsapp',
        'twitter'
      ];
      //image = image.attributes;

      scope.sociais = socials;
      scope.share = shareSocial;
      scope.form = {
        title: '',
        photo: image
      };

      scope.modal = $ionicModal.fromTemplate(template, {
        scope: scope
      });
      scope.modal.show();


      function shareSocial(social, form) {
        console.log('share', social, form);
        PhotogramShare
          .share(social, {
            text: form.title,
            image: form.photo,
            link: AppConfig.app.url
          });
      }


    }

    function filterModal(image) {
      var defer = $q.defer();

      function openFilter(image) {
        var templateFilter =
          '<ion-modal-view class="modal-capture"><ion-header-bar class="bar-dark"><button class="button button-clear button-icon ion-ios-arrow-thin-left" ng-click="cropImage()"></button><div class="title">{{ \'ION-PHOTO.FILTERS\' | translate }}</div><button class="button button-icon " ng-click="submitFilter()"><i class="icon ion-ios-arrow-thin-right"></i></button></ion-header-bar><ion-content><photo-filter image="form.photo"></photo-filter></ion-content></ion-modal-view>';
        var scope = $rootScope.$new(true);
        scope.closeFilter = closeFilter;
        scope.submitFilter = submitFilter;
        tempImage = image;
        scope.form = {
          photo: image
        };

        scope.modalFilter = $ionicModal.fromTemplate(templateFilter, {
          scope: scope
        });

        scope.cropImage = function () {
          scope.modalFilter.remove();
          cropModal(tempImage)
            .then(openFilter);
        };

        scope.modalFilter.show();

        function closeFilter() {
          defer.reject();
          scope.modalFilter.hide();
        }

        function submitFilter() {
          var canvas = window.document.getElementById('image');
          var dataUrl = canvas.toDataURL();
          scope.modalFilter.remove();
          defer.resolve(dataUrl);
        }

      }

      openFilter(image);

      return defer.promise;
    }


    function capture(type, options) {
      var defer = $q.defer();

      // CAMERA
      if (type === 0) {
        getPicture(0);
      }

      // GALLERY
      if (type === 1) {
        getPicture(1);
      }

      // Video
      if (type === 2) {
        getVideo();
      }

      function getPicture(method) {
        if (method === 0 && cordova) options.sourceType = Camera.PictureSourceType.CAMERA;
        if (method === 1 && cordova) options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;

        if (cordova) {
          $cordovaCamera
            .getPicture(options)
            .then(defer.resolve, defer.reject);
        } else {
          var fileInput = angular.element('<input type="file"/>');
          fileInput[0].click();
          fileInput.on('change', function (evt) {
            tempImage = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
              defer.resolve(evt.target.result);
            };
            reader.readAsDataURL(tempImage);
          });
        }
      }

      function getVideo() {
        $cordovaCapture
          .captureVideo({
            limit: 1,
            duration: 5
          })
          .then(function (mediaFiles) {
            tempImage = mediaFiles[0].fullPath;
            defer.resolve(tempImage);
          }, defer.reject);
      }


      return defer.promise;
    }
  }
})();