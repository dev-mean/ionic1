(function () {
  'use strict';

  angular
    .module('ion-notify', ['ionic'])
    .factory('Notify', Notify);

  function Notify($ionicPopup) {

    return {
      alert: alert,
      confirm: confirm
    };

    function alert(params) {
      return $ionicPopup.alert({
        title: params.title,
        template: params.text
      });
    }

    function confirm(title, msg) {
      return $ionicPopup.confirm({
        title: title,
        template: msg
      });
    }
  }


})();