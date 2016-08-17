/**
 * Util directives which don't contain any app domain model/services specific functionality
 */
angular.module('app.photogram')

	/**
	 * This directive should be added as the last element in a scrollable ion-content.
	 * When the native keyboard shows it will add a space the size of the keyboard at the
	 * end of the scroll page and scroll down so what was displaying at the bottom of the
	 * screen will display at the top of the keyboard.
	 *
	 * scrollDelegate - the id of the ionicScrollDelegate to adjust
	 * offset - (optional) the id of an element to reduce the adjustment by. For example a sub-footer bar which
	 *            is hidden when the keyboard displays
	 */
	.directive('keyboardScrollSpacer', ["$log", "$timeout", "$ionicScrollDelegate", "$document", function ($log, $timeout, $ionicScrollDelegate, $document) {
		return {
			restrict: 'E',
			scope: {
				'offset': '@',
				'scrollDelegate': '@'
			},
			template: '<div style="height:0"></div>',
			link: function link(scope, element, attr) {

				var viewScroll = $ionicScrollDelegate.$getByHandle(scope.scrollDelegate);
				// The height of the keyboard, which will get set the first time there is a native.keyboardshow event
				var keyboardHeight;
				// How far to scroll, allowing for an offset
				var scrollDistance;

				// Get the height of the offset element if provided
				var offsetHeight = 0;
				if (scope.offset) {
					var offsetElement = $document[0].getElementById(scope.offset);
					if (offsetElement) offsetHeight = offsetElement.offsetHeight;else $log.warn('keyboardScrollSpacer could not find element with id scope.offset');
				}

				function keyboardShow(event) {
					keyboardHeight = event.keyboardHeight;
					// Add add the empty space and scroll up so the content moves up with keyboard
					scrollDistance = event.keyboardHeight - offsetHeight;
					element.css('height', scrollDistance);
					viewScroll.scrollBy(0, scrollDistance, false);
				}

				function keyboardHide(event) {
					var scrollFromBottom = viewScroll.getScrollView().getScrollMax().top - viewScroll.getScrollPosition().top;

					// Remove the empty space so the visible content move down as the keyboard closes
					element.css('height', 0);
					if (scrollFromBottom <= keyboardHeight) // It doesn't like scrolling more than possible, so just call scrollBottom
						$timeout(function () {
							return viewScroll.scrollBottom(false);
						});else $timeout(function () {
						return viewScroll.scrollBy(0, -scrollDistance, false);
					});
				}

				window.addEventListener('native.keyboardshow', keyboardShow);
				window.addEventListener('native.keyboardhide', keyboardHide);

				scope.$on('$destroy', function () {
					window.removeEventListener('native.keyboardshow', keyboardShow);
					window.removeEventListener('native.keyboardhide', keyboardHide);
				});
			}
		};
	}])

	// For example this can be used so a chat message is sent when the user presses return on the keyboard
	.directive('return-on-enter', ["$timeout", function ($timeout) {
		return {
			restrict: 'A',
			scope: {
				'returnClose': '=',
				'onReturn': '&',
				'onFocus': '&',
				'onBlur': '&'
			},
			link: function link(scope, element, attr) {
				element.bind('focus', function (e) {
					if (scope.onFocus) {
						$timeout(function () {
							scope.onFocus();
						});
					}
				});
				element.bind('blur', function (e) {
					if (scope.onBlur) {
						$timeout(function () {
							scope.onBlur();
						});
					}
				});
				element.bind('keydown', function (e) {
					if (e.which == 13) {
						if (scope.returnClose) element[0].blur();
						if (scope.onReturn) {
							$timeout(function () {
								scope.onReturn();
							});
						}
					}
				});
			}
		};
}]);