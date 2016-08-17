(function () {
  'use strict';

  angular
    .module('app.photogram')
    .controller('DirectMessagesCtrl', DirectMessagesCtrl);


  function DirectMessagesCtrl($scope, Direct, User, $state) {
    var vm = this;
    var roomId = $state.params.channelId;
    vm.user = User.currentUser();
    vm.sendMessage = sendMessage;
    vm.doRefresh = loadMessages;

    function loadMessages() {
      vm.loading = true;
      vm.data = [];
      Direct
        .messages(roomId)
        .then(function (resp) {
          vm.data = resp;
          vm.loading = false;
          if (vm.model) {
            vm.model.text = '';
          }
          $scope.$broadcast('scroll.refreshComplete');
        });
    }

    loadMessages();


    function sendMessage(form, model) {
      var data = angular.copy(model);
      console.log(data);
      if (form.$valid && data.text) {
        var message = {
          body: data.text
        };
        Direct
          .sendMessage(message, roomId)
          .then(function () {
            loadMessages();
          });
      }


    }

  }
})();