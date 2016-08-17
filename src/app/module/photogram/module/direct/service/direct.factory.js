(function () {
  'use strict';

  var _direct = 'DirectMessages';
  var _channel = 'Direct';

  angular
    .module('app.photogram')

  // fitlers
  .filter('nl2br', ['$filter',
    function ($filter) {
      return function (data) {
        if (!data) return data;
        return data.replace(/\n\r?/g, '<br />');
      };
    }
  ])

  // directives
  .directive('autolinker', ['$timeout',
      function ($timeout) {
        return {
          restrict: 'A',
          link: function (scope, element, attrs) {
            $timeout(function () {
              var eleHtml = element.html();

              if (eleHtml === '') {
                return false;
              }

              var text = Autolinker.link(eleHtml, {
                className: 'autolinker',
                newWindow: false
              });

              element.html(text);

              var autolinks = element[0].getElementsByClassName('autolinker');

              for (var i = 0; i < autolinks.length; i++) {
                angular.element(autolinks[i]).bind('click', function (e) {
                  var href = e.target.href;
                  console.log('autolinkClick, href: ' + href);

                  if (href) {
                    //window.open(href, '_system');
                    window.open(href, '_blank');
                  }

                  e.preventDefault();
                  return false;
                });
              }
            }, 0);
          }
        }
      }
    ])
    .factory('Direct', Direct);

  function Direct($q, Parse) {
    return {
      from: from,
      to: to,
      chats: chats,
      messages: messages,
      sendMessage: sendMessage
    };

    function getDirect(directId) {
      var defer = $q.defer();
      new Parse
        .Query('Direct')
        .include('from')
        .equalTo('objectId', directId)
        .first()
        .then(defer.resolve);

      return defer.promise;
    }

    function addMessage(data) {
      var defer = $q.defer();
      var DirectMessages = Parse.Object.extend('DirectMessages');
      var message = new DirectMessages();
      angular.forEach(data, function (value, key) {
        message.set(key, value);
      });
      message.save(null, defer.resolve, defer.reject);

      return defer.promise;
    }

    function sendMessage(message, roomId) {
      var defer = $q.defer();

      getDirect(roomId)
        .then(function (direct) {
          console.log(message);
          message.room = direct;
          message.user = Parse.User.current();
          addMessage(message)
            .then(function (message) {
              direct.relation('messages').add(message);
              direct.save()
                .then(defer.resolve);
            })
        })
      defer.resolve(message);
      return defer.promise;

    }

    function messages(channelId, page) {
      var defer = $q.defer();

      getDirect(channelId)
        .then(function (direct) {
          var data = direct.attributes;
          var user = Parse.User.current();
          data.user = direct.attributes.from.attributes;
          data.messages = [];

          new Parse
            .Query('DirectMessages')
            .equalTo('room', direct)
            .include('user')
            .limit(20)
            .skip(page)
            .find()
            .then(function (resp) {
              resp.map(function (item) {
                var obj = {
                  body: item.attributes.body,
                  date: item.createdAt,
                  user: item.attributes.user.attributes
                };
                obj.user.id = item.attributes.user.id;
                console.log(item, obj);

                data.messages.push(obj);
              });
              defer.resolve(data);
            });
        })

      return defer.promise;
    }

    function chats() {
      var defer = $q.defer();

      var promises = [chatsType(null, 'from'), chatsType(null, 'to')];
      $q.all(promises)
        .then(function (resp) {
          var data = [];
          console.log(resp);
          resp[0].map(function (item) {
            data.push(item);
          });
          resp[1].map(function (item) {
            data.push(item);
          });
          defer.resolve(data);
        })

      return defer.promise;
    }

    function chatsType(user, type) {
      var defer = $q.defer();
      new Parse
        .Query('Direct')
        .equalTo(type, user || Parse.User.current())
        .include('from')
        .find()
        .then(function (resp) {
          var data = [];
          resp.map(function (item) {
            var obj = item.attributes;
            obj.user = item.attributes.from.attributes
            obj.id = item.id;

            data.push(obj);
          });
          defer.resolve(data);
        });

      return defer.promise;
    }

    function from(user) {
      var defer = $q.defer();
      new Parse
        .Query(_direct)
        .equalTo('from', user || Parse.User.current())
        .include('from')
        .find()
        .then(function (resp) {
          var data = [];
          resp.map(function (item) {
            var obj = {
              msg: item.attributes.body,
              user: item.attributes.from.attributes
            };

            obj.user.id = item.attributes.from.id;

            data.push(obj);
          });
          defer.resolve(data);
        });

      return defer.promise;
    }

    function to(user) {
      var defer = $q.defer();
      new Parse
        .Query(_direct)
        .equalTo('to', user || Parse.User.current())
        .include('from')
        .find()
        .then(function (resp) {
          var data = [];
          resp.map(function (item) {
            var obj = {
              msg: item.attributes.body,
              user: item.attributes.from.attributes
            };

            obj.user.id = item.attributes.from.id;

            data.push(obj);
          });
          defer.resolve(data);
        });

      return defer.promise;
    }
  }
})();