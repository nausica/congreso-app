/* global angular */

(function () {

	'use strict';

	angular.module('members', [
		'resources.members', 
		'resources.votings', 
		'resources.votes', 
		'resources.provinces',
		'ui.bootstrap', 
		'votings',
		'ui.router',
		'ngResource'])

	.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		$stateProvider
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
			.state('member', {
				url: '/members/:memberId',
				templateUrl:'members/member-detail.tpl.html',
				controller:'MemberDetailCtrl',
				resolve:{
					member:['Members', '$stateParams', function (Members, $stateParams) {
						return Members.getById($stateParams.memberId);
					}],
					votings: ['Votings', function (Votings) {
						return Votings.previous3Months();
					}],
					votes: function (Votes, $stateParams, votings, member) {
						return Votes.findByMemberIdAndVotings($stateParams.memberId, votings);
					}
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

	.controller('MembersViewCtrl', ['$scope', '$location', '$stateParams', '$state', 'members', 'ProvincesJsonService', function ($scope, $location, $stateParams, $state, members, ProvincesJsonService) {
		$scope.members = members;
		$scope.display_province = ($stateParams.province ?   $stateParams.province : 'todas las provincias') + ' (' + $scope.members.length + ')';

		ProvincesJsonService.get(function(data){
			$scope.provinces = data.province_list;
		});
		
		$scope.viewMember = function (member) {
			$location.path('/members/'+member.$id());
		};
	
		$scope.selectProvince = function(province) {
			//$state.go('.search({ province: '+province.name+' })');
			$location.path('/members/search/'+province.name);
		}
	  	
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

		$scope.contactMail = function(email, name) {
			var formattedBody = "Querido\/a "+ name + ",\n[Tu mensaje aquí]\n\nSinceramente,\n[Tu nombre aquí]\n#contactales";
			$window.open('mailto:'+email+'?subject=Consulta'
				+'&body='+ encodeURIComponent(formattedBody), 
				'_blank');
		}
		$scope.contactFacebook = function(facebook) {
			$window.open(facebook, '_blank');
		}
		$scope.contactTwitter = function(twitter) {
			var user = twitter.split('https://twitter.com/')[1];
			var formattedText = '@'+user + ' [Tu mensaje aquí] #contactales';
			var url = "https://twitter.com/intent/tweet?related=journey_labs&text="+encodeURIComponent(formattedText)
				+"&original_referer=http://localhost:3000/members/53bc0c0a52c2f50c2ba501c1"
			$window.open(url, '_blank', 'width=500,height=500');
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
    		var begin = (($scope.pager.currentPage - 1) * $scope.pager.itemsPerPage),
        	end = begin + $scope.pager.itemsPerPage;

      		$scope.filteredVotings = $scope.votings.slice(begin, end);
    	});
	}])
}());
