module starter {

    /**
     * Controller for the social sharing action
     */
    export class ShareController {

        private $log:ng.ILogService
        private $cordovaSocialSharing
        private socialShareMessage:string

        constructor($log:ng.ILogService, $cordovaSocialSharing, socialShareMessage:string) {
            this.$log = $log
            this.$cordovaSocialSharing = $cordovaSocialSharing
            this.socialShareMessage = socialShareMessage
        }


        public share() {
            this.$cordovaSocialSharing
                .share(this.socialShareMessage) // Share via native share sheet
                .then(() => {
                    this.$log.debug('Social share action complete')
                }, error => {
                    this.$log.error('Social share action error ' + JSON.stringify(error))
                })
        }
    }

    ShareController.$inject = ['$log', '$cordovaSocialSharing', 'socialShareMessage']
    angular.module('tscontrollers').controller('ShareController', ShareController)
}
