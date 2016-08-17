(function () {
  'use strict';
  angular
    .module('app.photogram')
    .directive('photogramLike', photogramLike)
    .directive('photogramLikeModal', photogramLikeModal);


  function photogramLike(Photogram) {
    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      link: function (scope, elem, attr) {
        elem.bind('click', likePhotogram);

        function likePhotogram() {

          console.log('photogram', scope.ngModel);
          var photogram = scope.ngModel.item;
          photogram.likeProgress = true;
          photogram.liked = !photogram.liked;
          Photogram
            .likeGallery(scope.ngModel.id)
            .then(function (resp) {
              photogram.qtdLike = resp.likes;
              delete photogram.likeProgress;
              console.log(photogram, resp);
            });
          scope.$apply();
        }
      }
    };
  }

  function photogramLikeModal($ionicModal, AppConfig, Photogram) {

    var path = AppConfig.path;

    return {
      restrict: 'A',
      scope: {
        photogram: '='
      },
      template: '',
      link: function (scope, elem, attr) {
        scope.formFields = Photogram.formComment;
        scope.submitComment = submitComment;
        scope.closeModal = closeModal;
        elem.bind('click', openModal);

        function openModal() {
          console.log(scope.photogram);

          $ionicModal.fromTemplateUrl(path + '/directives/like/photogram.like.directive.html', {
            scope: scope,
            animation: 'slide-in-up'
          }).then(function (modal) {
            scope.modal = modal;
          });

        }

        function submitComment(rForm, form) {
          if (rForm.$valid) {
            var dataForm = angular.copy(form);
            Photogram
              .addComment(dataForm)
              .then(function (resp) {
                console.log(resp);
                scope.closeModal();
              });
          }
        }

        function closeModal() {
          scope.modal.hide();
          scope.modal.remove();
        }

      }
    }
  }


})();