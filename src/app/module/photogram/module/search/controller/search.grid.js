(function () {
  'use strict';
  angular
    .module('app.photogram')
    .controller('PhotogramSearchGridCtrl', PhotogramSearchGridCtrl);

  function PhotogramSearchGridCtrl($scope, Photogram, PhotogramShare) {
    var vm = this;
    vm.loading = true;
    vm.loadMore = loadMore;
    vm.openShare = PhotogramShare.open;
    vm.load = load;
    init();
    vm.load('');

    function init() {
      vm.data = [];
      vm.page = 0;
      vm.empty = false;
      vm.more = false;
    }

    function loadMore(force) {
      console.log('Load More', vm.more);
      vm.load(force);
    }

    function load(string) {
      console.log('load popular', string);

      Photogram
        .all(vm.page)
        .then(function (resp) {
          vm.loading = false;

          angular.forEach(resp, function (value, key) {
            vm.data.push(value);
          });

          console.log('qtd', resp, resp.length);

          if (resp.length > 0) {
            vm.more = true;
            vm.page++;
          } else {
            vm.empty = true;
            vm.more = false;
          }
        })
        .then(function () {
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
          vm.empty = false;

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