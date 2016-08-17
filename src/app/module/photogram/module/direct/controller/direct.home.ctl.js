(function () {
  'use strict';

  angular
    .module('app.photogram')
    .controller('DirectHomeCtrl', DirectHomeCtrl);

  /* @ngInject */
  function DirectHomeCtrl(Direct) {
    var vm = this;
    vm.data = [];

    Direct
      .chats()
      .then(function (resp) {
        console.log(resp);
        vm.data = resp;
      })
  }
})();