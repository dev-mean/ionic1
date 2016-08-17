(function () {
  'use strict';


  angular
    .module('ion-photo')
    .factory('CamanJs', CamanJsFactory);

  function CamanJsFactory($q) {
    var Caman = window.Caman;
    var filters = [
      'normal',
      'vintage',
      'lomo',
      'clarity',
      'sinCity',
      'sunrise',
      'crossProcess',
      'orangePeel',
      'love',
      'grungy',
      'jarques',
      'pinhole',
      'oldBoot',
      'glowingSun',
      'hazyDays',
      'herMajesty',
      'nostalgia',
      'hemingway',
      'concentrate'
    ];

    return {
      filters: filters,
      effect: filter,
      reset: resetEffect
    };

    function filter(elem, effect, status) {
      var defer = $q.defer();
      var image = window.document.getElementById(elem);

      if (image) {
        Caman(image, function () {
          if (effect === 'normal') {
            this.revert();
            this.render(function () {
              defer.resolve(effect);
            });
          }

          if (effect in this) {
            this[effect]();

            if (status) {
              this.revert();
            }
            this.render(function () {
              defer.resolve(effect);
            });
          }

        });
      } else {
        defer.reject();
      }
      return defer.promise;
    }

    function resetEffect(elem) {

      var defer = $q.defer();
      var image = window.document.getElementById(elem);

      Caman(image, function () {
        this.revert();
        defer.resolve(true);
      });

      return defer.promise;
    }
  }
})();