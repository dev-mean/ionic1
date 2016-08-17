(function () {
  'use strict';
  angular
    .module('app.user', [
      'ionic',
      'user.avatar',
      'user.friend',
      'user.logout',
      'user.merge',
      'user.profile',
      'user.recovery',
      'user.signin',
      'user.signup',
      'user.term',
    ]);

})();