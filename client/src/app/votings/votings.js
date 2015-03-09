/* global angular */

(function () {

	'use strict';

	angular.module('votings', [
		'resources.votings', 
		'resources.votes', 
		'ui.bootstrap'])

	.controller('VotingDetailCtrl', ['$scope', '$location', 'voting', 'votes', function ($scope, $location, voting, votes) {
		$scope.voting = voting;
		$scope.voting.formattedDay = moment(voting.date.$date).format('D'); // GRRRRRRRR
		$scope.voting.formattedYear = moment(voting.date.$date).format('YYYY');
		$scope.voting.formattedMonth = moment(voting.date.$date).format('MMMM');

		$scope.votes_distribution = {
			'Yes': {
				count: 0,
				votes: []
			},
			'No' : {
				count: 0,
				votes: []
			},
			'NoVote' : {
				count: 0,
				votes: []
			},
			'Abstaining' : {
				count: 0,
				votes: []
			}
		};

		angular.forEach(votes, function (vote) {
			if (vote.vote === 'Sí') {
				$scope.votes_distribution['Yes'].votes.push(vote);
				$scope.votes_distribution['Yes'].count++;
			} else if (vote.vote === 'No') {
				$scope.votes_distribution['No'].votes.push(vote);
				$scope.votes_distribution['No'].count++;
			} else if (vote.vote === 'No vota') {
				$scope.votes_distribution['NoVote'].votes.push(vote);
				$scope.votes_distribution['NoVote'].count++;
			} else {
				$scope.votes_distribution['Abstaining'].votes.push(vote);
				$scope.votes_distribution['Abstaining'].count++;
			}
		});

		$scope.viewMember = function (vote) {
			$location.path('/members/'+vote.member_id.$oid);
		};
	}]);
}());
