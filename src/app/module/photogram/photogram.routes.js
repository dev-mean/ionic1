(function () {
  'use strict';
  angular
    .module('app.photogram')
    .config(configRoutes);

  var path = 'app/module/photogram';

  function configRoutes($stateProvider, $translatePartialLoaderProvider) {

    // Translation
    $translatePartialLoaderProvider.addPart(path);

    $stateProvider
      .state('photogram', {
        url: '/photogram',
        abstract: true,
        controller: 'PhotogramTabsCtrl',
        controllerAs: 'vm',
        templateUrl: path + '/view/photogram.tabs.html'
      })
      .state('profileSetup', {
          url: '/profileSetup',
          templateUrl: path + '/view/profileSetup.html',
          controller: 'ProfileSetupCtrl'
      })
      .state('locationSetup', {
          url: '/locationSetup',
          templateUrl: path + '/view/locationSetup.html',
          controller: 'LocationSetupCtrl'
      })
      .state('termsOfUse', {
          url: '/termsOfUse',
          templateUrl: path + '/view/termsOfUse.html',
          controller: 'TermsOfUseCtrl'
      })
      .state('banned', {
          templateUrl: path + '/view/banned.html'
      })
      .state('updateRequired', {
          templateUrl: path + '/view/updateRequired.html',
          controller: 'UpdateRequiredCtrl'
      })
      .state('photogram.menu-home', {
        url: '/menu-home',
        views: {
          tabMenuHome: {
            controllerAs: 'vm',
            templateUrl: path + '/view/swipe.html',
            controller: "CardsCtrl"
          }
        }
      })
      .state('photogram.menu-card-info', {
        url: '/menu-card-info',
        views: {
          tabMenuCardInfo: {
            controllerAs: 'vm',
            templateUrl: path + '/view/profileView.html',
            controller: "CardInfoCtrl"
          }
        }
      })
      .state('match-profile', {
          url: "/match-profile/:matchId/:profileId",
          templateUrl: path + "/view/matchProfile.html",
          controller: "MatchProfileCtrl",
          resolve: {
              matchProfile: function (AppService, $stateParams) {
                  if($stateParams.matchId)
                      return AppService.getProfileByMatchId($stateParams.matchId)
                  else if($stateParams.profileId)
                      return AppService.getProfileById($stateParams.profileId)
              }
          }
      })
      .state('photogram.menu-chats', {
        url: '/menu-chats',
        views: {
          tabMenuChats: {
            controllerAs: 'vm',
            templateUrl: path + '/view/chats.html',
            controller: "ChatsCtrl"
          }
        }
      })
      .state('chat', {
          url: "/chat/:matchId",
          templateUrl: path + "/view/chat.html",
          controller: "ChatCtrl"
      })
      .state('photogram.menu-likedMe', {
        url: '/menu-likedMe',
        views: {
          tabMenuLikedMe: {
            controllerAs: 'vm',
            templateUrl: path + '/view/likedMe.html',
            controller: "LikedMe"
          }
        }
      })
      .state('profile-edit', {
          url: "/profile-edit",
          templateUrl: path + "/view/profileEdit.html"
      })
      .state('fb-albums', {
          url: '/fb-albums',
          templateUrl: path + "/view/fbAlbums.html",
          controller: "FbAlbumsCtrl"
      })
      .state('fb-album', {
          url: '/fb-album/:albumId',
          templateUrl: path + "/view/fbAlbum.html",
          controller: "FbAlbumCtrl"
      })
      .state('crop', {
          url: '/crop',
          templateUrl: path + '/view/crop.html',
          controller: 'PhotoCropCtrl'
      })
      .state('photogram.menu-profile', {
        url: '/menu-profile',
        views: {
          tabMenuProfile: {
            controllerAs: 'vm',
            templateUrl: path + '/view/profile.html',
            controller: "ProfileCtrl"
          }
        }
      })
      .state('photogram.menu-discovery', {
        url: '/menu-discovery',
        views: {
          tabMenuDiscovery: {
            controllerAs: 'vm',
            templateUrl: path + '/view/discovery.html',
            controller: "DiscoveryCtrl"
          }
        }
      })
      .state('photogram.menu-location', {
        url: '/menu-location',
        views: {
          tabMenuLocation: {
            controllerAs: 'vm',
            templateUrl: path + '/view/locationMap.html',
            controller: "LocationCtrl"
          }
        }
      })
      .state('photogram.menu-settings', {
        url: '/menu-settings',
        views: {
          tabMenuSettings: {
            controllerAs: 'vm',
            templateUrl: path + '/view/settings.html',
            controller: "SettingsCtrl"
          }
        }
      })
      .state('photogram.menu-contact', {
        url: '/menu-contact',
        views: {
          tabMenuContact: {
            controllerAs: 'vm',
            templateUrl: path + '/view/contact.html',
            controller: "ContactCtrl"
          }
        }
      })
      ;
  }

})();