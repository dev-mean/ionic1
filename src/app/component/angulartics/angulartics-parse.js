/**
 * @ngdoc overview
 * @name angulartics.parse
 * Enables analytics support for Parse.com (https://parse.com/docs/js/api/symbols/Parse.Analytics.html)
 */
angular.module('angulartics.parse', ['angulartics'])
	.config(['$analyticsProvider', function($analyticsProvider) {

		$analyticsProvider.registerPageTrack(function(path) {
			var dimensions = {}
			var user = Parse.User.current()
			if(user)
				dimensions.user = user.id

			Parse.Analytics.track(path, dimensions)
		})

		$analyticsProvider.registerEventTrack(function(action, properties) {

			if(!properties)
				properties = {}

			// Add the 'user' property if it doesn't exist
			if(!properties.user) {
				var user = Parse.User.current()
				if(user)
					properties.user = user.id
			}

			Parse.Analytics.track(action, properties)
		})

	}
	]);
