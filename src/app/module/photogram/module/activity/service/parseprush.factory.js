(function () {
  'use strict';
  /*
   *
   https://github.com/avivais/phonegap-parse-plugin
   cordova plugin add https://github.com/FrostyElk/phonegap-parse-plugin --variable APP_ID=PARSE_APP_ID --variable CLIENT_KEY=PARSE_CLIENT_KEY
   cordova plugin add https://github.com/FrostyElk/cordova-parse-plugin.git --variable APP_ID=7lWT9DJntSvMKTetpoT0wL79pTG9dk4ob5pztktX --variable CLIENT_KEY=CIcH8fg5AogNNrEQ8IbmA5nujNjIvVNmuW0PyvCy

   Phonegap Parse.com Plugin
   Phonegap 3.0.0 plugin for Parse.com push service

   Using Parse.com's REST API for push requires the installation id, which isn't available in JS

   This plugin exposes the four native Android API push services to JS:

   getInstallationId
   getSubscriptions
   subscribe
   unsubscribe

   * */
  angular
    .module('app.activity')
    .factory('ParsePush', ParsePush);

  function ParsePush($q, AppConfig) {

    return {
      start: start,
      getInstall: getInstall,
      getSubscribe: getSubscriptions,
      postSubscribe: postSubscribe,
      unSubscribe: postUnSubscribe
    };

    function init() {
      var defer = $q.defer();
      var appId = AppConfig.parse.applicationId,
        clientKey = AppConfig.parse.clientKey;

      console.log('Init', appId, clientKey);

      parsePlugin.initialize(appId, clientKey, function () {
        console.log('Parse Push initialize');
        on();
        defer.resolve();
      }, function (e) {
        console.error('Parse Push Initialize error', e);
        defer.reject(e);
      });

      return defer.promise;
    }

    function on() {
      parsePlugin.on('receivePN', function (pn) {
        console.log('yo i got this push notification:' + JSON.stringify(pn));
      });

      //customEvt can be any string of your choosing, i.e., chat, system, upvote, etc.
      parsePlugin.on('receivePN:chat', function (pn) {
        console.log('yo i can also use custom event to keep things like chat modularized');
      });

      parsePlugin.on('openPN', function (pn) {
        //you can do things like navigating to a different view here
        console.log('Yo, I get this when the user clicks open a notification from the tray');
      });
    }


    function _start(channel) {
      var cordova = window.cordova;

      console.log('Parse Start', cordova, channel);
      if (cordova) {
        console.log('Push Start');
        init()
          .then(function () {
            console.log('Plugin Load');
            parsePlugin
              .subscribe(channel, function () {
                console.log('Enter channel', channel);
                parsePlugin
                  .getInstallationId(function (id) {
                    console.log('Success Push', channel, id);
                    /**
                                         * Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
                                         *
                                         var install_data = {
                                          installation_id: id,
                                          channels: ['SampleChannel']
                                       }
                                         *
                                         */
                    on();

                  }, function (e) {
                    alert('error');
                  });

              }, function (e) {
                alert('error');
              });

          }, function (e) {
            alert('error');
          });
      }
    }

    function start(channel) {
      var cordova = window.cordova;

      console.log('Parse Start', cordova, channel);
      if (cordova) {

        console.log('Plugin Load');
        init()
          .then(function () {

            console.log('Parse Ente Chanell', channel);
            parsePlugin
              .subscribe(channel, function () {
                console.log('Enter channel', channel);
                parsePlugin
                  .getInstallationId(function (id) {
                    console.log('Success Push', channel, id);
                    /**
                                         * Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
                                         *
                                         var install_data = {
                        installation_id: id,
                        channels: ['SampleChannel']
                     }
                                         *
                                         */
                    on();

                  }, function (e) {
                    alert('error');
                  });

              }, function (e) {
                alert('error');
              });
          })


      }
    }

    function getInstall() {
      var defer = $q.defer();
      console.log('getInstall');
      parsePlugin
        .getInstallationId(function (id) {
          console.log('getInstall', id);
          defer.resolve(id);
        }, function (e) {
          console.error('getInstall', e);
          defer.reject(e);
        });
      return defer.promise;
    }

    function getSubscriptions() {
      var defer = $q.defer();
      parsePlugin.getSubscriptions(function (subscriptions) {
        alert(subscriptions);
        defer.resolve(subscriptions);
      }, function (e) {
        alert('error');
        defer.reject(e);
      });
      return defer.promise;
    }

    function postSubscribe(channel) {
      var defer = $q.defer();
      console.log('postSubscribe', channel);
      parsePlugin
        .subscribe(channel, function (resp) {
          console.log('postSubscribe', channel, resp);
          defer.resolve(true);
        }, function (e) {
          console.log('postSubscribe', channel, e);
          defer.reject(e);
        });
      return defer.promise;
    }

    function postUnSubscribe(channel) {
      var defer = $q.defer();
      console.log('postUnSubscribe', channel);
      parsePlugin
        .unsubscribe(channel, function (msg) {
          console.log('postUnSubscribe', channel, msg);
          defer.resolve(msg);
        }, function (e) {
          console.log('postUnSubscribe', channel, e);
          alert('error');
          defer.reject(e);
        });
      return defer.promise;
    }

  }
})();