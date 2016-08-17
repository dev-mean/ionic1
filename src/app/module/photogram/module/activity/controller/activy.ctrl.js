(function () {
  'use strict';
  angular
    .module('app.activity')
    .controller('PhotogramActivityCtrl', PhotogramActivityCtrl);

  function PhotogramActivityCtrl($scope, Photogram, PhotogramShare) {
    var vm = this;
    vm.loading = true;

    $scope.loadMore = loadMore;
    vm.openShare = PhotogramShare.open;
    vm.load = load;
    init();
    vm.load();

    function init() {
      vm.page = 0;
      vm.data = [];
      vm.empty = false;
      vm.loadMore = false;
    }

    function loadMore(force) {
      console.log('Load More');
      vm.load(force);
    }

    function load(force) {

      if (force) {
        init();
      }

      Photogram
        .listActivity(vm.page)
        .then(function (resp) {

          resp.map(function (value) {
            vm.data.push(value);
          });

          if (resp.length) {
            vm.loading = false;
            vm.more = true;
            vm.page++;
          } else {
            vm.empty = true;
            vm.loading = false;
            vm.more = false;
          }
        })
        .then(function () {
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');

        })
        .catch(function (status) {
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
          if (!status) {
            vm.loading = false;
            vm.page++;
          } else {
            vm.empty = true;
            vm.loading = false;
          }
          vm.more = false;
        });
    }


  }

})();