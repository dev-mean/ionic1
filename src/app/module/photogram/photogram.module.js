(function () {
  'use strict';
  var path = 'app/module/photogram';

  var starter = angular
    .module('app.photogram', [
      'ionic',
      'ngCordova',
      'ngMaterial',
      'app.account',
      'app.activity',
      'app.direct',
      'app.feedback',
      'app.share',
      'app.home',
      'app.search',
      'tscontrollers'
    ]);

})();