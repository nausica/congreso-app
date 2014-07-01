angular.module('members', ['resources.members', 'ui.bootstrap', 'votings'])

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
				}]
			}
		})

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

.controller('MemberDetailCtrl', ['$scope', '$location', '$routeParams', 'member', function ($scope, $location, $routeParams, member) {
	$scope.member = member;
	
	
}]);
