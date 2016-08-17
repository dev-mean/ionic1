(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name photogramProfile
   *
   * @description
   * _Please update the description and restriction._
   *
   * @restrict A
   * */

  angular
    .module('app.user')
    .directive('profileModal', profileModalDirective);

  function profileModalDirective($ionicModal, $rootScope, $q, Photogram, User) {

    return {
      restrict: 'A',
      scope: {
        user: '='
      },
      link: profileModalLink
    };

    function profileModalLink(scope, elem) {

      elem.bind('click', openModal);

      function init() {
        var defer = $q.defer();
        scope.loadingPhotogram = true;

        Photogram
          .getUserGallery(scope.user.id)
          .then(function (resp) {
            scope.data = resp;
            console.log(resp);
            scope.$broadcast('scroll.refreshComplete');
            scope.$broadcast('scroll.infiniteScrollComplete');
            scope.loadingPhotogram = false;
            defer.resolve(scope.data);
          });

        return defer.promise;
      }

      function changeTab(tab) {
        if (tab === 'list') {
          scope.tab = {
            list: true,
            grid: false
          };
        } else {
          scope.tab = {
            list: false,
            grid: true
          };
        }
      }

      function getFollower(userId) {
        scope.loadingFollowers = true;
        scope.loadingFollowing = true;
        scope.loadingPhotos = true;

        Photogram
          .getUserGalleryQtd(userId)
          .then(function (qtdPhotos) {
            scope.user.qtdPhotos = qtdPhotos;
            scope.loadingPhotos = false;
          });

        User
          .getFollowers(userId)
          .then(function (qtdFollowers) {
            console.log('qtdFollower: seguindo', qtdFollowers);
            scope.user.qtdFollowers = qtdFollowers;
            scope.loadingFollowers = false;
          });

        User
          .getFollowing(userId)
          .then(function (qtdFollowing) {
            console.log('qtdFollowing: seguidores', qtdFollowing);
            scope.user.qtdFollowing = qtdFollowing;
            scope.loadingFollowing = false;
          });
      }

      function openModal() {

        console.log(scope.user);

        if (scope.user.id === $rootScope.currentUser.id) {
          return false;
        }

        $ionicModal
          .fromTemplateUrl('app/module/user/module/profile/view/profile.modal.html', {
            scope: scope
          })
          .then(function (modal) {
            scope.modalProfile = modal;
            scope.loadingFollow = true;
            scope.changeTab = changeTab;
            scope.follow = follow;
            scope.closeModal = closeModal;
            scope.modalProfile.show();

            init();
            getFollower(scope.user.id);
            changeTab('list');
            isFollow();

            function isFollow() {
              User
                .isFollow(scope.user.id)
                .then(isFollowResp);
            }

            function isFollowResp(resp) {
              console.info('follow user?', resp);
              scope.user.follow = resp;
              scope.loadingFollow = false;
            }

            function follow() {

              scope.loadingFollow = true;
              var status;

              if (scope.user.follow) {
                status = false;
              } else {
                status = true;
              }

              User
                .follow(status, scope.user)
                .then(followResp);

              function followResp(resp) {

                console.log('Follow result', resp);
                scope.user.follow = status;
                scope.loadingFollow = false;
                getFollower(scope.user.id);
              }
            }

            function closeModal() {
              delete scope.data;
              scope.modalProfile.hide();
              scope.modalProfile.remove();
            }
          });
      }
    }
  }

})();