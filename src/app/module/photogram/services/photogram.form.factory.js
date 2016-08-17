(function () {
  'use strict';
  angular
    .module('app.photogram')
    .factory('PhotogramForm', PhotogramFormFactory);

  function PhotogramFormFactory($translate) {

    var form = [{
      key: 'title',
      type: 'input',
      templateOptions: {
        type: 'text',
        placeholder: $translate.instant('PHOTOGRAM.FORM.TITLE'),
        icon: 'icon-envelope',
        required: true,
        iconPlaceholder: true,
        focus: true
      }
    }, {
      key: 'geo',
      type: 'toggle',
      templateOptions: {
        label: $translate.instant('PHOTOGRAM.FORM.GEOLOCATION'),
        toggleClass: 'positive'
      }
    }];

    var formComment = [{
      key: 'text',
      type: 'input',
      templateOptions: {
        placeholder: $translate.instant('PHOTOGRAM.FORM.ADDCOMMENT'),
        type: 'text',
        required: true,
        focus: true
          //icon           : 'icon-envelope',
          //iconPlaceholder: true
      }
    }];

    var formShare = [{
      key: 'facebook',
      type: 'toggle',
      templateOptions: {
        label: 'Facebook',
        toggleClass: 'positive'
      }
    }, {
      key: 'twitter',
      type: 'toggle',
      templateOptions: {
        label: 'Twitter',
        toggleClass: 'positive'
      }
    }, {
      key: 'whatsapp',
      type: 'toggle',
      templateOptions: {
        label: 'Whatsapp',
        toggleClass: 'positive'
      }
    }, {
      key: 'SMS',
      type: 'toggle',
      templateOptions: {
        label: 'SMS',
        toggleClass: 'positive'
      }
    }, {
      key: 'email',
      type: 'toggle',
      templateOptions: {
        label: 'Email',
        toggleClass: 'positive'
      }
    }, ];
    return {
      form: form,
      formComment: formComment,
      formShare: formShare
    };
  }


})();