angular.module('app.photogram')

	.filter('escapeHTML', function() {
		return function(text) {
			if (text) {
				return text.
					replace(/&/g, '&amp;').
					replace(/</g, '&lt;').
					replace(/>/g, '&gt;').
					replace(/'/g, '&#39;').
					replace(/"/g, '&quot;')
			}
			return ''
		}
	})


	.filter('chatDateFormat', function() {
		var millisInWeek = 1000 * 60 * 60 * 24 * 7
		return function(date) {
			if (!date)
				return ''

			// If the date is less than a week ago then output the Day and time e.g. Fri 3:30 pm
			// Else print the date and time e.g. Oct 12 6:30am

			var now = Date.now()
			if(now - date.getTime() < millisInWeek)
				return dateFormat(date, 'ddd h:MM TT')
			else
				return dateFormat(date, 'd mmm h:MM TT')

		}
	})

	.filter('dateFormat', function() {
		return function(date, format) {
			if (!date)
				return ''

			return dateFormat(date, format)
		}
	})
