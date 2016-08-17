(function () {
  'use strict';

  angular
    .module('ionic-loading')
    .factory('Loading', Loading);

  function Loading($rootScope, $timeout) {
    var seconds = 0;

    return {
      start: showLoading,
      end: hideLoading,
    };


    function showLoading(text) {
      $rootScope.$broadcast('ionicLoading:true', text);
    }

    function hideLoading() {
      $timeout(function () {
        $rootScope.$broadcast('ionicLoading:false');
      }, parseInt(seconds + '000'));
    }
  }
})();