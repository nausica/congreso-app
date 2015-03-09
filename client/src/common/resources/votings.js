angular.module('resources.votings', ['mongolabResource']);

angular.module('resources.votings')
	.factory('Votings', ['mongolabResource', function ($mongolabResource) {

	var Votings = $mongolabResource('votings');
	
	Votings.previous3Months = function(successcb, errorcb) {
		var start = moment().add('months', -3);
		return Votings.query({
			'date': {
				$gt: {
					'$date': start.format('YYYY-MM-DD')+'T00:00:00.000Z' // The query won't work without the time
				}
			}
		},
		successcb, errorcb);
	};
	Votings.pageQuery = function(skip, limit, successcb, errorcb) {
		return Votings.advancedQuery(
			{},
			//{"session": 31, "order": 1},
			skip, //sk
			limit, //l
			successcb, errorcb);
	};

	Votings.getLastSession = function(skip, limit, successcb, errorcb) {
		return Votings.advancedQuery(
			{},
			{"session": -1, "order": 1},
			0, //sk
			1, //l
			successcb, errorcb);
	};
	
	return Votings;
}]);
