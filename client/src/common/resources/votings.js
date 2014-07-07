angular.module('resources.votings', ['mongolabResource']);

angular.module('resources.votings')
	.factory('Votings', ['mongolabResource', function ($mongolabResource) {

	var Votings = $mongolabResource('votings');
	
	Votings.previous3Months = function(successcb, errorcb) {
		var start = moment().add('months', -3).toDate();

		return Votings.query({'date': {$gt: start}}, successcb, errorcb);
	};
	
	return Votings;
}]);
