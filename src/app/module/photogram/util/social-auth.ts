module starter {

	/**
	 * Methods for authentication with social sites
	 */
	export class SocialAuth {

		private $q:ng.IQService
		private $log:ng.ILogService
		private $http:ng.IHttpService
		private $translate
		private translations

		constructor($q:ng.IQService, $log:ng.ILogService, $http:ng.IHttpService, $translate) {
			this.$q = $q
			this.$log = $log
			this.$http = $http
			this.$translate = $translate

			// $translate(['REQUEST_FAILED']).then(translationsResult => this.translations = translationsResult)
		}

		/*
		 * Modified from https://github.com/driftyco/ng-cordova/blob/master/src/plugins/oauth.js
		 *
		 * Sign into the LinkedIn service
		 * https://developer.linkedin.com/docs/oauth2
		 *
		 * @param    string clientId
		 * @param    string clientSecret
		 * @param    array appScope - the permission scope to authorise. For example r_basicprofile, r_emailaddress
		 * @param    string state - A random string to test again CSRS attacks
		 * @return   promise - Resolves to the authentication data
		 */
		public linkedIn (clientId, clientSecret, appScope, state) {
			var deferred = this.$q.defer()
			if (window.cordova) {
				var cordovaMetadata = cordova.require('cordova/plugin_list').metadata
				if (cordovaMetadata.hasOwnProperty('cordova-plugin-inappbrowser') === true ||
					cordovaMetadata.hasOwnProperty('org.apache.cordova.inappbrowser') === true) {
					var browserRef = window.open('https://www.linkedin.com/uas/oauth2/authorization?client_id=' + clientId +
						'&redirect_uri=http://localhost/callback&scope=' + appScope.join(' ') + '&response_type=code&state=' + state,
						'_blank', 'location=no,clearsessioncache=yes,clearcache=yes')
					browserRef.addEventListener('loadstart', event => {
						if ((event.url).indexOf('http://localhost/callback') === 0) {
							var requestToken = (event.url).split('code=')[1]
							this.$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
							this.$http({method: 'post', url: 'https://www.linkedin.com/uas/oauth2/accessToken',
								data: 'client_id=' + clientId + '&client_secret=' + clientSecret + '&redirect_uri=http://localhost/callback'
								+ '&grant_type=authorization_code' + '&code=' + requestToken })
								.success(data => {
									deferred.resolve(data)
								})
								.error((data, status) => {
									deferred.reject('Problem authenticating LinkedIn ' + JSON.stringify(data) + ' ' + JSON.stringify(status))
								})
								.finally(() => {
									setTimeout(function() {
										browserRef.close()
									}, 10)
								})
						}
					})
					browserRef.addEventListener('exit', (event) => {
						deferred.reject('The LinkedIn sign in flow was canceled')
					})
				} else {
					deferred.reject('LinkedIn auth: Could not find InAppBrowser plugin')
				}
			} else {
				deferred.reject('Cannot authenticate LinkedIn via a web browser')
			}
			return deferred.promise
		}



		static socialAuthFactory($q, $log, $http, $tanslate) {
			return new SocialAuth($q, $log, $http, $tanslate)
		}
	}

	SocialAuth.socialAuthFactory.$inject = ['$q', '$log', '$http', '$translate']

	angular.module('tscontrollers')
		.factory('SocialAuth', SocialAuth.socialAuthFactory)
}
