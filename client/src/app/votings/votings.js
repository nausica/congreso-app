angular.module('votings', ['resources.votings', 'ui.bootstrap'])

.controller('VotingsController', ['$scope', '$routeParams', 'Votings', function ($scope,  $routeParams, Votings) {

	var member_name = $scope.$parent.member.name;

	$scope.member_id = $routeParams.memberId;
	// Filtered votes_list
	$scope.filteredVotings = [];

	console.log(member_name);
	

	Votings.all().then(function(votings) {
		$scope.votings = votings;
		$scope.votings.forEach(function(voting){
			var v = {
				title: voting.title,
				text: voting.text,
				votes_list: voting.votes_list.filter(function(vote){
					return vote.name === member_name;
				})
			};
			$scope.filteredVotings.push(v);
		});
	});

	$scope.isMemberName = function(vote) {
		return (vote.name === $scope.member_name);
	};

}]);
