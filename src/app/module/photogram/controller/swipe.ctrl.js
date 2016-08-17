(function () {
  'use strict';
angular
    .module('app.photogram')
    .controller('CardsCtrl', CardsCtrl)
    .controller('CardInfoCtrl', CardInfoCtrl)
    .controller('MatchProfileCtrl', MatchProfileCtrl)
    ;

  function CardsCtrl($log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
                                      TDCardDelegate, AppService, AppUtil, $ionicModal) {

    // when $scope.matches is null then we haven't done a search
    // when $scope.matches is an empty array then there are no new matches
    // TODO rename this to profiles as its IProfile and not IMatch objects
    $scope.matches = null;

    var profile = $scope.profile = AppService.getProfile();
    $scope.profilePhoto = profile.photoUrl;

    $scope.$on('$ionicView.beforeEnter', function () {
        return $scope.unreadChats = AppService.getUnreadChatsCount();
    });
    $scope.$on('unreadChatsCountUpdated', function () {
        return $scope.unreadChats = AppService.getUnreadChatsCount();
    });

    $scope.$on('$ionicView.enter', function () {
        if (profile.enabled) {
            // Check for any previously loaded matches
            $scope.matches = AppService.getPotentialMatches();
            // If we haven't searched yet or we are coming back to the screen and there isn't any results then search for more
            if (!$scope.matches || $scope.matches.length === 0) $scope.searchAgain();
        }
    });

    $scope.$on('newPotentialMatches', function () {
        return $scope.matches = AppService.getPotentialMatches();
    });

    $scope.searchAgain = function () {
        $scope.matches = null;
        updatePotentialMatches();
    };

    var MIN_SEARCH_TIME = 2000;
    function updatePotentialMatches() {

        var startTime = Date.now();
        AppService.updatePotentialMatches().then(function (result) {
            $log.log('CardsCtrl: found ' + result.length + ' potential matches');
            result.map(function (profile) {
                return profile.image = profile.photoUrl;
            });
            // Make the search screen show for at least a certain time so it doesn't flash quickly
            var elapsed = Date.now() - startTime;
            if (elapsed < MIN_SEARCH_TIME) $timeout(function () {
                return $scope.matches = result;
            }, MIN_SEARCH_TIME - elapsed);else $scope.matches = result;
        }, function (error) {
            $log.log('updatePotentialMatches error ' + JSON.stringify(error));
            $scope.matches = [];
            AppUtil.toastSimple(translations.MATCHES_LOAD_ERROR);
        });
    }

    // Initialise the new match modal
    $ionicModal.fromTemplateUrl('app/module/photogram/view/newMatch.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        return $scope.modal = modal;
    });
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        return $scope.modal.remove();
    });

    $scope.$on('newMatch', function (event, match) {
        $log.log('CardsCtrl.newMatch ' + match.id);
        $scope.newMatch = match;
        $scope.matchProfile = AppService.getProfileById(match.profileId);
        $scope.modal.show();
    });
    $scope.closeNewMatch = function () {
        return $scope.modal.hide();
    };

    $scope.messageNewMatch = function () {
        $scope.modal.hide();
        $state.go('chat', { matchId: $scope.newMatch.id });
    };
    // a test function for viewing the new match modal screen
    $scope.openNewMatch = function () {
        $scope.newMatch = AppService.getMutualMatches()[0];
        $scope.modal.show();
    };

    $scope.enableDiscovery = function () {
        AppUtil.blockingCall(AppService.enableDiscovery(), function () {
            $log.log('discovery enabled. updating matches...');
            updatePotentialMatches();
        });
    };

    $scope.viewDetails = function (card) {
        $log.log('view details ' + JSON.stringify(card));
        $scope.$parent.selectedCard = card;
        $state.go('^.card-info');
    };

    $scope.accept = function () {
        $log.log('accept button');
        var matchLength = $scope.matches.length;
        var topMatch = $scope.matches[matchLength - 1];
        AppService.processMatch(topMatch, true);
        topMatch.accepted = true; // this triggers the animation out
        $timeout(function () {
            return $scope.matches.pop();
        }, 340);
    };

    $scope.reject = function () {
        $log.log('reject button');
        var matchLength = $scope.matches.length;
        var topMatch = $scope.matches[matchLength - 1];
        AppService.processMatch(topMatch, false);
        topMatch.rejected = true; // this triggers the animation out
        $timeout(function () {
            return $scope.matches.pop();
        }, 340);
    };

    // matches are swiped off from the end of the $scope.matches array (i.e. popped)

    $scope.cardDestroyed = function (index) {
        return $scope.matches.splice(index, 1);
    };

    $scope.cardTransitionLeft = function (match) {
        AppService.processMatch(match, false);
        if ($scope.matches.length == 0) {
            // TODO auto-load more?
        }
    };
    $scope.cardTransitionRight = function (match) {
        AppService.processMatch(match, true);
        if ($scope.matches.length == 0) {
            // TODO auto-load more?
        }
    };
  }

  function CardInfoCtrl($log, $scope, $state, $timeout, $translate, $ionicSideMenuDelegate,
                                      TDCardDelegate, AppService, AppUtil, $ionicModal) {
    //$cordovaFacebook.api()
    //{user-id}?fields=context.fields%28mutual_friends%29

    $scope.profile = AppService.getProfile();
    var from = $scope.profile.location;
    var to = $scope.selectedCard.location;

    var distance = getDistanceFromLatLonInKm(from.latitude, from.longitude, to.latitude, to.longitude);

    if ($scope.profile.distanceType == 'mi') distance *= 1.609344;

    distance = distance.toFixed(0);

    $scope.distance = distance == 0 ? 1 : distance;

    $scope.like = function () {
        var match = AppService.getPotentialMatches().pop();
        AppService.processMatch(match, true);
        $ionicHistory.goBack();
    };

    $scope.reject = function () {
        var match = AppService.getPotentialMatches().pop();
        AppService.processMatch(match, false);
        $ionicHistory.goBack();
    };

    $scope.profileOptions = function () {
        $ionicActionSheet.show({
            destructiveText: translations.REPORT,
            titleText: translations.MATCH_OPTIONS,
            cancelText: translations.CANCEL,
            cancel: function cancel() {},
            destructiveButtonClicked: function destructiveButtonClicked(index) {
                report();
                return true;
            }
        });
    };

    function report() {
        var profile = AppService.getPotentialMatches().pop();

        AppUtil.blockingCall(AppService.reportProfile('profile', profile), function () {
            AppService.processMatch(profile, false);
            $ionicHistory.goBack();
        });
    }
  }

  function MatchProfileCtrl($scope, $translate, AppService, AppUtil,
                                           $state, $stateParams, $ionicHistory, $ionicActionSheet, $ionicPopup,
                                           matchProfile) {
    $scope.profile = AppService.getProfile();
    $scope.matchProfile = matchProfile;

    var from = $scope.profile.location;
    var to = matchProfile.location;

    var distance = getDistanceFromLatLonInKm(from.latitude, from.longitude, to.latitude, to.longitude);

    if ($scope.profile.distanceType == 'mi') distance *= 1.609344;

    distance = distance.toFixed(0);
    $scope.distance = distance == 0 ? 1 : distance;

    $scope.profileOptions = function () {
        $ionicActionSheet.show({
            destructiveText: translations.REPORT,
            titleText: translations.MATCH_OPTIONS,
            cancelText: translations.CANCEL,
            cancel: function cancel() {},
            destructiveButtonClicked: function destructiveButtonClicked(index) {
                report();
                return true;
            }
        });
    };

    function report() {
        AppUtil.blockingCall(AppService.reportProfile('profile', $scope.profile), // should pass in the match too
        function () {
            $ionicPopup.confirm({
                title: translations.MATCH_REPORTED,
                template: translations.WANT_TO_REMOVE_MATCH,
                okText: translations.REMOVE,
                cancelText: translations.CANCEL
            }).then(function (res) {
                if (res) unmatch();
            });
        });
    }

    function unmatch() {
        AppUtil.blockingCall(AppService.removeMatch($stateParams.matchId), function () {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('photogram.menu-chats');
        }, 'REMOVE_MATCH_ERROR');
    }
  }
})();

// from http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}