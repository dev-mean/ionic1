(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name photogramComment
   *
   * @description
   * _Please update the description and restriction._
   *
   * @restrict A
   * */

  angular
    .module('app.photogram')
    .directive('photogramComment', photogramCommentDirective);

  function photogramCommentDirective($ionicModal, Loading, $ionicPopup, User, Notify, $timeout,
    AppConfig, Photogram, PhotogramForm) {

    var path = AppConfig.path;

    return {
      restrict: 'A',
      scope: {
        ngModel: '='
      },
      link: function (scope, elem) {
        scope.formFields = PhotogramForm.formComment;
        scope.submitComment = submitComment;
        scope.deleteComment = deleteComment;
        scope.editComment = editComment;
        scope.closeModal = closeModal;
        elem.bind('click', openModalComment);

        function init() {
          scope.currentUser = User.currentUser();
          scope.nocomments = false;
          scope.loading = false;
          scope.form = {
            galleryId: scope.ngModel.id,
            text: ''
          };
        }

        function openModalComment() {
          console.log(scope.ngModel);

          init();

          scope.comments = scope.ngModel.comments;
          $timeout(function () {
            if (scope.comments.length === 0) {
              scope.nocomments = true;
            }
          }, 500);


          $ionicModal.fromTemplateUrl(path + '/directives/comment/photogram.comment.directive.html', {
              scope: scope,
              focusFirstInput: true
            })
            .then(function (modal) {
              scope.modal = modal;
              scope.modal.show();

            });
        }

        function deleteComment(obj) {
          console.log(obj);
          Notify
            .confirm(('Delete comment'), ('You are sure?'))
            .then(function (resp) {
              console.log(resp);
              if (resp) {
                Photogram
                  .deleteComment(obj)
                  .then(function (resp) {
                    console.log(resp);
                    getComments();
                  });
              }
            });
        }

        function editComment(obj) {
          console.log(obj);
          // An elaborate, custom popup
          scope.data = angular.copy(obj);
          $ionicPopup
            .show({
              template: '<input type="text" ng-model="data.text">',
              title: ('Edit comment'),
              //subTitle: 'Please use normal things',
              scope: scope,
              buttons: [{
                text: ('Cancel')
              }, {
                text: '<b>OK</b>',
                type: 'button-positive',
                onTap: function (e) {
                  console.log(scope.data);
                  if (!scope.data.text) {
                    //don't allow the user to close unless he enters wifi password
                    e.preventDefault();
                  } else {
                    return scope.data;
                  }
                }
              }]
            })
            .then(function (resp) {
              console.log(resp);
              if (resp) {
                Photogram
                  .updateComment(resp)
                  .then(function (resp) {
                    console.log(resp);
                    getComments();
                  });
              }
            });
        }

        function getComments() {
          scope.loading = true;
          Photogram
            .getComments(scope.ngModel.id)
            .then(function (resp) {
              scope.comments = resp;
              scope.ngModel.comments = resp;
              scope.loading = false;
            });
        }

        function submitComment(rForm, form) {
          if (rForm.$valid) {
            var dataForm = angular.copy(form);
            Loading.start();
            Photogram
              .addComment(dataForm)
              .then(function (resp) {
                console.log(resp);
                getComments();
                Loading.end();
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