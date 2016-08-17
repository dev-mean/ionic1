(function () {
  'use strict';
  var path = 'app/module/user/module/logout';

  angular
    .module('user.logout')
    .config(addRoute);

  function addRoute($stateProvider, $translatePartialLoaderProvider) {

    $stateProvider
      .state('logout', {
        url: '/logout',
        template: '<ion-view view-title="Logout" cache-view="false"><ion-content></ion-content></ion-view>',
        controller: 'LogoutCtrl',
        controllerAs: 'vm'
      });

  }

})();