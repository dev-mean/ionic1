(function () {
  'use strict';
  angular
    .module('app.photogram')
    .directive('photogramSettings', photogramSettings);

  function photogramSettings($ionicModal, $translate, AppConfig, $cordovaInAppBrowser, $rootScope, PhotogramShare,
    User,
    UserForm, $state) {

    var path = AppConfig.path;

    return {
      restrict: 'A',
      scope: {
        photogram: '@'
      },
      template: '',
      link: function (scope, elem) {

        elem.bind('click', openModal);
        scope.closeModal = closeModal;
        scope.link = link;
        scope.openLink = openLink;
        scope.changeLanguage = changeLanguage;
        scope.share = PhotogramShare.share;

        function init() {
          scope.form = User.currentUser();
          scope.formFields = UserForm.profile;
          scope.languages = AppConfig.locales;
          scope.language = $translate.use();
        }

        function openModal() {

          init();
          $ionicModal.fromTemplateUrl(path + '/directives/settings/photogram.settings.modal.html', {
            scope: scope
          }).then(function (modal) {
            scope.modal = modal;
            scope.modal.show();
          });
        }

        function link(sref) {
          $state.go(sref);
          scope.closeModal();
        }

        function openLink(url) {
          var options = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'yes'
          };

          $cordovaInAppBrowser.open(url, '_blank', options);
        }

        function changeLanguage(language) {
          $translate.use(language);
          moment.locale(language);
          scope.form.language = language;
          submitUpdateProfile(scope.form);
        }


        function submitUpdateProfile(form) {
          var dataForm = angular.copy(form);
          User
            .update(dataForm)
            .then(function (resp) {
              console.log(resp);
              init();
              scope.closeModal();
            });
        }

        function closeModal() {
          scope.modal.hide();
          scope.modal.remove();
        }

      }
    };
  }


})();