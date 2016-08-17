(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name UserSigninCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('UserSigninCtrl', UserSigninController);

  function UserSigninController($scope, $translate, $ionicHistory, $log, $timeout, AppConfig, UserForm, Loading, $state, Notify, $ionicSideMenuDelegate, User, AppService, AppUtil) {
    var vm = this;
    vm.formFields = UserForm.login;
    vm.routeLogged = AppConfig.routes.home;
    vm.submitLogin = submitLogin;
    vm.facebook = facebook;
    console.log($translate.instant('INTRO.STEP1'));

    var currentPlatform = window.ionic.Platform.platform();
    if (currentPlatform) {
      vm.device = (currentPlatform === 'android') ? 'android' : 'iphone';
    } else {
      vm.device = 'android';
    }
    
    init();

    function submitLogin(rForm, data) {

      var form = angular.copy(data);
      if (rForm.$valid) {
        Loading.start();

        AppService.logIn(form.email, form.password).then(function (result) {
            $log.log('user login success');
            console.log(result);
            Loading.end();
            checkProfile();
        }, function (error) {
            console.log(error);
            Loading.end();
            Notify.alert({
              title: 'Ops',
              text: error.message
            });
        });
        // User
        //   .login(form)
        //   .then(function (data) {

        //     console.log(data);
        //     if (data.email.length) {
        //       $state.go(vm.routeLogged, {
        //         clear: true
        //       });
        //     } else {
        //       $state.go('useravatar', {
        //         clear: true
        //       });
        //     }
        //     Loading.end();
        //   })
        //   .catch(function (resp) {
        //     Notify.alert({
        //       title: 'Ops',
        //       text: resp.message
        //     });
        //     Loading.end();
        //   });

      } else {
        return false;
      }
    }

    function facebook() {
      Loading.start();
      User
        .facebookLogin()
        .then(function (resp) {
          console.log(resp);

          Loading.end();
          switch (resp.status) {
          case 0:
            // logado
            $state.go(AppConfig.routes.home, {
              clear: true
            });
            break;
          case 1:
            // novo user
            $state.go('useravatar', {
              clear: true
            });
            break;
          case 2:
            // merge
            $state.go('usermerge', {
              clear: true
            });
            break;
          }
        })
        .catch(function () {
          Loading.end();
          Notify.alert({
            title: 'Ops',
            text: ('Facebook error')
          });
        });
    }
    function checkProfile(profile) {
        // start this now as it has a 10s timeout
        var locationPromise = AppService.getCurrentPosition();

        var profilePromise = profile ? $q.when(profile) : AppService.loadProfile();

        profilePromise.then(function (profile) {
            if (!profile) return $q.reject('Unable to load Profile');

            if (!profile.gps) return null;

            $scope.status = 'WAITING_FOR_GPS';
            return locationPromise.then(function (result) {
                return result;
            }, function (error) {
                // if profile.location != null then could have a toast warning that we were unable to update the location
                return null;
            });
        }).then(function (location) {
            var profile = AppService.getProfile();

            // if the user is using a location from the map, or couldn't get the GPS location then skip trying to save the location
            if (profile.gps === false || location === null) {
                proceed(profile);
                return;
            }

            $log.log('updating location to ' + JSON.stringify(location));
            AppService.saveProfile({ location: location }).finally(function () {
                return proceed(profile);
            });
        }, function (error) {

            $log.error('Error loging in: ' + JSON.stringify(error));

        });
    }

    /**
     * After a successful login proceed to the next screen
     * @param profile
     */
    function proceed() {
        AppService.getMutualMatches(); // load in the background
        // disable the back button
        $ionicHistory.nextViewOptions({
            historyRoot: true,
            disableBack: true
        });

        // the timeout is to give the drop CSS animation time
        $timeout(function () {
            return AppService.goToNextLoginState();
        }, 50);
    }

    // Waits for the facebook plugin to be ready
    function ensureFb(callback) {
        if (window.cordova && platformReady) {
            if (callback) {
                $timeout(callback, 50);
            }
        } else {
            $timeout(function () {
                ensureFb(callback);
            }, 50);
        }
    }

    var autoLogin = function autoLogin() {
        // TODO change the Parse.User.current() check to an AppService call
        if (Parse.User.current() != null) {
            $log.log('auto login');
            AppService.autoLogin();
            checkProfile();
        } else {

        }
    };
    
    ensureFb(autoLogin);

    function init() {
      vm.form = {
        email: '',
        password: ''
      };

      if (window.Parse.User.current()) {
        ensureFb(autoLogin);
        // $state.go(vm.routeLogged, {
        //   clear: true
        // });
      }

    }
    $scope.$on('$ionicView.enter', function(){
        $ionicSideMenuDelegate.canDragContent(false);
    });
    $scope.$on('$ionicView.leave', function(){
        $ionicSideMenuDelegate.canDragContent(true);
    });
  }

})();