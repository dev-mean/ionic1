/**
 * Filters which contain app specific functionality
 *
 */
angular.module('tscontrollers')


	.filter('distance', ['AppService', function(AppService: starter.IAppService) {
		/**
		 * Takes a ILocation and outputs the distance from the current users profile location
		 */
		return function(location: starter.ILocation):string {

			if (!location || !angular.isNumber(location.latitude) || !angular.isNumber(location.longitude))
				return ''

			var userProfile = AppService.getProfile()

			var from = userProfile.location
			var to = location

			var distance = getDistanceFromLatLonInKm(from.latitude, from.longitude, to.latitude, to.longitude)

			if (userProfile.distanceType === 'mi')
				distance *= 1.609344

			let output:string = distance.toFixed(0)
			// Always say at least 1km even if less than that
			output = output === '0' ? '1' : output

			output += userProfile.distanceType

			return output


			// from http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
			function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2): number {
				var R = 6371 // Radius of the earth in km
				var dLat = deg2rad(lat2 - lat1)
				var dLon = deg2rad(lon2 - lon1)
				var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
				var d = R * c // Distance in km
				return d
			}

			function deg2rad(deg: number): number {
				return deg * (Math.PI / 180)
			}

		}
	}])
