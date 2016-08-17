(function () {
  'use strict';
  angular
    .module('app.photogram')
    .directive('ionSearch', ionSearch);

  function ionSearch($timeout) {

    return {
      restrict: 'E',
      replace: true,
      scope: {
        getData: '&source',
        model: '=?',
        search: '=?filter'
      },
      template: '<div class="ion-search item-input-wrapper"> <input type="search" placeholder="{{placeholder}}" ng-model="search.value"><i ng-if="search.value.length > 0" ng-click="clearSearch()" class="icon ion-close"></i></div>',
      link: function (scope, element, attrs) {
        attrs.minLength = attrs.minLength || 0;
        scope.placeholder = attrs.placeholder || '';
        scope.clearSearch = clearSearch;
        scope.search = {
          value: ''
        };

        if (attrs.class) {
          element.addClass(attrs.class);
        }

        if (attrs.source) {
          scope.$watch('search.value', watchSearch);
        }

        function watchSearch(newValue) {
          if (newValue.length > attrs.minLength) {
            $timeout(function () {
              scope
                .getData({
                  str: newValue
                })
                .then(function (results) {
                  scope.model = results;
                });
            }, 1000);
          } else {
            scope.model = [];
          }
        }

        function clearSearch() {
          scope.search.value = '';
        }
      }

    };
  }


})();