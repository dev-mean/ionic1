/*
 * cordova -d plugin add https://github.com/emilyemorehouse/phonegap-parse-plugin --variable APP_ID=7lWT9DJntSvMKTetpoT0wL79pTG9dk4ob5pztktX --variable CLIENT_KEY=CIcH8fg5AogNNrEQ8IbmA5nujNjIvVNmuW0PyvCy
 * */
(function () {
  'use strict';
  angular
    .module('starter')
    .run(runParsePush);

  function runParsePush($ionicPlatform, $q, $window, AppConfig) {

    var ParsePushPlugin = $window.parsePlugin;


    $ionicPlatform.ready(function () {
      if ($window.cordova) {
        startPush();
      }
    });


    function startPush() {
      var defer = $q.defer();

      ParsePushPlugin
        .initialize(AppConfig.parse.applicationId, AppConfig.parse.clientKey, function () {

          ParsePushPlugin
            .subscribe('Photogram', function () {
              ParsePushPlugin
                .getInstallationId(defer.resolve, defer.reject);

            }, defer.reject);

        }, defer.reject);

      return defer.promise;
    }


  }

})();