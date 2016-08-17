(function () {
  'use strict';

  angular
    .module('ion-photo')
    .directive('ionCrop', ionCrop);

  function ionCrop($jrCrop, $translate, $ionicActionSheet) {

    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
        option: '=',
        cropSave: '&'
      },
      template: '<div><input type="file" id="browseBtn" image="image" accept="image/*" style="display: none"/></div>',
      link: ionCropLink
    };

    function ionCropLink($scope, element) {

      // Triggered on a button click, or some other target
      $scope.action = action;
      element.bind('click', getElem);
      $scope.crop = crop;
      angular.element(document.getElementById('browseBtn'))
        .on('change', fileUpload);


      function getElem() {
        document.getElementById('browseBtn')
          .click();
      }

      function action() {

        // Show the action sheet
        $ionicActionSheet.show({
          buttons: [{
            text: '<i class="icon ion-camera"></i>' + ('Photo Camera')
          }, {
            text: '<i class="icon ion-images"></i> ' + ('Photo Album')
          }],
          //destructiveText:  ('Delete'),
          titleText: ('Change Image'),
          cancelText: ('Cancel'),
          cancel: function () {
            // add cancel code..
          },
          buttonClicked: function (index) {

            if (index === 0) {
              console.log('Photo Camera');
            }
            // Photo Album
            if (index === 1) {
              document.getElementById('browseBtn')
                .click();
            }
            return true;
          }
        });

      }

      function fileUpload(e) {

        var file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function (event) {
          var image = event.target.result;
          $scope.crop(image);
        };

        // Clear input file
        angular.element(document.getElementById('browseBtn')).val('');

      }

      function crop(image) {

        console.log($scope.option);

        $jrCrop
          .crop({
            url: image,
            width: $scope.option ? $scope.option.width : 200,
            height: $scope.option ? $scope.option.height : 200,
            cancelText: ('Cancel'),
            chooseText: ('Save')
          })
          .then(function (canvas) {
            var image = canvas.toDataURL();
            //            var name = $scope.option ? $scope.option.name : 'thumb';
            //            var filename = ($scope.option ? $scope.option.name : '') + '_' + name + window.Number(new window.Date() + '.jpg';

            //var file = base64ToBlob(image.replace('data:image/png;base64,', ''), 'image/jpeg');
            //            file.name = filename;

            //upload(file);

            console.log(image);
            $scope.ngModel = image;


          });

      }
    }
  }

})();