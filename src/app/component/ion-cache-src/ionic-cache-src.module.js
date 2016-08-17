(function () {
  'use strict';

  var default_config = {
    color: '#1D5ECE',
    bgcolor: '#eaeaea',
    semi: false,
    rounded: false,
    clockwise: true,
    radius: '15',
    stroke: '5',
    max: 100,
    iterations: 50,
    animation: 'easeOutCubic',
    interval: 200,
    showProgressCircleInBrowser: true,
    showProgressCircleInDevice: true
  };


  angular
    .module('ionic-cache-src', [
      'ionic',
      'angular-svg-round-progressbar',
      'ngCordova',
      'ngStorage'
    ])
    .provider('$cacheSrc', $cacheSrc);

  function $cacheSrc() {
    this.config = default_config;
    this.set = function (obj, val) {
      var t = typeof obj;
      if (t === 'object') {
        angular.extend(this.config, obj);
      } else if (t == 'string') {
        this.config[obj] = val;
      }
      return this;
    };

    this.$get = function () {
      return this.config;
    };
  }


})();