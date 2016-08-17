(function () {

  angular
    .module('app.photogram')
    .factory('PhotogramFeedbackForm', PhotogramFeedbackForm)
    .factory('PhotogramFeedback', PhotogramFeedback);

  function PhotogramFeedback($q, Photogram, Notify) {

    function submit(form) {
      var defer = $q.defer();

      console.log(form);

      Photogram
        .find(form.photogramId)
        .then(function (Photogram) {
          console.log(Photogram);
          var Object = Parse.Object.extend('PhotogramFeedback');
          var item = new Object();

          delete form.PhotogramId;

          angular.forEach(form, function (value, key) {
            item.set(key, value);
          });

          item.set('user', Parse.User.current());
          item.set('Gallery', Photogram);

          item
            .save(null)
            .then(function (resp) {
              Notify.alert({
                title: ('Thanks'),
                text: ('Thanks for your Feedback')
              });
              defer.resolve(resp);
            });
        });


      return defer.promise;
    }

    return {
      submit: submit
    };
  }

  function PhotogramFeedbackForm($translate) {

    var form = [{
      key: 'title',
      type: 'input',
      templateOptions: {
        type: 'text',
        placeholder: $translate.instant('FEEDBACK.TITLE'),
        required: true
      }
    }, {
      key: 'subject',
      type: 'select',
      templateOptions: {
        label: $translate.instant('FEEDBACK.SUBJECT'),
        options: [{
          'label': $translate.instant('FEEDBACK.COMPLAINT'),
          'id': 'complaint',
        }, {
          'label': $translate.instant('FEEDBACK.BUG'),
          'id': 'bug',
        }, {
          'label': $translate.instant('FEEDBACK.SUGGESTION'),
          'id': 'suggestion',
        }],
        valueProp: 'id',
        labelProp: 'label',
        icon: 'icon-list',
        iconPlaceholder: true
      }
    }, {
      key: 'status',
      type: 'textarea',
      templateOptions: {
        type: 'text',
        placeholder: $translate.instant('FEEDBACK.MESSAGE'),
        icon: 'ion-quote',
        required: true,
        iconPlaceholder: true
      }
    }];

    return {
      form: form
    };
  }


})();