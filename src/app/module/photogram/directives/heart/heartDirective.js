(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name heart
   *
   * @description
   * _Please update the description and restriction._
   *
   * @restrict A
   * */

  angular
    .module('app.photogram')
    .directive('heart', heartDirective);

  function heartDirective() {
    return {
      restrict: 'A',
      scope: {
        item: '='
      },
      link: heartLink
    };

    function heartLink(scope, elem, attr) {
      elem.bind('click', function () {
        console.log(scope.item);
        elem.addClass('happy');
      });
    }
  }

})();