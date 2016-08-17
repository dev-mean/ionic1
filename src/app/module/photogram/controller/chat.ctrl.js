(function () {
  'use strict';
angular
    .module('app.photogram')
    .controller('ChatsCtrl', ChatsCtrl)
    .controller('ChatCtrl', ChatCtrl)
    .directive('chatSettings', chatSettings)
    ;

    function ChatsCtrl($scope, $log, AppService, $ionicPopover, $ionicSideMenuDelegate, $localStorage) {
        $scope.showMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
        }
      $scope.$on('$ionicView.beforeEnter', function () {
        update();
        AppService.resetBadge();
      });

      $scope.$on('chatsUpdated', function () {
        $log.debug('ChatsCtrl.on(chatsUpdated)');
        update();
      });

    function update() {
      var matches = sort(AppService.getMutualMatches());
      var length = matches.length;
      // Have noticed some duplicate errors in the matches ng-repeat somehow
      matches = _.uniq(matches, 'id');
      if (matches.length !== length) $log.error('Found duplicated in matches');
      $scope.matches = matches;
    }

    function sort(chats) {
      $scope.settings = $localStorage.chatSettings || { sortBy: 'updated' };
      var sorted = chats;
      if ($scope.settings.sortBy === 'updatedAt')
        // lodash _.sortyByOrder is replace with .orderBy in 4.0
        sorted = _.sortByOrder(chats, ['updatedAt'], [false]);else if ($scope.settings.sortBy === 'name') {
        _.forEach(sorted, function (chat) {
          return chat.name = chat.profile.name ? chat.profile.name.toLowerCase() : 'zzz';
        });
        sorted = _.sortByOrder(chats, ['name'], [true]);
      }
      return sorted;
    }

    // Show the chat settings dialog
    $scope.chatSettings = function ($event) {
      var template = '<ion-popover-view><ion-header-bar><h1 class="title">Chat Settings</h1></ion-header-bar><ion-content>' + '<chat-settings/>' + '</ion-content></ion-popover-view>';
      $scope.popover = $ionicPopover.fromTemplate(template, { scope: $scope });
      $scope.popover.show($event);
      $scope.closePopover = function () {
        return $scope.popover.hide();
      };
      $scope.$on('$destroy', function () {
        return $scope.popover.remove();
      });
    };
  }

  function ChatCtrl($scope, $log, $timeout, $interval, $translate, $ionicSideMenuDelegate, $ionicScrollDelegate, $state, $stateParams, $ionicHistory, $ionicNavBarDelegate, $ionicActionSheet, $ionicPopup, $ionicLoading, AppService, AppUtil, $cordovaCamera, $cordovaFile, $analytics, ImagesUtil, $cordovaClipboard) {
    var translations;
    $translate(['UNMATCHED', 'REMOVE_MATCH', 'REPORT', 'MATCH_OPTIONS', 'CANCEL', 'REMOVE_MATCH_ERROR', 'MATCH_REPORTED', 'WANT_TO_REMOVE_MATCH', 'REMOVE', 'MESSAGE_NOT_SENT', 'REQUEST_FAILED']).then(function (translationsResult) {
        translations = translationsResult;
    });
    $scope.showMenu = function() {
        $ionicSideMenuDelegate.toggleLeft();
    }
    $scope.messages = [];
    $scope.sendingMessages = []; // Messages which have just been sent and waiting for server response
    $scope.failedMessages = []; // Messages which have failed to send
    $scope.profile = AppService.getProfile();

    var messageCheckTimer;

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    var loadChatDataPromise;

    // This hide the elements with the hide-on-keyboard-open class straight away instead of after a delay
    // Could potentially cause laggy scrolling on older/slower devices, but maybe ok with native scrolling now
    // https://github.com/driftyco/ionic/issues/3041#issuecomment-111303479
    window.addEventListener('native.keyboardshow', function () {
        document.body.classList.add('keyboard-open');
    });

    $scope.$on('$ionicView.beforeEnter', function () {
        $scope.match = AppService.getMatch($stateParams.matchId);
        AppService.getProfileByMatchId($stateParams.matchId).then(function (result) {
            $scope.matchProfile = result;
        });
        loadChatDataPromise = AppService.getActiveChat($stateParams.matchId).then(function (activeMessages) {
            $scope.messages = activeMessages;
            $scope.matchId = $stateParams.matchId;
        });
    });

    // A chat could have a number of messages while could take sometime to load from the database and create the DOM.
    // Instead of resolving in the router we will do the main work here so the initial UI tap is responsive and
    // display the messages when its all ready
    $scope.$on('$ionicView.enter', function () {
        if (window.cordova) {
            cordova.plugins.Keyboard.disableScroll(true);
            window.addEventListener('native.keyboardshow', keyboardShowHandler);
            window.addEventListener('native.keyboardhide', keyboardHideHandler);
        }
        $ionicLoading.show({noBackdrop: true, delay: 400 });
        loadChatDataPromise.then(function () {
            $scope.doneLoading = true;
            viewScroll.scrollBottom();
            $ionicLoading.hide();
            // Load what the user has previously typed, if anything
            $scope.input = { message: localStorage['userMessage-' + $scope.matchProfile.id] || '' };

            $timeout(function () {
                footerBar = document.body.querySelector('#userMessagesView .bar-footer');
                scroller = document.body.querySelector('#userMessagesView .scroll-content');
                txtInput = angular.element(footerBar.querySelector('textarea'));
            }, 0);

            messageCheckTimer = $interval(function () {
                // here you could check for new messages if your app doesn't use push notifications or user disabled them
            }, 20000);
        }, function (error) {
            $scope.messages = [];
            $ionicLoading.hide();
            $log.log('error loading chat ' + JSON.stringify(error));
            AppUtil.toastSimpleTranslate('REQUEST_FAILED');
        });
    });

    $scope.$on('$ionicView.afterEnter', function () {
        AppService.setChatRead($stateParams.matchId, true);

        // this is just used by the report() function at the moment
        $scope.match = AppService.getMatch($stateParams.matchId);
    });

    // Save what the user has typed when they leave the view
    $scope.$on('$ionicView.beforeLeave', function () {
        if (!$scope.input.message || $scope.input.message.trim().length == 0) localStorage.removeItem('userMessage-' + $scope.matchProfile.id);else localStorage['userMessage-' + $scope.matchProfile.id] = $scope.input.message;
    });

    $scope.$on('$ionicView.leave', function () {
        if (window.cordova) {
            window.removeEventListener('native.keyboardshow', keyboardShowHandler);
            window.removeEventListener('native.keyboardhide', keyboardHideHandler);
            cordova.plugins.Keyboard.disableScroll(false);
        }

        //$log.log('leaving UserMessages view, destroying interval')
        // Make sure that the interval is destroyed
        if (angular.isDefined(messageCheckTimer)) {
            $interval.cancel(messageCheckTimer);
            messageCheckTimer = undefined;
        }
    });

    $scope.$on('newMessage', function (event, message) {
        if (message.match.id == $stateParams.matchId) {
            $ionicScrollDelegate.scrollBottom(true);
            // re-set the read flag if we are viewing this chat
            AppService.setChatRead(message.match.id, true);
        }
    });

    $scope.$on('chatsUpdated', function (event, matchId) {
        $log.log('on ChatCtrl chatsUpdated');
        if (matchId === $stateParams.matchId) {
            AppUtil.toastSimpleTranslate('UNMATCHED');
            // TODO if came here direct from a push notification then no back history?
            $ionicHistory.goBack();
        }
    });

    $scope.chatOptions = function () {
        $ionicActionSheet.show({
            buttons: [{ text: translations.REPORT }],
            destructiveText: translations.REMOVE_MATCH,
            titleText: translations.MATCH_OPTIONS,
            cancelText: translations.CANCEL,
            cancel: function cancel() {},
            destructiveButtonClicked: function destructiveButtonClicked(index) {
                unmatch();
                return true;
            },
            buttonClicked: function buttonClicked(index) {
                report();
                return true;
            }
        });
    };

    function report() {
        AppUtil.blockingCall(AppService.reportProfile('chat', $scope.matchProfile, $scope.match), function () {
            $ionicPopup.confirm({
                title: translations.MATCH_REPORTED,
                template: translations.WANT_TO_REMOVE_MATCH,
                okText: translations.REMOVE,
                cancelText: translations.CANCEL
            }).then(function (res) {
                if (res) unmatch();
            });
        });
    }

    function unmatch() {
        AppUtil.blockingCall(AppService.removeMatch($stateParams.matchId), function () {
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true
            });
            $state.go('photogram.menu-chats');
        }, 'REMOVE_MATCH_ERROR');
    }

    $scope.showKeyboard = function () {
        return cordova.plugins.Keyboard.show();
    };

    $scope.sendMessage = function (sendMessageForm) {
        if (!$scope.input.message.trim().length) return;
        // If you do a web service call this will be needed as well as before the viewScroll calls
        // you can't see the effect of this in the browser it needs to be used on a real device
        // for some reason the one time blur event is not firing in the browser but does on devices
        keepKeyboardOpen();

        var msg = $scope.input.message;
        $scope.input.message = '';

        var sendingMessage = {};
        var sentAt = Date.now();
        sendingMessage.sentAt = sentAt;
        sendingMessage.text = msg;
        $scope.sendingMessages.push(sendingMessage);

        $timeout(function () {
            keepKeyboardOpen();
            viewScroll.scrollBottom(true);
        }, 0);

        AppService.sendChatMessage($stateParams.matchId, msg).then(function (sentMessage) {
            _.remove($scope.sendingMessages, 'sentAt', sentAt);
        }, function (error) {
            _.remove($scope.sendingMessages, 'sentAt', sentAt);
            $scope.failedMessages.push(sendingMessage);
            $log.error('error sending message ' + JSON.stringify(error));
            AppUtil.toastSimple(translations.MESSAGE_NOT_SENT);
        });
    };

    $scope.imageFromCamera = function () {

        $ionicActionSheet.show({
          buttons: [{
            text: '<i class="icon ion-camera"></i>' + ('Photo Camera')
          }, {
            text: '<i class="icon ion-images"></i> ' + ('Photo Album')
          }],
          //destructiveText:  ('Delete'),
          titleText: ('Choose Image'),
          cancelText: ('Cancel'),
          cancel: function () {
            // add cancel code..
          },
          buttonClicked: function (index) {
            switch (index) {
                case 0:
                    sendImage(Camera.PictureSourceType.CAMERA);
                    break;
                case 1:
                    sendImage(Camera.PictureSourceType.PHOTOLIBRARY);
                    break;
            }
            return true;
          }
        });
        
    };

    function sendImage(sourceType) {

        if (!ionic.Platform.isWebView()) return true;

        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: sourceType,
            allowEdit: false,
            encodingType: Camera.EncodingType.PNG,
            targetWidth: 600,
            targetHeight: 600,
            //popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function (imageData) {
            var base64 = 'data:image/png;base64,' + imageData;

            var sendingMessage = {};
            var sentAt = Date.now();
            sendingMessage.sentAt = sentAt;
            sendingMessage.imageBase64 = base64;
            $scope.sendingMessages.push(sendingMessage);

            $timeout(function () {
                viewScroll.scrollBottom(true);
            }, 0);

            AppService.sendChatMessage($stateParams.matchId, null, base64).then(function (sentMessage) {
                _.remove($scope.sendingMessages, 'sentAt', sentAt);
                // Set the base64 back onto the sent message so the image isn't reloaded from the server
                // which would cause it to temporarily disappear
                sentMessage.imageBase64 = base64;
            }, function (error) {
                _.remove($scope.sendingMessages, 'sentAt', sentAt);
                $scope.failedMessages.push(sendingMessage);
                $log.error('error sending message ' + JSON.stringify(error));
                AppUtil.toastSimple(translations.MESSAGE_NOT_SENT);
            });
        }, function (error) {
            // If the user cancels a selection then this will be called
            $log.log('$cordovaCamera.getPicture error ' + JSON.stringify(error));
        });
    }

    var recordPopup;

    $scope.recordAudio = function () {

        recordPopup = $ionicPopup.confirm({
            title: 'Recording...',
            template: 'Speak now!'
        });
        recordPopup.then(function (res) {
            if (res) saveRecording();else cancelRecording();
        });

        window.plugins.audioRecorderAPI.record(function (msg) {
            $log.log('record ok: ' + JSON.stringify(msg));
        }, function (msg) {
            if (recordPopup) recordPopup.close();
            $log.log('record err: ' + JSON.stringify(msg));
        });
    };

    function cancelRecording() {
        window.plugins.audioRecorderAPI.stop(function (filePath) {
            $log.log('audio cancel stop ok: ' + JSON.stringify(filePath));

            var fileName = savedFilePath.split('/')[savedFilePath.split('/').length - 1];
            $log.log('fileName: ' + fileName);
            var directory;
            if (cordova.file.documentsDirectory) {
                directory = cordova.file.documentsDirectory; // for iOS
            } else {
                    directory = cordova.file.externalRootDirectory; // for Android
                }

            $cordovaFile.removeFile(cordova.file.dataDirectory, fileName).then(function (success) {
                $log.log('deleted audio file');
            }, function (error) {
                $log.log('error deleting cancelled audio file ' + JSON.stringify(error));
            });
        }, function (msg) {
            $log.log('audio cancel stop err: ' + JSON.stringify(msg));
        });
    }

    function saveRecording() {
        window.plugins.audioRecorderAPI.stop(function (savedFilePath) {
            $log.log('audio save stop ok: ' + JSON.stringify(savedFilePath));

            var fileName = savedFilePath.split('/')[savedFilePath.split('/').length - 1];
            $log.log('fileName: ' + fileName);

            var directory = cordova.file.documentsDirectory ? cordova.file.documentsDirectory : // for iOS
            cordova.file.externalRootDirectory; // for Android
            directory = cordova.file.dataDirectory;

            $cordovaFile.readAsDataURL(directory, fileName).then(function (base64) {
                $log.log('readAsDataURL success ' + JSON.stringify(base64));

                $cordovaFile.removeFile(directory, fileName);

                var sendingMessage = {};
                var sentAt = Date.now();
                sendingMessage.sentAt = sentAt;
                sendingMessage.audioBase64 = base64;
                $scope.sendingMessages.push(sendingMessage);

                $timeout(function () {
                    viewScroll.scrollBottom(true);
                }, 0);

                AppService.sendChatMessage($stateParams.matchId, null, null, base64).then(function (sentMessage) {
                    _.remove($scope.sendingMessages, 'sentAt', sentAt);
                    // Rename it to match the message primary key
                    $cordovaFile.moveFile(directory, fileName, directory, sentMessage.id + '.m4a');
                }, function (error) {
                    _.remove($scope.sendingMessages, 'sentAt', sentAt);
                    $scope.failedMessages.push(sendingMessage);
                    $log.error('error sending message ' + JSON.stringify(error));
                    AppUtil.toastSimple(translations.MESSAGE_NOT_SENT);
                });
            }, function (error) {
                $log.log('readAsDataURL error ' + JSON.stringify(error));
            });
        }, function (msg) {
            $log.log('audio save stop err: ' + JSON.stringify(msg));
        });
    }

    $scope.playAudio = function (url) {
        $log.log('playing audio from ' + url);
        new Audio(url).play();
        // TODO look at using https://github.com/SidneyS/cordova-plugin-nativeaudio
        $analytics.eventTrack('audio-play');
    };

    /**
  * Re-send a message that had failed to send
  * @param message
  */
    function resendMessage(message) {

        _.remove($scope.failedMessages, 'sentAt', message.sentAt);

        var sentAt = Date.now();
        message.sentAt = sentAt;
        $scope.sendingMessages.push(message);

        // TODO handle image/audio messages

        AppService.sendChatMessage($stateParams.matchId, message).then(function (sentMessage) {
            _.remove($scope.sendingMessages, 'sentAt', sentAt);
        }, function (error) {
            _.remove($scope.sendingMessages, 'sentAt', sentAt);
            $scope.failedMessages.push(message);
            $log.error('error resending message ' + JSON.stringify(error));
            AppUtil.toastSimple(translations.MESSAGE_NOT_SENT);
        });
    }

    // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
        //$log.log('keepKeyboardOpen')
        //txtInput.one('blur', function () {
        //  //$log.log('textarea blur, focus back on it')
        //  txtInput[0].focus()
        //})
    }

    $scope.onMessageHold = function (e, itemIndex, message) {
        $log.log('onMessageHold index:' + itemIndex + ' message.id:' + message.id);
        // Currently only support actions on text and image messages
        if (!message.text && !message.image) return;

        $ionicActionSheet.show({
            buttons: [{ text: $translate.instant(message.image ? 'SAVE_IMAGE' : 'COPY_TEXT') }],

            //{ text: $translate.instant('REPORT_MESSAGE')} TODO
            //{ text: $translate.instant('DELETE_MESSAGE')}
            buttonClicked: function buttonClicked(index) {
                switch (index) {
                    case 0:
                        // Copy Text/Save Image
                        if (message.image) {
                            // The <img> elements have id's in the format (message.id)_img
                            var base64 = ImagesUtil.convertImgIdToBase64(message.id + '_img');
                            if (cordova.base64ToGallery) {
                                cordova.base64ToGallery(base64, 'img_',
                                // android: /storage/emulated/0/Pictures/img_201627162549.png TODO show toast with nice file path
                                function (msg) {
                                    return $log.log('Saved image to gallery ' + msg);
                                }, function (error) {
                                    return $log.error('Error saving chat image to gallery', error);
                                });
                            } else {
                                AppUtil.toastSimple('Saving image not supported');
                            }
                        }if (message.text) {
                            if (cordova.plugins.clipboard) $cordovaClipboard.copy(message.text).then(function () {
                                return AppUtil.toastSimple('Message copied to clipboard');
                            }, function () {
                                return AppUtil.toastSimple('Unable to copy to clipboard');
                            });else {
                                AppUtil.toastSimple('Copy to clipboard not supported');
                                // TODO make a fallback to use a javascript based approach and wrap it all in a service
                                // http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
                            }
                        }
                        break;

                    //case 1: // Delete
                    //  $scope.messages.splice(itemIndex, 1)
                    //  $timeout(function () {
                    //      viewScroll.resize()
                    //  }, 0)
                    //
                    //  break
                }

                return true;
            }
        });
    };

    $scope.onFailedMessageHold = function (e, itemIndex, message) {
        $log.log('onFailedMessageHold: ' + JSON.stringify(message, null, 2));
        $ionicActionSheet.show({
            buttons: [{ text: $translate.instant('RESEND') }, { text: $translate.instant('EDIT') }, { text: $translate.instant('DELETE') }],
            buttonClicked: function buttonClicked(index) {
                switch (index) {
                    case 0:
                        // Resend
                        resendMessage(message);
                        break;
                    case 1:
                        // Edit
                        $scope.input.message = message.text;
                        _.remove($scope.failedMessages, 'sentAt', message.sentAt);
                        break;
                    case 2:
                        // Delete
                        _.remove($scope.failedMessages, 'sentAt', message.sentAt);
                        break;
                }
                return true;
            }
        });
    };

    // keyboardHeight and the handlers are required to set the right height on iOS
    var keyboardHeight = 0;

    function keyboardShowHandler(e) {
        keyboardHeight = e.keyboardHeight;
    }

    function keyboardHideHandler(e) {
        keyboardHeight = 0;
        $timeout(function () {
            scroller.style.bottom = footerBar.clientHeight + 'px';
        }, 0);
    }

    // Need to resize on entering the view
    $scope.$on('elastic:resize', function (e, ta) {
        if (!ta) return;

        var taHeight = ta[0].offsetHeight;

        if (!footerBar) return;

        var newFooterHeight = taHeight + 10;
        newFooterHeight = newFooterHeight > 44 ? newFooterHeight : 44;

        footerBar.style.height = newFooterHeight + 'px';

        if (device.platform.toLowerCase() === 'ios') {
            scroller.style.bottom = newFooterHeight + keyboardHeight + 'px';
        } else {
            scroller.style.bottom = newFooterHeight + 'px';
        }
    });

    function onProfilePicError(ele) {
        this.ele.src = ''; // set a fallback
    }
  }

  function chatSettings($localStorage, $rootScope, $log) {
    return {
        restrict: 'E',
        scope: {},
        template: '<ion-list>' + '<div class="item item-divider">Sort by:</div>' + '<ion-radio ng-model="settings.sortBy" ng-click="sortByUpdated(\'updated\')" ng-value="\'updated\'">Recently updated</ion-radio>' + '<ion-radio ng-model="settings.sortBy" ng-click="sortByUpdated(\'name\')" ng-value="\'name\'">Name</ion-radio>' + '</ion-list>',
        controller: ["$scope", function controller($scope) {
            $scope.settings = $localStorage.chatSettings || { sortBy: 'updated' };
            $scope.sortByUpdated = function (newSort) {
                //$scope.settings.sortBy = newSort
                $log.debug('chatSettings.sortByUpdated ' + $scope.settings.sortBy);
                $localStorage.chatSettings = $scope.settings; // persist the settings
                $rootScope.$broadcast('chatsUpdated');
            };
        }]
    };
  }


})();