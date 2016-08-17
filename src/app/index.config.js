var platformReady;
(function () {
  'use strict';
  var cordova = window.cordova;

  angular
    .module('starter')
    .run(startParse)
    .run(runIonic)
    .run(runFacebook)
    .config(imageCacheConfig)
    .config(configLanguage)
    .config(configFacebook)
    .config(configIonic);

  function startParse(AppConfig) {
    window.Parse.initialize(AppConfig.parse.appId, AppConfig.parse.javascriptKey);
    window.Parse.serverURL = AppConfig.parse.server;
  }

  function runIonic($ionicPlatform, $rootScope, $log, $cacheSrc, AppConfig, $cordovaStatusbar, $timeout,
    $cordovaSplashscreen, PhotogramSetting, User, AppService, ImgCache, appName) {

    $rootScope.appName = appName;
    $cacheSrc.color = AppConfig.color;
    $cacheSrc.bgcolor = '#ddd';
    $cacheSrc.rounded = true;
    $cacheSrc.radius = 50;
    //$cacheSrc.interval = 5000;
    User.init();
    AppService.init();
    $ionicPlatform.ready(function () {

      //$ionicAnalytics.register();

      if (cordova && cordova.plugins && cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      }
      ImgCache.init(function() {
          $log.log('ImgCache init: success!');
      }, function() {
          $log.warn('ImgCache init: error! Check the log for errors');
      })
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
      // Store the app version in the root scope
      if (window.cordova && window.cordova['getAppVersion']) window.cordova['getAppVersion'].getVersionNumber().then(function (version) {
          $log.info('App version: ' + version);
          $rootScope.appVersion = version;
      });else $log.info('cordova.getAppVersion is not available');

      if (cordova) {
        $timeout(function () {
          $cordovaSplashscreen.hide();
          $cordovaStatusbar.overlaysWebView(true);
          $cordovaStatusbar.style(1);
          $cordovaStatusbar.styleHex(AppConfig.color);
          $cordovaStatusbar.show();
        }, 500);
      }
      PhotogramSetting.init();
      platformReady = 'true';
    });
  }
  function imageCacheConfig(ImgCacheProvider) {
      ImgCacheProvider.setOptions({
          //debug: true,
          usePersistentCache: true
      });
      // Set this option to init imgcache.js manually after device is ready
      ImgCacheProvider.manualInit = true;
  }
  function configLanguage($translateProvider, AppConfig, tmhDynamicLocaleProvider) {

    // angular-translate configuration
    $translateProvider.useLoader('$translatePartialLoader', {
      urlTemplate: '{part}/i18n/{lang}.json'
    });
    $translateProvider.useSanitizeValueStrategy(null);

    // Translate Config
    $translateProvider.useMissingTranslationHandlerLog();
    $translateProvider.useLocalStorage(); // saves selected language to localStorage
    tmhDynamicLocaleProvider.localeLocationPattern('../bower_components/angular-i18n/angular-locale_{{locale}}.js');

    var langvar = navigator.language || navigator.userlanguage;
    var userlangvar = langvar.split('-')[0];
    var language = AppConfig.preferredLocale;
    var searchLang = _.some(AppConfig.locales, {code: userlangvar});
    if ( searchLang ) {
      language = userlangvar;
    }
    $translateProvider.preferredLanguage(language);
    moment.locale(language);
  }

  function configIonic($ionicConfigProvider) {
    //$ionicConfigProvider.platform.ios.backButton.previousTitleText(' ').icon('ion-ios-arrow-left');
    //$ionicConfigProvider.platform.android.backButton.previousTitleText(' ').icon('ion-ios-arrow-left');
    //$ionicConfigProvider.views.swipeBackEnabled (true);
    $ionicConfigProvider.backButton.text(' ').icon('ion-ios-arrow-left');
    //$ionicConfigProvider.backButton.previousTitleText (false).text ('Voltar').icon ('ion-ios-arrow-left');
    //$ionicConfigProvider.views.transition ('platform');
    //$ionicConfigProvider.navBar.alignTitle ('platform');
    //$ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.position('bottom');
    $ionicConfigProvider.platform.android.tabs.style('standard');
    $ionicConfigProvider.views.maxCache(1);
  }

  // Facebook

  function configFacebook($facebookProvider, AppConfig) {
    $facebookProvider.setAppId(AppConfig.facebook);
    $facebookProvider.setPermissions('id,name,email,user_likes,bio');
  }

  function runFacebook() {
    var ionic = window.ionic;
    if (!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())) {
      var LangVar = window.navigator.language || window.navigator.userLanguage;
      var userLangVar = LangVar.substring(0, 2) + '_' + LangVar.substring(3, 5).toUpperCase();
      var document = window.document;
      // If we've already installed the SDK, we're done
      if (document.getElementById('facebook-jssdk')) return;

      // Get the first script element, which we'll use to find the parent node
      var firstScriptElement = document.getElementsByTagName('script')[0];

      // Create a new script element and set its id
      var facebookJS = document.createElement('script');
      facebookJS.id = 'facebook-jssdk';

      // Set the new script's source to the source of the Facebook JS SDK
      facebookJS.src = 'http://connect.facebook.net/' + userLangVar + '/all.js';

      // Insert the Facebook JS SDK into the DOM
      firstScriptElement.parentNode.insertBefore(facebookJS, firstScriptElement);
    }
  }

})();