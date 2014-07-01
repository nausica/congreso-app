angular.module('votings', ['resources.votings', 'ui.bootstrap'])

.controller('VotingsController', ['$scope', 'Votings', function ($scope, Votings) {

	Votings.all().then(function(votings) {
		$scope.votings = votings;
	});

}])
