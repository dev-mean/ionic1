(function () {
  'use strict';
  angular
    .module('app.photogram')
    .controller('PhotogramViewCtrl', PhotogramViewCtrl);

  function PhotogramViewCtrl(Photogram, $stateParams) {
    var vm = this;
    Photogram
      .get($stateParams.id)
      .then(function (resp) {
        console.log(resp);
        vm.data = resp;
      });
  }


})();