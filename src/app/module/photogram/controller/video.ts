module starter {

    import ILogService = angular.ILogService
    import IScope = angular.IScope
    import IncomingInvite = Twilio.IncomingInvite
    import Conversation = Twilio.Conversation;


    /**
     * Contr oller for t he Twilio WebRTC video calling.
     * The controller-as is defined in the index.html to ensure there is one accessible instance.
     * On Android this required the android.permission.CAMERA permission.
     * This can be added wi th the cordova plugin at https://github.com/campers/android-camera-permission/
     */
    export class  TwilioVideoChat {

        private conversationsClient
        private activeConversation
        private hasWebRTC:boolean = navigator['webkitGetUserMedia'] || navigator['mozGetUserMedia']

        private modal
        private incomingInvite: IncomingInvite
        public profile: IProfile // The profi le of t he person we are video calling with

        public state:string
        // state may be one of these three states
        public Inviting = 'inviting'
        public InCall = 'inCall'
        public Incoming = 'incoming'

        // Generate an AccessToken in the Twilio Account Portal - https://www.twilio.com/user/account/video/testing-tools

        constructor(private $log:ILogService, private $rootScope: IScope, private $scope: IScope,
                    private $ionicModal, private $ionicPopup, private AppService:IAppService, private AppUtil:AppUtil,
                    private ParseService:IParseService) {

            $scope['video'] = this
            this.$ionicModal.fromTemplateUrl('video.html', {
                scope: this.$scope,
                animation: 'slide-in-up'
            }).then(modal => this.modal = modal )

            if (AppService.twilioAccessToken) {
                this.init(AppService.twilioAccessToken)
            } else {
                $rootScope.$on('twilioAccessToken', (event, token) => this.init(token))
            }
        }

        public isSupported(): boolean {
            return this.hasWebRTC && this.conversationsClient && this.conversationsClient.isListening
        }


        private init(twilioAccessToken: string) {
            this.$log.log('Initialising Twilio')
            if (!this.hasWebRTC) {
                this.$log.log('WebRTC not supported')
                return
            }

            var accessManager = new Twilio.AccessManager(twilioAccessToken)

            accessManager.on('tokenExpired', () => {
                this.$log.warn('Twilio token expired')
                this.ParseService.getTwilioToken().then(
                    token => { accessManager.updateToken(token) },
                    error => this.$log.error('Error getting an updated Twilio token', error)
                )
            })
            accessManager.on('error', error => {
                this.closeModal()
                this.AppUtil.toastSimpleTranslate('VIDEO_SERVICE_ERROR')
                this.$log.error('Twilio access manager error', error)
            })


            this.conversationsClient = new Twilio.Conversations.Client(accessManager)
            this.conversationsClient.listen().then(
                    () => this.onClientConnected(),
                    error => {
                        this.$log.error('Twilio Conversations.Client.listen() error', error)
                        this.AppUtil.toastSimpleTranslate('VIDEO_SERVICE_ERROR')
                    }
            )

            this.conversationsClient.on('error', error => {
                this.closeModal()
                this.AppUtil.toastSimpleTranslate('VIDEO_SERVICE_ERROR')
                this.$log.error('Twilio conversation client error', error)
                // TODO handle error here. Only show popup if there was an active conversation or invite?
            })
        }

        private openModal(state:string) {
            this.state = state
            this.modal.show()
        }

        private closeModal() {
            this.modal.hide()

            if (this.activeConversation) {
                try {
                    this.activeConversation.localMedia.stop()
                    this.activeConversation.disconnect()
                } catch (e) {/**/}
                this.activeConversation = null
            }

            this.profile = null
            this.state = null
            this.incomingInvite = null
        }

        /**
         * Invite a user to video chat
         * @param userId the user to invite
         */
        public invite(userId: string) {
            this.$log.log('Inviting user id:' + userId)
            this.profile = this.AppService.getProfileByUserId(userId)
            this.openModal(this.Inviting)

            this.conversationsClient.inviteToConversation(userId).then(
                    conversation => this.conversationStarted(conversation),
                    error => {
                        this.closeModal()
                        this.AppUtil.toastSimpleTranslate('VIDEO_START_ERROR')
                        this.$log.error('Twilio conversationStarted error ' + error + ' ' + JSON.stringify(error))
                    }
            )
        }

        // Button actions

        /** Accepting an incoming video invite */
        public accept() {
            if (this.incomingInvite && this.incomingInvite.status === 'pending') {
                this.incomingInvite.accept().then(
                        conversation => this.conversationStarted(conversation),
                        error => {
                            this.closeModal()
                            this.AppUtil.toastSimpleTranslate('VIDEO_START_ERROR')
                            this.$log.error('Twilio incomingInvite.accept() error', error)
                        })
            } else {
                this.closeModal()
                this.AppUtil.toastSimpleTranslate('VIDEO_START_ERROR')
                this.$log.info('Did not accept incomingInvite ' + (this.incomingInvite ? this.incomingInvite.status : 'null'))
            }

        }

        /** Reject an incoming video invite */
        public reject() {
            if (this.incomingInvite) {
                try {
                    this.incomingInvite.reject()
                } catch (e) {
                    this.$log.warn('Error rejecting video invite', e)
                }
            }
            this.closeModal()
        }

        /** Cancel an outgoing invite in progress */
        public cancelInvite() {
            // TODO cancel the successful creation of the conversation
            this.closeModal()
        }

        /** Disconnect from a video call currently in progress */
        public disconnect() {
            this.closeModal()
            if (this.activeConversation)
                this.activeConversation.disconnect()
        }


        private onClientConnected() {
            this.$log.log('Connected to Twilio. Listening for incoming Invites as ' + this.conversationsClient.identity)

            this.conversationsClient.on('invite', incomingInvite => {
                this.$log.log('Incoming video invite from: ' + incomingInvite.from)
                this.profile = this.AppService.getProfileByUserId(incomingInvite.from)

                if (this.activeConversation) {
                    this.AppUtil.toastSimpleTranslate('Conversation already active. Rejecting invite')
                    incomingInvite.reject()
                } else {
                    this.incomingInvite = incomingInvite
                    this.openModal(this.Incoming)
                }
            })
        }

        /** conversation is live */
        private conversationStarted(conversation: Conversation) {
            this.$log.log('In an active Conversation')
            this.activeConversation = conversation
            this.state = this.InCall
            this.$scope.$apply() // this comes in outside of the angular lifecycle so notify this.state has updated

            // Draw local video
            conversation.localMedia.attach('#video-local')
            this.$log.log('Attached local media')

            // When a participant joins, draw their video on screen
            conversation.on('participantConnected', (participant) => {
                this.$log.log('Participant ' + participant.identity + ' connected')
                participant.media.attach('#video-remote')
                this.$log.log('Attached remote video')
            })
            // When a participant disconnects, note in log
            conversation.on('participantDisconnected', (participant) => {
                this.$log.log('Participant ' + participant.identity + ' disconnected')
                participant.media.detach('#video-remote')
                this.closeModal()
            })
            // When the conversation ends, stop capturing local video
            conversation.on('ended', (conversation) => {
                this.$log.log('Twilio conversation ended')
                conversation.localMedia.stop()
                conversation.disconnect()
                this.activeConversation = null
                this.closeModal()
            })
        }


    }

    TwilioVideoChat.$inject = ['$log', '$rootScope', '$scope', '$ionicModal', '$ionicPopup', 'AppService', 'AppUtil', 'ParseService']
    angular.module('tscontrollers').controller('TwilioVideoChat', TwilioVideoChat)

    // http://blog.aaronholmes.net/writing-angularjs-directives-as-typescript-classes/
/*
    class VideoInviteDirective implements ng.IDirective {
        restrict = 'A'
        require = 'ngModel'

        constructor(private $location: ng.ILocationService, private appService: IAppService) {
        }

        link = (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs: ng.IAttributes, ctrl: any) => {
            var isClickable = angular.isDefined(attrs.isClickable) && scope.$eval(attrs.isClickable) === true ? true : false;

            scope.onHandleClick = function() {
                if (!isClickable) return
                console.log('onHandleClick')
            }
        }

        static factory(): ng.IDirectiveFactory {
            const directive = ($location: ng.ILocationService, appService: IAppService) => new VideoInviteDirective($location, appService)
            directive.$inject = ['$location', 'AppService']
            return directive
        }
    }

    module.directive('video-invite', VideoInviteDirective.factory())
*/
}

