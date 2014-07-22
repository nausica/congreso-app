/* global angular */

(function () {

	'use strict';

	angular.module('members', [
		'resources.members', 
		'resources.votings', 
		'resources.votes', 
		'ui.bootstrap', 
		'votings',
		'ngRoute'])

	.config(['$routeProvider', function ($routeProvider) {
		$routeProvider
			.when('/members/search/:province', {
				templateUrl:'members/members-list.tpl.html',
				controller:'MembersViewCtrl',
				resolve:{
					members:['Members', '$route', function (Members, $route) { // $routeParams.province isn't set when the callback is executed, using $route 
						return Members.forProvince($route.current.params.province);
					}]
				}
			})
			.when('/members', {
				templateUrl:'members/members-list.tpl.html',
				controller:'MembersViewCtrl',
				resolve:{
					members:['Members', function (Members) {
						return Members.all();
					}]
				}
			})
			.when('/members/:memberId', {
				templateUrl:'members/member-detail.tpl.html',
				controller:'MemberDetailCtrl',
				resolve:{
					member:['Members', '$route', function (Members, $route) {
						return Members.getById($route.current.params.memberId);
					}],
					votings: ['Votings', '$route', function (Votings, $route) {
						return Votings.all();
					}],
					votes: ['Votes', '$route', function (Votes, $route) {
						return Votes.findByMemberId($route.current.params.memberId);
					}]
				}
			})
			.when('/votings/:votingId', {
				templateUrl:'votings/voting-detail.tpl.html',
				controller:'VotingDetailCtrl',
				resolve:{
					voting: ['Votings', '$route', function (Votings, $route) {
						return Votings.getById($route.current.params.votingId);
					}],
					votes: ['Votes', '$route', function (Votes, $route) {
						return Votes.findByVotingId($route.current.params.votingId);
					}]
				}
			});

	}])

	.controller('MembersViewCtrl', ['$scope', '$location', '$routeParams', 'members', function ($scope, $location, $routeParams, members) {
		$scope.members = members;
		//$scope.province = 'Madrid';

		$scope.changeProvince = function () {
			$location.path('/members/search/'+$scope.province);
		};

		$scope.viewMember = function (member) {
			$location.path('/members/'+member.$id());
		};

	}])

	.controller('MemberDetailCtrl', ['$scope', '$location', '$routeParams', 'member', 'votings', 'votes', function ($scope, $location, $routeParams, member, votings, votes) {
		var votes_map = {};	

		var resultClass = function(voting) {
			// Asentimiento ?
			if (voting.result === 'Sí') {
				return 'bg-success';
			}
			if (voting.votes_for > voting.votes_against) {
				return 'bg-success';
			} else {
				return 'bg-danger';
			}
		};

		$scope.viewVoting = function (voting) {
			$location.path('/votings/'+voting.$id());
		};

		$scope.member = member;
		$scope.votings = [];

		// Map votes results
		angular.forEach(votes, function (vote) {
			if (!votes_map[vote.voting_id.$oid]) { // Is this the only way to reach the id?
				votes_map[vote.voting_id.$oid] = vote.vote;
			}
		});

		angular.forEach(votings, function (voting) {
			var v = angular.extend({}, voting);
			v.$id = voting.$id; // for some reason it's not added.
			v.vote = votes_map[voting.$id()];
			v.formattedDay = moment(voting.date.$date).format('D'); // GRRRRRRRR
			v.formattedYear = moment(voting.date.$date).format('YYYY');
			v.formattedMonth = moment(voting.date.$date).format('MMMM');
			v.formattedDate = moment(voting.date.$date).format('MMMM Do YYYY');
			v.resultClass = resultClass(v); 
			v.voteClass = v.vote === 'Sí' ? 'bg-success' : (v.vote === 'No' ? 'bg-danger' : 'bg-warning' );
			$scope.votings.push(v);
		});

		$scope.pager = {
			totalItems: $scope.votings.length,
			currentPage : 1,
			itemsPerPage : 5,
			maxSize: 5
		};

  		$scope.$watch('pager.currentPage + pager.itemsPerPage', function() {
  			console.log($scope.pager.currentPage)
    		var begin = (($scope.pager.currentPage - 1) * $scope.pager.itemsPerPage),
        	end = begin + $scope.pager.itemsPerPage;

      		$scope.filteredVotings = $scope.votings.slice(begin, end);
    	});
	}])
}());
