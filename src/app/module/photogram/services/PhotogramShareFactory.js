(function () {
  'use strict';
  angular
    .module('app.photogram')
    .factory('PhotogramShare', PhotogramShareFactory);

  function PhotogramShareFactory(AppConfig, $q, $ionicActionSheet, Notify, $cordovaSocialSharing) {

    var message = {
      title: ('Join me from ') + AppConfig.app.name + '!',
      subject: ("I'm at ") + AppConfig.app.name + '!. ' + (
        'Install the application and follow me!') + ' ' + AppConfig.app.url,
      image: AppConfig.app.image,
      link: AppConfig.app.url
    };

    return {
      share: share,
      open: open
    };

    function share(social, option) {
      var defer = $q.defer();

      function success(resp) {
        Notify.alert({
          title: ('Thanks'),
          text: ('Thank you for sharing!!')
        });
        defer.resolve(resp);
      }

      function error(err) {
        console.error(err);
        defer.reject();
      }

      var detail = option ? option : message;

      switch (social) {
      case 'instagram':
        window
          .plugins
          .socialsharing
          .shareViaInstagram(message.text, message.image, message.link)
          .then(success, error);
        break;

      case 'facebook':
        $cordovaSocialSharing
          .shareViaFacebook(detail.text, detail.image, detail.link)
          .then(success, error);
        break;

      case 'twitter':
        $cordovaSocialSharing
          .shareViaTwitter(detail.text, detail.image, detail.link)
          .then(success, error);
        break;

      case 'whatsapp':
        $cordovaSocialSharing
          .shareViaWhatsApp(detail.text, detail.image, detail.link)
          .then(success, error);
        break;

      case 'email':
        $cordovaSocialSharing
          .shareViaEmail(detail.title, detail.subject ? detail.subject : detail.title)
          .then(success, error);
        break;
      }

      return defer.promise;
    }

    function open() {
      var modal = $ionicActionSheet
        .show({
          buttons: [{
            text: '<i class="icon ion-social-instagram"></i>' + ('Instagram')
          }, {
            text: '<i class="icon ion-social-facebook"></i>' + ('Facebook')
          }, {
            text: '<i class="icon ion-social-twitter"></i>' + ('Twitter')
          }, {
            text: '<i class="icon ion-social-whatsapp"></i>' + ('Whatsapp')
          }, {
            text: '<i class="icon ion-email"></i>' + ('Email')
          }],
          titleText: ('Share'),
          cancelText: ('Cancel'),
          cancel: function () {
            return false;
          },
          buttonClicked: function (index) {
            console.log(index);
            switch (index) {
            case 0:
              share('instagram');
              break;
            case 1:
              share('facebook');
              break;
            case 2:
              share('twitter');
              break;
            case 3:
              share('whatsapp');
              break;
            case 4:
              share('email');
              break;
            }
            modal();
            //share(index);
          }
        });

    }
  }

})();