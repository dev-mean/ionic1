(function () {
  'use strict';
  angular
    .module('app.photogram')
    .controller('PhotogramPhotoCtrl', PhotogramPhotoCtrl);


  function PhotogramPhotoCtrl($stateParams, Photogram) {
    var vm = this;

    vm.formFields = Photogram.formComment;
    vm.submitComment = submitComment;
    init();

    Photogram
      .get($stateParams.id)
      .then(function (resp) {
        vm.data = resp;
      });

    function init() {
      vm.form = {
        PhotogramId: $stateParams.id,
        text: ''
      };

      loadComments();
    }

    function loadComments() {
      Photogram
        .allComment($stateParams.id)
        .then(function (resp) {
          console.log(resp);
          vm.comments = resp;
        });
    }

    function submitComment(rForm, form) {
      if (rForm.$valid) {
        var dataForm = angular.copy(form);
        Photogram
          .addComment(dataForm)
          .then(function (resp) {
            console.log(resp);
            loadComments();
          });
      }
    }

  }


})();