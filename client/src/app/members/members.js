angular.module('members', ['resources.members', 'resources.votings', 'resources.votes', 'ui.bootstrap', 'ngRoute'])

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
		});

}])

.controller('MembersViewCtrl', ['$scope', '$location', '$routeParams', 'members', function ($scope, $location, $routeParams, members) {
	$scope.members = members;
	$scope.province = 'Madrid';

	$scope.changeProvince = function () {
		$location.path('/members/search/'+$scope.province);
	};

	$scope.viewMember = function (member) {
		$location.path('/members/'+member.$id());
	};

}])

.controller('MemberDetailCtrl', ['$scope', '$location', '$routeParams', 'member', 'votings', 'votes', function ($scope, $location, $routeParams, member, votings, votes) {
	var votes_map = {};	

	$scope.member = member;
	//$scope.votings = votings;
	//$scope.votes = votes;
	$scope.votings = [];

	// Map votes results
	angular.forEach(votes, function (vote) {
		if (!votes_map[vote.voting_id]) {
			votes_map[vote.voting_id] = vote.vote;
		}
	});

	angular.forEach(votings, function (voting) {
		var v = {};
		v.vote = votes_map[voting._id];
		v.title = voting.title;
		v.text = voting.text;
		v.session = voting.session;
		v.order = voting.order;
		v.result = voting.result;
		v.votes_for = voting.votes_for;
		v.votes_against = voting.votes_against;
		v.formattedDate = moment(voting.date).format('MMMM Do YYYY');
		$scope.votings.push(v);
	});
	
	
}]);
