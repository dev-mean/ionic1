module starter {

    import ITranslateService = angular.translate.ITranslateService

    class ProfilePhoto {

        selected:boolean
        file:IFile

        constructor(file:IFile) {
            this.file = file
            this.selected = false
        }
    }

    /**
     * Controller for editing the users profile
     */
    export class ProfileEdit {

        // If you increase MAX_PHOTOS you will need to update LocalDB to have more photoN columns in the local SQL db
        public MAX_PHOTOS:number = 3
        public NO_IMAGE:string = 'img/add.png'

        public profile:IProfile
        public photos:ProfilePhoto[] = []
        public about:string

        private $log:ng.ILogService
        private $rootScope:starter.IAppRootScope
        private $scope:ng.IScope
        private $state
        private $q:ng.IQService
        private $ionicActionSheet
        private $cordovaCamera
        private AppService:IAppService
        private AppUtil
        private $translate: ITranslateService

        constructor($log:ng.ILogService, $rootScope:starter.IAppRootScope,  $scope:ng.IScope, $q:ng.IQService,
                    $state, $ionicActionSheet, $cordovaCamera, AppService:IAppService, AppUtil, $translate: ITranslateService) {
            this.$log = $log
            this.$rootScope = $rootScope
            this.$scope = $scope
            this.$q = $q
            this.$state = $state
            this.$ionicActionSheet = $ionicActionSheet
            this.$cordovaCamera = $cordovaCamera
            this.AppService = AppService
            this.AppUtil = AppUtil
            this.$translate = $translate

            this.$scope.$on('$ionicView.beforeEnter', () => this.refresh())
            this.$scope.$on('$ionicView.enter', () => this.expandText())
        }


        private refresh() {
            this.profile = this.AppService.getProfile()
            this.about = this.profile.about
            this.photos = _.map(this.profile.photos, photo => new ProfilePhoto(photo))
        }


        public saveProfile() {
            let profileUpdate = <IProfile>{}
            profileUpdate.about = this.about
            this.AppUtil.blockingCall(
                this.AppService.saveProfile(profileUpdate),
                () => this.refresh()
            )
        }

        public selectedCount() {
            return _.filter(this.photos, (photo) => photo.selected).length
        }

        /**
         * Deletes the selected photos from the profile
         */
        public deletePhotos() {
            // Extract the unselected photos and update the profile with those
            let remainingPhotos = _.filter(this.photos, (photo) => !photo.selected)

            let profileUpdate = <IProfile>{}
            profileUpdate.photos = _.map(remainingPhotos, (photo) => photo.file)

            this.AppUtil.blockingCall(
                this.AppService.saveProfile(profileUpdate),
                () => this.refresh()
            )
        }

        /**
         * Swaps the position of the selected photos. This should only be called when there is two selected.
         */
        public swapPhotos() {
            // Find the indexes of the two selected photos
            let first = _.findIndex(this.photos, photo => photo.selected)
            // let last = _.findLastIndex(this.photos, photo => photo.selected)
            let last = 2
            let profileUpdate = <IProfile>{}
            this.swapArrayElements(this.photos, first, last)
            profileUpdate.photos = _.map(this.photos, (photo) => photo.file)

            this.AppUtil.blockingCall(
                this.AppService.saveProfile(profileUpdate),
                () => this.refresh()
            )
        }

        /**
         * Toggle the selected state of a photo
         * @param index the photos array index
         */
        public toggleSelected(photo) {
            photo.selected = !photo.selected
        }

        /**
         * Add a profile photo
         */
        public addPhoto() {
            var buttons = [{text: this.$translate.instant('TAKE_PHOTO')}, {text: this.$translate.instant('GALLERY')}]
            if (this.$rootScope.facebookConnected)
                buttons.push({text: 'Facebook'})

            this.$ionicActionSheet.show({
                buttons: buttons,
                titleText: this.$translate.instant('SELECT_PHOTO_SOURCE'),
                cancelText: this.$translate.instant('CANCEL'),
                buttonClicked: index => {
                    if (index === 2) {
                        this.$state.go('^.fb-albums')
                    } else {
                        if (!ionic.Platform.isWebView()) {
                            // TODO implement file upload for normal browsers
                            return true
                        }

                        let sourceType:number = index === 0 ? Camera.PictureSourceType.CAMERA :
                                                                                Camera.PictureSourceType.PHOTOLIBRARY

                        var options = {
                            quality: 70,
                            destinationType: Camera.DestinationType.DATA_URL,
                            sourceType: sourceType,
                            allowEdit: false, // allowEdit allows native cropping. However not all devices
                                              // support it, so just use JavaScript cropping for now
                            encodingType: Camera.EncodingType.PNG,
                            targetWidth: 800,
                            targetHeight: 800,
                            // popoverOptions: new CameraPopoverOptions(300, 300, 200, 200, Camera.PopoverArrowDirection.ARROW_ANY),
                            saveToPhotoAlbum: false
                        }

                        this.$cordovaCamera.getPicture(options).then(imageData => {
                            // TODO don't use root scope - pass as param
                            var dataUrl = 'data:image/jpeg;base64,' + imageData
                            this.$rootScope.cropPhoto = dataUrl
                            this.$state.go('^.crop') // , {imageData: 'data:image/jpeg;base64,' + imageData}
                        }, error => {
                            if (error === 'has no access to assets') {
                                this.AppUtil.toastSimple('Access to photo gallery denied')
                                this.$log.error('$cordovaCamera.getPicture error ' + JSON.stringify(error))
                            } else {
                                this.AppUtil.toastSimpleTranslate('PHOTO_ERROR')
                                this.$log.error('$cordovaCamera.getPicture error ' + JSON.stringify(error))
                            }

                        })
                    }

                    return true
                }
            })
        }


        private expandText() {
            var element = <HTMLTextAreaElement>document.querySelector('#aboutYou')
            element.style.height = element.scrollHeight + 'px'
        }

        /**
         * Swap the elements in an array at indexes x and y.
         *
         * @param (array) The array.
         * @param (a) The index of the first element to swap.
         * @param (b) The index of the second element to swap.
         */
        private swapArrayElements(array:any[], a, b) {
            var temp = array[a]
            array[a] = array[b]
            array[b] = temp
        }

    }

    ProfileEdit.$inject = ['$log', '$rootScope', '$scope', '$q', '$state', '$ionicActionSheet', '$cordovaCamera',
                            'AppService', 'AppUtil', '$translate']
    angular.module('tscontrollers').controller('ProfileEdit', ProfileEdit)
}
