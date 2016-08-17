(function () {
  'use strict';


  angular
    .module('ion-location')
    .factory('GeoService', GeoService);

  function GeoService($http, $window, $cordovaGeolocation, $ionicPopup, Loading, $timeout, $q) {

    /**
     'street_address', //indicates a precise street address.
     'route', //indicates a named route (such as "US 101").
     'intersection', //indicates a major intersection, usually of two major roads.
     'political', //indicates a political entity. Usually, this type indicates a polygon of some civil administration.
     'country', //indicates the national political entity, and is typically the highest order type returned by the Geocoder.
     'administrative_area_level_1', //indicates a first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels.
     'administrative_area_level_2', //indicates a second-order civil entity below the country level. Within the United States, these administrative levels are counties. Not all nations exhibit these administrative levels.
     'administrative_area_level_3', //indicates a third-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
     'colloquial_area', //indicates a commonly-used alternative name for the entity.
     'locality', //indicates an incorporated city or town political entity.
     'sublocality', //indicates an first-order civil entity below a locality
     'neighborhood', //indicates a named neighborhood
     'premise', //indicates a named location, usually a building or collection of buildings with a common name
     'subpremise', //indicates a first-order entity below a named location, usually a singular building within a collection of buildings with a common name
     'postal_code', //indicates a postal code as used to address postal mail within the country.
     'natural_feature', //indicates a prominent natural feature.
     'airport', //indicates an airport.
     'park', //indicates a named park.
     'point_of_interest', //indicates a named point of interest. Typically, these "POI"s are prominent local entities that don't easily fit in another category such as "Empire State Building" or "Statue of Liberty."

     //In addition to the above, address components may exhibit the following types:

     'post_box', //indicates a specific postal box.
     'street_number', //indicates the precise street number.
     'floor indicates', //the floor of a building address.
     'room indicates'; //the room of a building address.'
     */
    var options = {
      types: ['geocode']
    };
    var autocompleteService = new $window.google.maps.places.AutocompleteService();
    var detailsService = new $window.google.maps.places.PlacesService($window.document.createElement('input'),
      options);
    var componentForm = {
      street_number: 'long_name',
      //number
      route: 'long_name',
      //street
      locality: 'long_name',
      // district
      sublocality: 'long_name',
      // district
      neighborhood: 'long_name',
      //state
      political: 'long_name',
      //state
      administrative_area_level_1: 'long_name',
      //state
      country: 'long_name',
      //country
      postal_code: 'long_name' //zipcode
    };
    var componentFormName = {
      street_number: 'number',
      //number
      route: 'street',
      //street
      locality: 'city',
      // district
      administrative_area_level_1: 'state',
      //state
      country: 'country',
      //country
      postal_code: 'zipcode',
      //zipcode
      neighborhood: 'district' //zipcode
    };

    var data = {
      coords: {},
      src: ''
    };


    return {
      src: src,
      getDetails: getDetails,
      searchAddress: searchAddress,
      parseAddress: parseAddress,
      findMe: findMe
    };

    function getLocation() {
      // Pega a Localização da Pessoa
      Loading.start();
      var defer = $q.defer();

      if (data.location) {
        $timeout(function () {
          defer.resolve(data.location);
          Loading.end();
        }, 1000);
      } else {
        var posOptions = {
          timeout: 10000,
          enableHighAccuracy: false
        };
        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            console.log('Fez a requisição', position);

            data.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            Loading.end();
            defer.resolve(data.location);
          }, function (err) {
            // error
            console.log('Error na geolocalização', err);
            $ionicPopup.alert({
              title: 'Geo Error',
              template: err.message
            });
            Loading.end();
            defer.reject(err);
          });
      }


      return defer.promise;
    }


    function findMe() {
      var defer = $q.defer();

      getLocation()
        .then(function (pos) {
          console.log(pos);
          getGoogleAddress(pos.latitude, pos.longitude)
            .success(function (resp) {
              resp.geolocation = pos;
              console.log(resp);
              defer.resolve(resp);
            })
            .error(logErr);
        });
      return defer.promise;
    }


    function logErr(error) {
      console.log(error);
    }

    function getGoogleAddress(lat, lng) {
      return $http.get('http://maps.google.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&sensor=true')
        .success(function (data) {
          data.address_normal = data.results[0].formatted_address;
          data.address = address(data.results[0].address_components);
          data.src = imagem(lat, lng, 18, 500, 300);
        });
    }

    function address(data) {
      if (!data) {
        return false;
      } else {
        return {
          numero: data[0].short_name,
          rua: data[1].long_name,
          bairro: data[2].short_name,
          cidade: data[3].short_name,
          estado: data[5].long_name,
          uf: data[5].short_name,
          pais: data[6].long_name,
          paisCode: data[6].short_name,
          cep: data[7].short_name
        };
      }

    }

    function imagem(lat, lng, zoom, w, h) {
      return 'http://maps.google.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=' + zoom + '&size=' +
        w + 'x' + h + '&maptype=roadmap&sensor=true';
    }

    function parseAddress(place) {
      console.log('parseAddress', place);
      var address = {
        resume: '',
        geo: {
          latitude: place.geometry.location.H,
          longitude: place.geometry.location.L
        }
      };
      var image = src(address.geo.latitude, address.geo.longitude, 16, 900, 200);

      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
          var val = place.address_components[i][componentForm[addressType]];
          address[componentFormName[addressType]] = val;
        }
      }
      address.street = address.street + ', ' + address.number;
      address.image = image;
      address.resume = address.street + ' - ' + address.city + ', ' + address.state + ', ' + address.country;
      return address;
    }

    function searchAddress(input) {
      var deferred = $q.defer();
      autocompleteService.getQueryPredictions({
        input: input
      }, function (result) {
        deferred.resolve(result);
      });
      return deferred.promise;
    }

    function getDetails(placeId) {
      var deferred = $q.defer();
      detailsService.getDetails({
        placeId: placeId
      }, function (result) {
        deferred.resolve(result);
      });
      return deferred.promise;
    }

    function src(lat, lng, zoom, w, h) {
      console.log('src latitude', lat, lng, zoom, w, h);

      var link = 'http://maps.googleapis.com/maps/api/staticmap?center=' + lat + ',' + lng + '&zoom=' + zoom +
        '&scale=1&size=' + w + 'x' + h +
        '&maptype=roadmap&format=jpg&visual_refresh=true&markers=size:small%7Ccolor:0xff2600%7Clabel:0%7C' + lat +
        ',' + lng + '&sensor=true';
      console.log(link);
      return link;
    }

  }
})();