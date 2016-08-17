module starter {

	export interface IImagesUtil {
		convertImgUrlToBase64(url:string, outputFormat:string): ng.IPromise<string>
		convertImgIdToBase64(imgId:string): string
		convertImgToBase64(imgElement:HTMLImageElement): string
	}

	export class ImagesUtil implements IImagesUtil {

		constructor(private $q:ng.IQService) {}

		public convertImgUrlToBase64(url:string, outputFormat:string):ng.IPromise<string> {
			let q = this.$q.defer()
			let canvas = <HTMLCanvasElement>document.createElement('CANVAS'),
				ctx = canvas.getContext('2d'),
				img = new Image
			img.crossOrigin = 'Anonymous'
			img.onload = () => {
				let dataURL:string
				canvas.height = img.height
				canvas.width = img.width
				ctx.drawImage(img, 0, 0)
				dataURL = canvas.toDataURL(outputFormat)
				canvas = null
				q.resolve(dataURL)
			}
			img.onerror = () => q.reject('Failed to load image ' + url)

			img.src = url
			return q.promise
		}



		public convertImgIdToBase64(imgId: string): string {
			if (!imgId)
				throw 'convertImgIdToBase64 requires imgId'
			var img = <HTMLImageElement>document.getElementById(imgId)
			if (!img)
				throw 'Could not find element with id ' + imgId
			return this.convertImgToBase64(img)
		}

		public convertImgToBase64(imgElement:HTMLImageElement): string {
			// imgElem must be on the same server or,
			// the img element must have the crossorigin="anonymous" attribute and the server set the otherwise CORS header
			// otherwise a cross-origin error will be thrown "SECURITY_ERR: DOM Exception 18"
			var canvas = document.createElement('canvas')
			canvas.width = imgElement.clientWidth
			canvas.height = imgElement.clientHeight
			var ctx = canvas.getContext('2d')
			ctx.drawImage(imgElement, 0, 0)
			var dataURL = canvas.toDataURL('image/png')
			return dataURL.replace(/^data:image\/(png|jpg);base64,/, '')
		}

		static imagesUtilFactory($q) {
			return new ImagesUtil($q)
		}
	}

	ImagesUtil.imagesUtilFactory.$inject = ['$q']

	angular.module('tscontrollers')
		.factory('ImagesUtil', ImagesUtil.imagesUtilFactory)
}
