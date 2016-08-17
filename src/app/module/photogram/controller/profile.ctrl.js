(function () {
  'use strict';
angular
    .module('app.photogram')
    .controller('UpdateRequiredCtrl', UpdateRequiredCtrl)
    .controller('EmailVerificationCtrl', EmailVerificationCtrl)
    .controller('ProfileSetupCtrl', ProfileSetupCtrl)
    .controller('LocationSetupCtrl', LocationSetupCtrl)
    .controller('TermsOfUseCtrl', TermsOfUseCtrl)
    .controller('ProfileCtrl', ProfileCtrl)
    .controller('FbAlbumsCtrl', FbAlbumsCtrl)
    .controller('FbAlbumCtrl', FbAlbumCtrl)
    .controller('PhotoCropCtrl', PhotoCropCtrl)
    .controller('DiscoveryCtrl', DiscoveryCtrl)
    .controller('SettingsCtrl', SettingsCtrl)
    .controller('ContactCtrl', ContactCtrl)
    .controller('LocationCtrl', LocationCtrl)
    ;

  function UpdateRequiredCtrl($scope, playStoreUrl, itunesUrl) {
    $scope.storeUrl = ionic.Platform.isAndroid() ? playStoreUrl : itunesUrl;
  }
  function EmailVerificationCtrl($scope, AppService, AppUtil) {
    // see https://parse.com/docs/js_guide#users-emailverification
    // http://blog.parse.com/2012/04/03/introducing-app-email-settings/

    $scope.isEmailVerified = function () {
        return AppUtil.blockingCall(AppService.isEmailVerified(), function (verified) {
            return verified ? AppService.goToNextLoginState() : AppUtil.toastSimpleTranslate('EMAIL_NOT_VERIFIED');
        });
    };

    $scope.cancel = function () {
        return AppService.logout();
    };
  }
  function ProfileSetupCtrl($scope, $state, AppService, AppUtil, User) {
    // The user will be sent here from AppService.goToNextLoginState() if AppService.isProfileValid() returns false
    $scope.$on('$ionicView.beforeEnter', function (event) {
        var profile = AppService.getProfile();

        var birthYear = null,
            birthMonth = null,
            birthDay = null;
        if (profile.birthdate) {
            birthYear = profile.birthdate.getFullYear();
            birthMonth = profile.birthdate.getMonth();
            birthDay = profile.birthdate.getDay();
        }

        // pre-populate the values we already have on the profile
        $scope.user = { name: profile.name, birthYear: birthYear, birthMonth: birthMonth, birthDay: birthDay, gender: profile.gender };
    });

    // Static data
    $scope.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    $scope.years = [];
    // provide the years for people aged 13 to 100
    var yearsFrom = new Date().getFullYear() - 100;
    var yearsTo = new Date().getFullYear() - 13;
    for (var i = yearsFrom; i <= yearsTo; i++) {
        $scope.years.push(i);
    }
    $scope.yearFrom = yearsFrom;
    $scope.yearTo = yearsTo;

    $scope.saveProfile = function () {

        if (!$scope.user.name || $scope.user.name.trim().length < 1) {
            AppUtil.toastSimpleTranslate('FIRST_NAME_REQUIRED');
            return;
        }
        if (!$scope.user.birthDay) {
            AppUtil.toastSimpleTranslate('BIRTH_DAY_REQUIRED');
            return;
        }
        if (!$scope.user.birthMonth) {
            AppUtil.toastSimpleTranslate('BIRTH_MONTH_REQUIRED');
            return;
        }
        if (!$scope.user.birthYear) {
            AppUtil.toastSimpleTranslate('BIRTH_YEAR_REQUIRED');
            return;
        }
        if (!$scope.user.gender) {
            AppUtil.toastSimpleTranslate('GENDER_REQUIRED');
            return;
        }

        var birthdate = new Date(Date.UTC($scope.user.birthYear, $scope.user.birthMonth, $scope.user.birthDay));
        var changes = { name: $scope.user.name, birthdate: birthdate, gender: $scope.user.gender };

        AppUtil.blockingCall(AppService.saveProfile(changes), function () {
            return AppService.goToNextLoginState();
        }, 'SETTINGS_SAVE_ERROR');
        var dataForm = {
            name:  $scope.user.name,
            email: $scope.user.email,
            status : 'status',
            gender: $scope.user.gender,
            img: null,
            username: $scope.user.email
        };
        User
        .update(dataForm)
        .then(function (resp) {
            console.log(resp);
            User.init();
        });
    };

    $scope.logout = function () {
        return AppService.logout();
    };
  }
  function LocationSetupCtrl($scope, $translate, AppService, AppUtil, $ionicPopup) {
    var translations;
    $translate(['SETTINGS_SAVE_ERROR', 'GPS_ERROR', 'SET_MAP_LOCATION']).then(function (translationsResult) {
        translations = translationsResult;
    });

    // New York
    var latLng = new google.maps.LatLng(40.73, -73.99);

    var mapOptions = {
        center: latLng,
        zoom: 11,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: true
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.map = map;
    map.setCenter(latLng);

    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
        title: "My Location",
        draggable: true
    });

    google.maps.event.addListener(map, 'click', function (event) {
        marker.setPosition(event.latLng);
    });

    $scope.setLocation = function () {
        var pos = marker.getPosition();

        AppUtil.blockingCall(AppService.saveProfile({ gps: false, location: { latitude: pos.lat(), longitude: pos.lng() } }), function () {
            return AppService.goToNextLoginState();
        }, 'SETTINGS_SAVE_ERROR');
    };

    $scope.cancel = function () {
        return AppService.logout();
    };

    $scope.$on('$ionicView.afterEnter', function (event) {
        $ionicPopup.alert({
            title: translations.GPS_ERROR,
            template: translations.SET_MAP_LOCATION
        });
    });
  }
  function TermsOfUseCtrl($scope, AppService, AppUtil) {
    // Required for Apple store submission when there is user generated content.
    // See the Next Steps in the question at http://www.quora.com/Apple-App-Store-rejection-category-14-3-help-needed

    $scope.agree = function () {
        return AppUtil.blockingCall(AppService.termsOfUseAgreed(), function () {
            return AppService.goToNextLoginState();
        });
    };

    $scope.logout = function () {
        return AppService.logout();
    };
  }
  function ProfileCtrl($scope, $log, $rootScope, $state, $cordovaFacebook, AppService) {
    $scope.$on('$ionicView.beforeEnter', function (event) {

        $scope.profile = AppService.getProfile();
        $scope.photos = $scope.profile.photos;
        $scope.age = new Date(new Date() - new Date($scope.profile.birthdate)).getFullYear() - 1970;

        if ($rootScope.facebookConnected) {
            // load the cached values first for quick update on the UI
            var likes = localStorage.getItem('facebookLikes');
            if (likes) {
                $scope.likes = JSON.parse(likes);
            }
            var friends = localStorage.getItem('facebookFriends');
            if (friends) {
                $scope.friends = JSON.parse(friends);
            }

            // update asynchronously
            // Only friends registered with your app will be returned
            // See http://stackoverflow.com/questions/23417356/facebook-graph-api-v2-0-me-friends-returns-empty-or-only-friends-who-also-u
            $cordovaFacebook.api('/me/friends').then(function (result) {
                $scope.friends = result.data;
                localStorage.setItem('facebookFriends', JSON.stringify(result.data));

                $cordovaFacebook.api('/me/likes').then(function (result) {
                    $scope.likes = result.data;
                    localStorage.setItem('facebookLikes', JSON.stringify(result.data));
                });
            });
        }
    });

    $scope.edit = function () {
        $state.go('profile-edit');
    };
  }
  function FbAlbumsCtrl($scope, $log, $cordovaFacebook) {
    $scope.albums = null;

    // TODO use $iconicLoading instead of the text status
    $cordovaFacebook.api('/me/albums').then(function (result) {
        $scope.albums = result.data;
    }, function (error) {
        $log.log('FbAlbumsController error ' + JSON.stringify(error));
    });
    // TODO handle if there are no albums
  }
  function FbAlbumCtrl($log, $rootScope, $state, $scope, $stateParams, $ionicLoading, $cordovaFacebook) {
    $cordovaFacebook.api('/' + $stateParams.albumId + '/photos?fields=id,picture,source,height,width,images&limit=500').then(function (result) {
        $scope.photos = result.data;
        // TODO handle if there are no photos
    }, function (error) {
        $log.log('FbAlbumController - error getting album photos ' + JSON.stringify(error));
    });

    $scope.selectPhoto = function (photo) {
        $ionicLoading.show();
        getBase64FromImageUrl(photo.source);
    };

    function getBase64FromImageUrl(URL) {
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.src = URL;
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            var dataURL = canvas.toDataURL("image/png");

            $rootScope.cropPhoto = dataURL;
            $ionicLoading.hide();
            $state.go('^.crop');
        };
    }
  }
  function PhotoCropCtrl($log, $scope, $rootScope, $ionicLoading, $state, $stateParams, $ionicHistory, AppService, AppUtil, User) {
    $scope.myImage = $rootScope.cropPhoto;
    // $scope.myImage = $stateParams.imageData TODO try and use a state param instead of rootScoe

    $scope.croppedImage = { data: '' };

    $scope.$on('$ionicView.afterLeave', function (event) {
        $rootScope.cropPhoto = null;
    });

    $scope.cancel = function () {
        $ionicHistory.goBack();
    };

    $scope.crop = function () {

        $ionicLoading.show();
        try {
            var dataURI = $scope.croppedImage.data;
            var base64;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) base64 = dataURI.split(',')[1];else base64 = unescape(dataURI.split(',')[1]);

            AppService.setPhoto(base64).then(function (result) {
                $ionicLoading.hide();

                var viewHistory = $ionicHistory.viewHistory();

                if (viewHistory.backView.stateName == 'fb-album') {
                    // pop off the facebook album history items and set the back view to the profile edit page
                    var history = viewHistory.histories[viewHistory.currentView.historyId];
                    history.stack.splice(2, 3);
                    history.cursor = 1;
                    viewHistory.backView = history.stack[1];
                    $ionicHistory.goBack();
                } else {
                    // if we came from a camers/gallery photo selection then can just go back
                    $ionicHistory.goBack();
                }
            }, function (error) {
                $ionicLoading.hide();
                $log.error('Error saving cropped image ' + JSON.stringify(error));
                AppUtil.toastSimple('Error saving cropped image');
            });
            var user = User.currentUser();
            User
                .updateAvatar(base64)
                    .then(function (resp) {
                    console.log(resp);
                });
        } catch (e) {
            // TODO show error
            $ionicLoading.hide();
            $log.error('error getting cropped image data ' + JSON.stringify(e));
            AppUtil.toastSimple('Unable to crop image');
        }
    };
  }
  function DiscoveryCtrl($scope, $state, $ionicHistory, AppService, AppUtil) {
    $scope.$on('$ionicView.enter', function () {
        $scope.profile = AppService.getProfile().clone();
    });

    $scope.save = function () {
        return AppUtil.blockingCall(AppService.saveProfile($scope.profile), function () {
            AppService.clearPotentialMatches();
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('photogram.menu-home');
        }, 'SETTINGS_SAVE_ERROR');
    };

    $scope.cancel = function () {
        $scope.profile = AppService.getProfile($scope).clone();
    };
  }
  function SettingsCtrl($log, $scope, $rootScope, $state, $translate, AppService, AppUtil, $ionicActionSheet) {
    var translations;
    $translate(['SETTINGS_SAVE_ERROR', 'DELETE', 'DELETE_ACCOUNT', 'CANCEL']).then(function (translationsResult) {
        translations = translationsResult;
    });

    $scope.profile = AppService.getProfile().clone();

    $scope.setLanguage = function (key) {
        $log.log('setting language to ' + key);
        $translate.use(key);
    };

    $scope.save = function () {
        AppUtil.blockingCall(AppService.saveSettings($scope.profile), function () {
            return $scope.profile = AppService.getProfile().clone();
        }, 'SETTINGS_SAVE_ERROR');
    };

    $scope.cancel = function () {
        $scope.profile = AppService.getProfile($scope).clone();
    };

    $scope.logout = function () {
        AppService.logout();
    };

    $scope.inAppPurchasesAvailable = function () {
        return typeof store !== 'undefined';
    };

    $scope.buyPro = function () {
        return store.order("pro version");
    };

    $scope.buySubscription = function () {
        return store.order("subscription");
    };

    $scope.deleteUnmatchedSwipes = function () {
        return AppUtil.blockingCall(AppService.deleteUnmatched(), function (success) {
            return $log.log(success);
        }, function (error) {
            return $log.error(error);
        });
    };

    $scope.deleteAccount = function () {
        $ionicActionSheet.show({
            destructiveText: translations.DELETE,
            titleText: translations.DELETE_ACCOUNT,
            cancelText: translations.CANCEL,
            cancel: function cancel() {},
            destructiveButtonClicked: function destructiveButtonClicked(index) {
                doDelete();
                return true;
            }
        });
    };

    function doDelete() {
        AppUtil.blockingCall(AppService.deleteAccount());
    }

    $scope.debug = function () {
        console.log('debug...');
        $ionicActionSheet.show({
            destructiveText: 'Send Debug Logs',
            titleText: 'UID ' + AppService.getProfile().uid,
            cancelText: translations.CANCEL,
            cancel: function cancel() {},
            destructiveButtonClicked: function destructiveButtonClicked(index) {
                $log.error('debug log');
                return true;
            }
        });
    };
  }
  function ContactCtrl($scope, AppService, AppUtil) {
    $scope.contact = { message: '' };

    $scope.sendMessage = function () {
        if ($scope.contact.message.length < 10) {
            AppUtil.toastSimple('Write at least a few words!');
            return;
        }

        AppUtil.blockingCall(AppService.sendContactMessage($scope.contact.message), function () {
            $scope.contact.message = '';
            AppUtil.toastSimple('Message sent');
        });
    };
  }
  function LocationCtrl($scope, $translate, AppService, AppUtil, $ionicLoading) {
    // TODO load the google map script async here when required instead of index.html
    var translations;
    $translate(['GPS_ERROR']).then(function (translationsResult) {
        translations = translationsResult;
    });

    var profile = AppService.getProfile();
    var location = profile.location;

    $scope.location = { useGPS: profile.gps };

    var myLatlng = new google.maps.LatLng(location.latitude, location.longitude);

    var mapOptions = {
        center: myLatlng,
        zoom: 11,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        disableDoubleClickZoom: true
    };

    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    $scope.map = map;
    map.setCenter(myLatlng);

    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map,
        title: "My Location",
        draggable: !profile.gps
    });

    google.maps.event.addListener(map, 'click', function (event) {
        if (!$scope.location.useGPS) marker.setPosition(event.latLng);
    });

    $scope.useGPSchanged = function () {
        marker.setDraggable(!$scope.location.useGPS);

        if ($scope.location.useGPS) {
            $ionicLoading.show();
            AppService.getCurrentPosition().then(function (gpsLocation) {
                return AppService.saveProfile({ gps: true, location: gpsLocation });
            }).then(function (profile) {
                var gpsLatLng = new google.maps.LatLng(profile.location.latitude, profile.location.longitude);
                marker.setPosition(gpsLatLng);
                map.setCenter(gpsLatLng);
                $ionicLoading.hide();
            }, function (error) {
                $ionicLoading.hide();
                if (error === 'GPS_ERROR') AppUtil.toastSimple(translations.GPS_ERROR);else AppUtil.toastSimple(translations.SETTINGS_SAVE_ERROR);
                $scope.location.useGPS = false;
                marker.setDraggable(true);
            });
        }
        // else the user needs to click the save button
    };

    $scope.setLocation = function () {
        var pos = marker.getPosition();

        AppUtil.blockingCall(AppService.saveProfile({ gps: false, location: { latitude: pos.lat(), longitude: pos.lng() } }), function () {/* send back to main page? */}, 'SETTINGS_SAVE_ERROR');
    };
  }
})();