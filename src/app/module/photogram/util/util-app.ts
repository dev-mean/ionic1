module starter {

	/**
	 * Utilities which simplify common actions and abstracts the implementation so it easier to make application wide
	 * changes to blocking calls, toasts etc
	 */
	export class AppUtil {

		private $q:ng.IQService
		private $ionicLoading
		private $mdToast
		private $log:ng.ILogService
		private $translate
		private translations

		constructor($q:ng.IQService, $ionicLoading, $mdToast, $translate, $log:ng.ILogService) {
			this.$q = $q
			this.$ionicLoading = $ionicLoading
			this.$mdToast = $mdToast
			this.$log = $log
			this.$translate = $translate

			$translate(['REQUEST_FAILED']).then(translationsResult => this.translations = translationsResult)
		}

		/**
		 * Shows a toast message
		 * @param message
		 */
		toastSimple(message:string) {
			this.$mdToast.show(this.$mdToast.simple().content(message).hideDelay(2000))
		}

		/**
		 * Shows a toast message
		 * @param translateKey the key used to lookup the translated message
		 */
		toastSimpleTranslate(translateKey:string) {
			this.$translate([translateKey]).then(
					result => {
						let translation = result[translateKey]
						if (translation === translateKey)
							this.$log.warn('Invalid translation key ' + translateKey)
						this.toastSimple(translation)
					},
					error => this.$log.warn('toast translation error ' + JSON.stringify(error))
			)
		}


		/**
		 * A utility to simplify the common case of making a server call which blocks the user interface, and provides
		 * translation of errors.
		 *
		 * This is an example of how you might use it:
		 * function setLocation = () => AppUtil.blockingCall(
		 *        AppService.saveLocation(newLocation),
		 *        (result) => {marker.setLocation(result); AppUtil.toastSimple('LOCATION_UPDATED')}
		 *        )
		 *
		 * @param promise the promise to resolve
		 * @param successFunction the function to call on resolution of the promise
		 * @param errorTranslateKey the translation key to display an error message for on error
		 * @param errorMessage if no translation key is provided, then displays this error message on an error
		 * @returns {ng.IPromise<any>} the promise passed in as the first argument
		 */
		blockingCall<T>(promise:ng.IPromise<T>, successFunction?:(result:T) => any, errorTranslateKey?:string, errorMessage?:string) {
			var ionicLoading = this.$ionicLoading
			// Delay showing the loading spinner for 0.4s
			// See http://yuiblog.com/blog/2010/11/11/improving-perceived-site-performance-with-spinners/
			ionicLoading.show({delay:400})
			promise.then(result => {
				ionicLoading.hide()
				if (successFunction)
					successFunction(result)
			}, error => {
				ionicLoading.hide()

				let customError = this.resolveErrorMessage(error)
				if (customError) {
					this.toastSimple(customError)

				} else if (errorTranslateKey) {
					this.toastSimpleTranslate(errorMessage)

				} else if (errorMessage) {
					this.toastSimple(errorMessage)

				} else {
					this.toastSimple(this.translations['REQUEST_FAILED'])
				}
				this.$log.error('Error in blocking call ' + JSON.stringify(error))
			})
			return promise
		}


		/**
		 * Converts an error into a human friendly message for particular error messages
		 * @param error
		 * @returns {string} if there is a custom error message, else null
		 */
		resolveErrorMessage(error:any):string {
			this.$log.error(JSON.stringify(error))
			if (error.code) {
				// https://parse.com/docs/js/api/symbols/Parse.Error.html
				switch (error.code) {
					case 100: // Parse.ErrorCode.CONNECTION_FAILED
						return 'Request failed, try again'
					case 155: // Parse.ErrorCode.REQUEST_LIMIT_EXCEEDED
						return 'Server busy, try again later'
					case 209: // Parse.ErrorCode.INVALID_SESSION_TOKEN
						// TODO force logout/login
						return 'Invalid session. Log in again'
					default:
						return null
				}
			}
			return null
		}


		static appUtilFactory($q, $ionicLoading, $mdToast, $translate, $log) {
			return new AppUtil($q, $ionicLoading, $mdToast, $translate, $log)
		}
	}

	AppUtil.appUtilFactory.$inject = ['$q', '$ionicLoading', '$mdToast', '$translate', '$log']

	angular.module('tscontrollers')
		.factory('AppUtil', AppUtil.appUtilFactory);
}
