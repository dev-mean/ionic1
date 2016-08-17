angular.module('tscontrollers')
	/*
	 * Decorates the angular log service to submit error messages to the Parse backend.
	 * The last 10 log messages are also sent to add to the context of the error message.
	 * Server submissions are limited to once every 10 seconds and duplicate error messages
	 * in a row are not sent to avoid spamming the server.
	 */
	.config([ '$provide', 'parseSubDomain', 'serverURL', function( $provide, parseSubDomain, serverURL) {

		if (!parseSubDomain) {
			console.error('ERROR: parseSubDomain config value not configured for logging')
			return
		}

		// The static part of the HTTP POST data
		let staticData

		$provide.decorator( '$log', [ '$delegate', '$injector', function( $delegate, $injector ) {
			var debugFn = $delegate.debug
			var infoFn = $delegate.info
			var logFn = $delegate.log
			var warnFn = $delegate.warn
			var errorFn = $delegate.error

			const MAX_RECENT = 30
			const MIN_TIME_DELAY = 10 * 1000
			var recent = []

			var lastError = ''
			var lastSubmitTime = 0

			// Update the list of recent $log messages
			function updateRecent(args) {
				try {
					if (args[0]) {
						recent.unshift(args[0])
						if (recent.length > MAX_RECENT)
							recent.pop()
					}
				} catch (e) { //
				}
			}

			$delegate.debug = function() {
				var args = [].slice.call(arguments)
				debugFn.apply(null, args)
				updateRecent(args)
			}

			$delegate.info = function() {
				var args = [].slice.call(arguments)
				infoFn.apply(null, args)
				updateRecent(args)
			}

			$delegate.log = function() {
				var args = [].slice.call(arguments)
				logFn.apply(null, args)
				updateRecent(args)
			}

			$delegate.warn = function() {
				var args = [].slice.call(arguments)
				warnFn.apply(null, args)
				updateRecent(args)
			}

			$delegate.error = function() {
				var args = [].slice.call(arguments)
				errorFn.apply(null, args)

				try {
					if (!staticData) {
						// Need to do this here when the platform is ready and the version has been set in the root scope
						const $rootScope = $injector.get('$rootScope')
						staticData = '&appVersion=' + $rootScope.appVersion
							+ '&platform=' + encodeURIComponent(ionic.Platform.platform())
							+ '&platformVersion=' + encodeURIComponent('' + ionic.Platform.version())
					}

					var user = Parse.User.current()
					var userId = user ? user.id : ''
					var errorMessage = args[0] || ''

					if (errorMessage !== lastError && Date.now() > (lastSubmitTime + MIN_TIME_DELAY)) {

						var xmlHttp = new XMLHttpRequest()
						xmlHttp.open('POST', 'http://' + parseSubDomain + '.parseapp.com/client-log', true)
						xmlHttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
						var data = 'userId=' + encodeURIComponent(userId)
							+ '&message=' + encodeURIComponent(errorMessage)
							+ '&recent=' + encodeURIComponent(JSON.stringify(recent))
							+ staticData

						lastError = errorMessage
						lastSubmitTime = Date.now()

						xmlHttp.send(data)
					}
				} catch (e) {
					console.log('Error submitting error log to server:' + e)
				}
				updateRecent(args)
			}

			return $delegate
		}])
	}])
;
