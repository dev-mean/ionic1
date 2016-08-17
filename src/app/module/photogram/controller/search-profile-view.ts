import ITranslateService = angular.translate.ITranslateService

module app {
	export class SearchProfileView {

		private translations
		public profile:IProfile

		static $inject = ['$log', '$scope', '$stateParams', '$ionicHistory', '$ionicActionSheet', 'AppUtil', 'AppService', '$translate']
		constructor(private $log:ng.ILogService, private $scope:ng.IScope, private $stateParams, private $ionicHistory,
					private $ionicActionSheet, private AppUtil:AppUtil, private AppService:IAppService,
					private $translate:ITranslateService) {

			$translate(['REQUEST_FAILED', 'REPORT', 'MATCH_OPTIONS', 'CANCEL']).then(translationsResult => {
				this.translations = translationsResult
			})
			$scope.$on('$ionicView.beforeEnter', (event, data) => this.ionViewWillEnter())
		}

		ionViewWillEnter() {
			this.profile = this.$stateParams['profile']
			this.$scope['profile'] = this.profile
		}

		like() {
			let match = this.AppService.getProfileSearchResults().pop()
			this.AppService.processMatch(match, true)
			this.$ionicHistory.goBack()
		}

		reject() {
			let match = this.AppService.getProfileSearchResults().pop()
			this.AppService.processMatch(match, false)
			this.$ionicHistory.goBack()
		}

		profileOptions() {
			this.$ionicActionSheet.show({
				destructiveText: this.translations.REPORT,
				titleText: this.translations.MATCH_OPTIONS,
				cancelText: this.translations.CANCEL,
				cancel: function() {/**/},
				destructiveButtonClicked: index => {
					this.report()
					return true
				}
			})
		}

		report() {
			let profile = this.AppService.getProfileSearchResults().pop()

			this.AppUtil.blockingCall(
				this.AppService.reportProfile('profile', profile),
				() => {
					this.AppService.processMatch(profile, false)
					this.$ionicHistory.goBack()
				}
			)
		}

	}

	angular.module('tscontrollers').controller('SearchProfileView', SearchProfileView)
}
