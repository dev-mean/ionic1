(function () {
  'use strict';
  /**
   * @ngdoc controller
   * @name UserSignupCtrl
   *
   * @description
   * _Please update the description and dependencies._
   *
   * @requires $scope
   * */
  angular
    .module('app.user')
    .controller('UserSignupCtrl', UserSignupController);

  function UserSignupController($scope, $state, $ionicHistory, $log, $timeout, UserForm, Notify, Loading, Photogram, User, AppService, AppUtil) {
    var vm = this;
    vm.formFields = UserForm.register;
    vm.submitRegister = submitRegister;

    init();

    function init() {
      vm.form = {
        email: '',
        password: ''
      };
    }

    function submitRegister(rForm, data) {

      if (rForm.$valid) {
        Loading.start();
        var form = angular.copy(data);
        User
          .register(form)
          .then(function (resp) {

            console.log(resp);
            // Add Actvity History
            Photogram
              .addActivity({
                action: 'registered'
              });
            checkProfile();
            AppService.logIn(form.email, form.password).then(function (result) {
                $log.log('user signed up success');
                checkProfile();
                User.init();
                Loading.end();
            }, function (error) {
                console.log(error);
                Loading.end();
                Notify.alert({
                  title: 'Ops',
                  text: error.message
                });
            });

            // After register, login
            // User
            //   .login({
            //     email: form.email,
            //     password: form.password
            //   })
            //   .then(function (data) {
            //     console.log(data);
            //     User.init();
            //     Loading.end();
            //     $state.go('useravatar', {
            //       clear: true
            //     });
            //   })
            //   .catch(function (resp) {
            //     console.log(resp);
            //     Loading.end();
            //     Notify.alert({
            //       title: 'Ops',
            //       text: resp.message
            //     });
            //   });
          })
          .catch(function (resp) {
            console.log(resp);
            Loading.end();
            Notify.alert({
              title: 'Ops',
              text: resp.message
            });
          });
      }

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
  }


})();