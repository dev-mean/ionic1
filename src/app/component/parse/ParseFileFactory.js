(function () {
  'use strict';
  angular
    .module('ngParse')
    .factory('ParseFile', ParseFileFactory);

  /*
   * params
   * .object
   * .title
   * .photo
   *  .. filename
   *  .. photo = base64
   *  .geo
   *  .. class
   *  .. lat
   *  .. lng
   *
   * */

  function ParseFileFactory($q) {
    return {
      upload: upload
    };

    function upload(_params) {
      var defer = $q.defer();
      var ImageObject = Parse.Object.extend(_params.object || 'Gallery');

      if (_params.photo !== '') {

        // create the parse file
        var imageFile = new Parse.File(_params.filename || 'mypic.jpg', {
          base64: _params.photo
        });

        // save the parse file
        imageFile
          .save()
          .then(function () {

            _params.photo = null;

            // create object to hold caption and file reference
            var imageObject = new ImageObject();

            // set object properties
            imageObject.set('title', _params.title);
            imageObject.set('user', Parse.User.current());
            imageObject.set('img', imageFile);

            if (_params.geo !== undefined) {
              imageObject.set(_params.geo.class || 'location', new Parse.GeoPoint(_params.geo.lat, _params.geo.lng));
            }

            // save object to parse backend
            imageObject
              .save()
              .then(defer.resolve);

          }, defer.reject);

      } else {
        // create object to hold caption and file reference
        var imageObject = new ImageObject();

        // set object properties
        imageObject.set('caption', _params.caption);

        // save object to parse backend
        return imageObject.save();

      }


      return defer.promise;
    }

  }

})();