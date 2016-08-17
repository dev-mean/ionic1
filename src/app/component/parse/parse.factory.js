(function () {
  'use strict';

  angular
    .module('ngParse')
    .factory('Parse', Parse);


  function Parse($window) {
    var parse = $window.Parse;
    parse.transform = transform;
    return parse;
  }

  function transform(resp) {
    var data = [];
    resp.map(function (item) {
      var obj = item.attributes;
      obj.id = item;
      data.push(obj);
    });
    return data;
  }
})();