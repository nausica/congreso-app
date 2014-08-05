angular.module('resources.votings', ['mongolabResource']);

angular.module('resources.votings')
	.factory('Votings', ['mongolabResource', function ($mongolabResource) {

	var Votings = $mongolabResource('votings');
	
	Votings.previous3Months = function(successcb, errorcb) {
		var start = moment().add('months', -1);
		return Votings.query({
			'date': {
				$gt: {
					'$date': start.format('YYYY-MM-DD')+'T00:00:00.000Z' // The query won't work without the time
				}
			}
		}, successcb, errorcb);
	};
	
	return Votings;
}]);
