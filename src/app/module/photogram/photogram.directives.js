(function () {
  'use strict';
  angular
    .module('app.photogram')
    .directive('photogramPhotoCapture', photogramPhotoCapture)
    .directive('photogramLoading', photogramLoading);

  function photogramLoading() {
    return {
      restrict: 'E',
      scope: {
        loading: '=',
        icon: '@'
      },
      template: '<div class="padding text-center loading" ng-show="loading"><ion-spinner icon="{{ icon }}"></ion-spinner></div>'
    };
  }


  function photogramPhotoCapture($ionicModal, $cordovaGeolocation, AppConfig, Loading, $state, PhotoService,
    Photogram) {

    var path = AppConfig.path;

    return {
      restrict: 'A',
      scope: {
        photogram: '@'
      },
      transclude: false,
      link: photogramPhotoCaptureLink
    };

    function photogramPhotoCaptureLink(scope, elem, attr) {

      scope.getGeo = getGeo;
      scope.formFields = Photogram.form;
      scope.open = open;
      scope.submitCapture = submitCapture;
      scope.closeModal = closeModal;
      elem.bind('click', openModalCapture);

      function init() {
        scope.loading = true;
        scope.comments = [];
        Photogram
          .getComments(scope.photogram)
          .then(function (resp) {
            scope.comments = resp;
            scope.loading = false;
          });

        scope.form = {
          photogramId: scope.photogram,
          text: ''
        };
      }

      function openModalCapture() {
        console.log(scope.photogram);


        $ionicModal.fromTemplateUrl(path + '/view/photogram.capture.modal.html', {
          scope: scope
        }).then(function (modal) {
          scope.modal = modal;
          scope.modal.show();
        });
      }


      function init() {
        scope.active = false;
        scope.form = {
          title: '',
          location: '',
          photo: '',
          geo: false
        };

        scope.map = {
          center: {
            latitude: -23.5333333,
            longitude: -46.6166667
          },
          scrollwheel: false,
          zoom: 15
        };
        scope.data = '';
        scope.loading = false;

      }

      function getLocation() {
        var posOptions = {
          timeout: 10000,
          enableHighAccuracy: false
        };

        if (scope.form.location === '') {

          scope.loading = false;

          $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {

              scope.here = {
                id: 1,
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
                icon: 'img/pin.png'
              };

              scope.form.location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };

              scope.map.center = scope.here.coords;
              scope.loading = false;

              console.log(scope.form);
              console.log(scope.here);
              console.log(position);
            }, function (err) {
              // error
            });
        }
      };

      function getGeo(resp) {
        if (resp) getLocation();
      }

      function open() {
        init();
        PhotoService
          .open()
          .then(function (resp) {
            scope.loading = false;
            scope.active = true;
            scope.form.photo = resp;
            scope.data = 'data:image/jpeg;base64,' + resp;
            // angular.element ('.title').focus ();
          })
          .catch(function () {
            $state.go('photogram.home');
          });
      }

      function submitCapture() {

        var canvas = window.document.getElementById('image');
        var dataUrl = canvas.toDataURL();
        var dataForm = angular.copy(scope.form);

        console.log('submit', dataUrl);

        return false;

        Loading.start();
        Photogram
          .add(dataForm)
          .then(function (resp) {
            $state.go('photogram.home', {
              reload: true
            });
            init();
            Loading.end();
          });
      }

      function closeModal() {
        scope.modal.hide();
        scope.modal.remove();
      }
    }
  }

})();