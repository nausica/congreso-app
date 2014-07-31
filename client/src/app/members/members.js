/* global angular */

(function () {

	'use strict';

	angular.module('members', [
		'resources.members', 
		'resources.votings', 
		'resources.votes', 
		'ui.bootstrap', 
		'votings',
		'ui.router'])

	.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('search', {
				url: '/members/search/:province',
				templateUrl:'members/members-list.tpl.html',
				controller:'MembersViewCtrl',
				resolve:{
					members:['Members', '$stateParams', function (Members, $stateParams) { 
						return Members.forProvince($stateParams.province);
					}]
				}
			})
			.state('members', {
				url: '/members',
				templateUrl:'members/members-list.tpl.html',
				controller:'MembersViewCtrl',
				resolve:{
					members:['Members', function (Members) {
						return Members.all();
					}]
				}
			})
			.state('member', {
				url: '/members/:memberId',
				templateUrl:'members/member-detail.tpl.html',
				controller:'MemberDetailCtrl',
				resolve:{
					member:['Members', '$stateParams', function (Members, $stateParams) {
						return Members.getById($stateParams.memberId);
					}],
					votings: ['Votings', function (Votings) {
						return Votings.all();
					}],
					votes: ['Votes', function (Votes) {
						return Votes.all();
					}]
				}
			})
			.state('voting', {
				url: '/votings/:votingId',
				templateUrl:'votings/voting-detail.tpl.html',
				controller:'VotingDetailCtrl',
				resolve:{
					voting: ['Votings', '$stateParams', function (Votings, $stateParams) {
						return Votings.getById($stateParams.votingId);
					}],
					votes: ['Votes', '$stateParams', function (Votes, $stateParams) {
						return Votes.findByVotingId($stateParams.votingId);
					}]
				}
			});

	}])

	.controller('MembersViewCtrl', ['$scope', '$location', '$stateParams', 'members', function ($scope, $location, $stateParams, members) {
		$scope.members = members;
		$scope.province = $stateParams.province;
		$scope.display_province = ($scope.province ?   $scope.province : 'todas las provincias') + ' (' + $scope.members.length + ')';

		$scope.viewMember = function (member) {
			$location.path('/members/'+member.$id());
		};

	}])

	.controller('MemberDetailCtrl', ['$scope', '$location', '$window', '$stateParams', 'member', 'votings', 'votes', function ($scope, $location, $window, $stateParams, member, votings, votes) {
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

		$scope.contactMail = function(email) {
			$window.open('mailto:'+email+'?subject=mail subject&body=mail body', '_blank');
		}
		$scope.contactFacebook = function(facebook) {
			$window.open(facebook, '_blank');
		}
		$scope.contactTwitter = function(twitter) {
			$window.open(twitter, '_blank');
		}
		$scope.contactBlog = function(blog) {
			$window.open(blog, '_blank');
		}

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
