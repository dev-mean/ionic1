(function () {
  'use strict';

  angular
    .module('ion-photo')
    .factory('PhotoFilter', PhotoFilter);

  function PhotoFilter($rootScope, $q, $ionicModal) {

    return {
      load: modalFilter
    };

    function modalFilter(image, done) {
      var template =
        '<ion-modal-view class="modal-capture"><ion-header-bar class="bar-dark"><button class="button button-clear button-icon ion-ios-arrow-thin-left"ng-click="closeCapture()"></button><div class="title text-left">{{ \'ION-PHOTO.FILTERS\' | translate }}</div><button class="button button-clear button-icon ion-ios-arrow-thin-right"ng-click="submitCapture()"></button></ion-header-bar><ion-content scroll="false"><photo-filter image="form.photo"></photo-filter></ion-content></ion-modal-view>';
      var image = image.toDataURL();

      var scope = $rootScope.$new(true);
      scope.closeCapture = closeModalCapture;
      scope.submitCapture = submitCapture;
      scope.form = {
        photo: image
      };

      scope.modal = $ionicModal.fromTemplate(template, {
        scope: scope
      });

      scope.modal.show();


      function submitCapture() {
        var canvas = window.document.getElementById('image');
        var dataUrl = canvas.toDataURL();
        console.log(dataUrl);
        done(dataUrl);
        closeModalCapture();
      }

      function closeModalCapture() {
        scope.modal.hide();
      }

    }

  }
})();