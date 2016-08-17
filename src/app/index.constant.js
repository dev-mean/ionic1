(function () {
  'use strict';
  angular
    .module('ionic')
    .constant('AppConfig', AppConfig());

  function AppConfig() {
    return {
      path: 'app/module/photogram',
      app: {
        name: 'Photogram',
        url: 'http://photogramapp.com',
        image: 'http://photogramapp.com/social-share.jpg',
      },
      routes: {
        // home: 'photogram.home',
        home: 'user.signin',
        login: 'user.signin'
      },
      color: '#6ec5ff',
      facebook: '1119772438045798',
      // parse: {
      //   appId: 'Panda_ID',
      //   javascriptKey: 'Panda_JS_Key',
      //   clientKey: 'Panda_Key',
      //   masterKey: 'PandaMasterKey',
      //   server: 'https://pandaparse.herokuapp.com/parse/'
      //   // server: 'https://photogramserver.herokuapp.com/parse/'
      // },
      parse: {
        appId: 'UJORjgsTtpX1dfuWsKVnNawL6cIkvYgtOUSAwCIg',
        javascriptKey: 'm5t7IdWywSBTXrRNaOP4jQjB6zqkDP2ldfm02vc8',
        clientKey: 'NttqznEmDkwSp1FLg9SivHsxH4IFB6jD6SVHvHX9',
        masterKey: 'JQjc1ZX2ouJ28tPxZukSAlRLJrFVxfRR3W1Rb5Yo',
        server: 'https://api.parse.com/1/'
        // server: 'https://photogramserver.herokuapp.com/parse/'
      },
      locales: {
        pt: {
          'translation': 'LANG.PORTUGUES',
          'code': 'pt'
        },
        en: {
          'translation': 'LANG.ENGLISH',
          'code': 'en'
        },
        tr: {
          'translation': 'LANG.TURKISH',
          'code': 'tr'
        },
        fa: {
          'translation': 'LANG.PERSIAN',
          'code': 'fa'
        },
        de: {
          'translation': 'LANG.GERMAN',
          'code': 'de'
        }
      },
      preferredLocale: 'en'
    };
  }
})();
