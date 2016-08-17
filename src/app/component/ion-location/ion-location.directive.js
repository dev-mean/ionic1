(function () {
  'use strict';

  angular
    .module('ion-location')
    .directive('ionLocation', ionLocation);

  function ionLocation($ionicModal, GeoService) {
    return {
      restrict: 'A',
      scope: {
        location: '='
      },
      link: ionLocationLink
    };

    function ionLocationLink($scope, element) {

      function init() {
        $scope.search = {};
        $scope.search.suggestions = [];
        $scope.search.query = '';
      }


      function selectPlace(place_id) {
        GeoService
          .getDetails(place_id)
          .then(function (location) {

            console.info(location);

            var address = GeoService
              .parseAddress(location);

            $scope.location = {
              number: address.number,
              street: address.street,
              district: address.district,
              city: address.city,
              state: address.state,
              country: address.country,
              zipcode: address.zipcode,
              coords: address.geo,
              image: address.image,
              resume: address.resume
            };

            console.log($scope.location);
            $scope.closeModalLocation();
          });
      }

      element.bind('focus', function () {
        init();
        console.log('Start');

        $scope.findMe = findMe;
        $scope.choosePlace = choosePlace;


        $scope.modalLocation = $ionicModal.fromTemplate('<ion-modal-view>' +
          '<ion-header-bar class="bar bar-positive item-input-inset">' +
          '<button class="button button-clear button-icon ion-pinpoint" ng-click="findMe()"></button>' +
          '<label class="item-input-wrapper">' +
          '<input type="search" ng-model="search.query" placeholder="{{ \'Search\' | translate }}"></label>' +
          '<button class="button button-clear button-icon ion-ios-close-empty" ng-click="closeModalLocation()"></button>' +
          '</ion-header-bar>' +
          '<ion-content padding="false">' +
          '<ion-list>' +
          '<ion-item ng-repeat="suggestion in search.suggestions" ng-click="choosePlace(suggestion)" ng-bind="suggestion.description"></ion-item>' +
          '<ion-item class="item-divider"><img src="https://developers.google.com/maps/documentation/places/images/powered-by-google-on-white.png"alt=""/></ion-item>' +
          '</ion-list>' +
          '</ion-content>' +
          '</ion-modal-view>', {
            scope: $scope,
            focusFirstInput: true
          }
        );

        $scope.modalLocation.show();

        $scope.closeModalLocation = function () {
          $scope.modalLocation.hide();
          $scope.modalLocation.remove();
        };

        GeoService
          .searchAddress('São Paulo')
          .then(function (result) {
            console.log(result);
            $scope.search.suggestions = result;
          });


        $scope.$watch('search.query', function (newValue) {
          if (newValue) {
            GeoService
              .searchAddress(newValue)
              .then(function (result) {
                console.log(result);
                $scope.search.suggestions = result;
              });
          }
        });


        function findMe() {
          GeoService
            .findMe()
            .then(function (location) {
              console.log(location);

              selectPlace(location.results[0].place_id);

            });
        }

        function choosePlace(place) {
          selectPlace(place.place_id);

        }

      });

    }
  }
})();