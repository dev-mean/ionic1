(function () {
  'use strict';
  angular
    .module('app.photogram')
    .directive('photogramPhotoList', photogramPhotoList);

  function photogramPhotoList(AppConfig) {
    var path = AppConfig.path;

    return {
      restrict: 'E',
      scope: {
        data: '=photogram',
        profile: '=',
        loading: '='
      },
      templateUrl: path + '/directives/photolist/photo.list.html',
      controller: photogramPhotoListCtrl,
      controllerAs: 'vm'
    };
  }

  function photogramPhotoListCtrl(AppConfig, Photogram, $scope, $ionicPopup, PhotogramFeedbackForm, PhotogramFeedback,
    $ionicActionSheet, $ionicModal) {
    var vm = this;
    var path = AppConfig.path;
    var user = Parse.User.current();
    var message = {
      title: ('Join me from ') + AppConfig.app.name + '!',
      text: ("I'm at ") + AppConfig.app.name + '! ' + (
        'Install the application and follow me!'),
      image: '',
      link: AppConfig.app.url
    };

    vm.action = action;
    vm.like = likePhoto;
    vm.gallery = {
      src: ''
    };

    vm.pallete = [];
    vm.getColors = getColors;

    function getColors(elemId) {
      var a = document.getElementById(elemId);
      if (a) {
        var c = new ColorThief().getColor(a);
        var p = new ColorThief().getPalette(a, 5);

        console.log(c, p);
        $scope.palette = p;
      } else {
        alert("Take a picture first!");
      }
    }

    function likePhoto(gallery) {
      //gallery.item.likeProgress = true;
      gallery.item.liked = !gallery.item.liked;
      Photogram
        .likeGallery(gallery.id)
        .then(function (resp) {
          gallery.item.qtdLike = resp.likes;
          //delete gallery.item.likeProgress;
        });
    }

    function action(gallery) {

      var buttons = [{
        text: '<i class="icon ion-share"></i>' + ('Share')
      }, {
        text: '<i class="icon ion-alert-circled"></i>' + ('Report')
      }];

      var user = Parse.User.current();

      if (user.id === gallery.user.id) {
        var buttonDelete = {
          text: '<i class="icon ion-trash-b"></i>' + ('Delete your photo')
        };
        buttons.push(buttonDelete);
      }
      message.image = gallery.src;
      message.text = gallery.item.title;

      var actionSheet = {
        buttons: buttons,
        titleText: ('Photo'),
        cancelText: ('Cancel'),
        buttonClicked: actionButtons
      };


      function actionButtons(index) {
        switch (index) {
        case 0:
          share(message);
          break;
        case 1:
          openModal(gallery);
          break;
        case 2:

          $ionicPopup
            .confirm({
              title: ('Delete photo'),
              template: ('Are you sure?')
            })
            .then(function (res) {
              if (res) {
                Photogram
                  .deletePhoto(gallery.id)
                  .then(msgDeletePhoto);
              }
            });


        }
        return true;
      }

      function msgDeletePhoto() {
        console.log('Photo deleted');
        $scope.$emit('PhotogramHome:reload');
      }

      // Show the action sheet
      $ionicActionSheet.show(actionSheet);

    }


    function openModal(gallery) {
      $scope.submitFeedback = submitFeedback;
      $scope.closeModal = closeModal;
      $scope.form = {
        photogramId: gallery.id,
        user: user
      };

      $scope.formFields = PhotogramFeedbackForm.form;

      $ionicModal
        .fromTemplateUrl(path + '/module/feedback/view/feedback.modal.html', {
          scope: $scope,
          focusFirstInput: true
        })
        .then(function (modal) {
          vm.modal = modal;
          vm.modal.show();
        });
    }


    function submitFeedback() {
      var dataForm = angular.copy($scope.form);
      PhotogramFeedback
        .submit(dataForm)
        .then(function (resp) {
          console.log(resp);
          closeModal();
        });
    }


    function closeModal() {
      vm.modal.hide();
      vm.modal.remove();
      delete vm.modal;
    }


    function success() {
      //Notify.alert({
      //    title: ('Thanks'),
      //    text: ('Thank you for sharing!!')
      //});
    }

    function error(err) {
      console.error(err);
    }

    function share(post) {
      console.log('Social Share', post);
      var message = ("I'm at ") + AppConfig.app.name + '! ' + (
        'Install the application and follow me!') + ' ' + AppConfig.app.url;
      window
        .plugins
        .socialsharing
        .share(post.text + ', ' + message, post.text, post.image, null);
    }

  }


})();