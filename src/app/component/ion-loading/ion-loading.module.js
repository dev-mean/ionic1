(function () {
  'use strict';
  angular
    .module('ionic-loading', ['ionic'])
    .run(runLoading);

  function runLoading($rootScope, $ionicLoading) {
    //Loading
    $rootScope.$on('ionicLoading:true', function (text) {
      $rootScope.loading = true;
      $ionicLoading.show(text);
    });
    $rootScope.$on('ionicLoading:false', function () {
      $rootScope.loading = false;
      $ionicLoading.hide();
    });
  }

})();