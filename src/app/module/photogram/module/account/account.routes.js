(function () {
  'use strict';
  angular
    .module('app.account')
    .config(configRoutes);

  var path = 'app/module/photogram/module/account';

  function configRoutes($stateProvider) {
    $stateProvider
      .state('userlist', {
        url: '/follow',
        controller: 'PhotogramUserListCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/module/user/module/friend/view/user.list.html'
      })

    .state('photogram.account', {
      url: '/account',
      views: {
        tabProfile: {
          controller: 'PhotogramProfileCtrl',
          controllerAs: 'vm',
          templateUrl: 'app/module/user/module/profile/view/profile.html'
        }
      }
    });
  }

})();