(function () {
  'use strict';
  angular
    .module('app.activity')
    .controller('PhotogramNotifyCtrl', PhotogramNotifyCtrl);

  function PhotogramNotifyCtrl($scope, $rootScope, $ionicPlatform, $cordovaLocalNotification) {

    $ionicPlatform.ready(function () {

      // ========== Scheduling

      $scope.scheduleSingleNotification = scheduleSingleNotification;
      $scope.scheduleMultipleNotifications = scheduleMultipleNotifications;
      $scope.scheduleDelayedNotification = scheduleDelayedNotification;
      $scope.scheduleEveryMinuteNotification = scheduleEveryMinuteNotification;

      // =========/ Scheduling

      // ========== Update

      $scope.updateSingleNotification = updateSingleNotification;

      $scope.updateMultipleNotifications = updateMultipleNotifications;

      // =========/ Update

      // ========== Cancelation

      $scope.cancelSingleNotification = cancelSingleNotification;

      $scope.cancelMultipleNotifications = cancelMultipleNotifications;

      $scope.cancelAllNotifications = cancelAllNotifications;

      // =========/ Cancelation

      // ========== Events

      $rootScope.$on('$cordovaLocalNotification:schedule',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:trigger',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:update',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:clear',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:clearall',
        function (event, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:cancel',
        function (event, notification, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:cancelall',
        function (event, state) {
          // ...
        });

      $rootScope.$on('$cordovaLocalNotification:click',
        function (event, notification, state) {
          // ...
        });

      // =========/ Events
      function scheduleSingleNotification() {
        console.log('scheduleSingleNotification');
        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Title here',
          text: 'Text here',
          data: {
            customProperty: 'custom value'
          }
        }).then(function (result) {
          // ...
          console.log(result);
        });
      }

      function scheduleMultipleNotifications() {
        $cordovaLocalNotification.schedule([{
          id: 1,
          title: 'Title 1 here',
          text: 'Text 1 here',
          data: {
            customProperty: 'custom 1 value'
          }
        }, {
          id: 2,
          title: 'Title 2 here',
          text: 'Text 2 here',
          data: {
            customProperty: 'custom 2 value'
          }
        }, {
          id: 3,
          title: 'Title 3 here',
          text: 'Text 3 here',
          data: {
            customProperty: 'custom 3 value'
          }
        }]).then(function (result) {
          // ...
          console.log(result);
        });
      }

      function scheduleDelayedNotification() {
        var now = new Date().getTime();
        var _10SecondsFromNow = new Date(now + 10 * 1000);

        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Title here',
          text: 'Text here',
          at: _10SecondsFromNow
        }).then(function (result) {
          // ...
          console.log(result);
        });
      }

      function scheduleEveryMinuteNotification() {
        $cordovaLocalNotification.schedule({
          id: 1,
          title: 'Title here',
          text: 'Text here',
          every: 'minute'
        }).then(function (result) {
          // ...
          console.log(result);
        });
      }

      function updateSingleNotification() {
        $cordovaLocalNotification.update({
          id: 1,
          title: 'Title - UPDATED',
          text: 'Text - UPDATED'
        }).then(function (result) {
          // ...
          console.log(result);
        });
      }

      function updateMultipleNotifications() {
        $cordovaLocalNotification
          .update([{
            id: 1,
            title: 'Title 1 - UPDATED',
            text: 'Text 1 - UPDATED'
          }, {
            id: 2,
            title: 'Title 2 - UPDATED',
            text: 'Text 2 - UPDATED'
          }, {
            id: 3,
            title: 'Title 3 - UPDATED',
            text: 'Text 3 - UPDATED'
          }]).then(function (result) {
            // ...
            console.log(result);
          });
      }

      function cancelSingleNotification() {
        $cordovaLocalNotification
          .cancel(1)
          .then(function (result) {
            // ...
            console.log(result);
          });
      }

      function cancelMultipleNotifications() {
        $cordovaLocalNotification.cancel([
          1,
          2
        ]).then(function (result) {
          // ...
          console.log(result);
        });
      }

      function cancelAllNotifications() {
        $cordovaLocalNotification.cancelAll().then(function (result) {
          // ...
          console.log(result);
        });
      }

    });

  }

})();