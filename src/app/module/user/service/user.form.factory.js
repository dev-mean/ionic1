(function () {
  'use strict';
  angular
    .module('app.user')
    .factory('UserForm', UserFormFactory);

  function UserFormFactory($translate) {

    return {
      login: login(),
      register: register(),
      profile: profile()
    };

    function login() {
      return [{
        type: 'input',
        key: 'email',
        templateOptions: {
          type: 'email',
          placeholder: 'Email',
          icon: 'icon-envelope',
          required: true,
          iconPlaceholder: true
        }
      }, {
        type: 'input',
        key: 'password',
        templateOptions: {
          type: 'password',
          placeholder: 'Password',
          icon: 'icon-lock',
          required: true,
          iconPlaceholder: true
        }
      }];
    }

    function register() {
      return [{
        type: 'input',
        key: 'email',
        templateOptions: {
          type: 'email',
          placeholder: 'Email',
          icon: 'icon-envelope',
          required: true,
          iconPlaceholder: true
        }
      }, {
        type: 'input',
        key: 'password',
        templateOptions: {
          type: 'password',
          placeholder: 'Password',
          icon: 'icon-lock',
          required: true,
          iconPlaceholder: true
        }
      }];
    }

    function profile() {
      return [{
        key: 'name',
        type: 'input',
        templateOptions: {
          type: 'text',
          placeholder: 'Name',
          icon: 'icon-user',
          required: true,
          iconPlaceholder: true
        }
      }, {
        key: 'status',
        type: 'input',
        templateOptions: {
          type: 'text',
          placeholder: 'Status',
          icon: 'ion-quote',
          required: true,
          iconPlaceholder: true
        }
      }, {
        type: 'select',
        key: 'gender',
        templateOptions: {
          label: 'Gender',
          options: [{
            'label': 'Man',
            'id': 'M',
          }, {
            'label': 'Woman',
            'id': 'F',
          }],
          valueProp: 'id',
          labelProp: 'label',
          icon: 'icon-list',
          iconPlaceholder: true
        }
      }];
    }

  }


})();