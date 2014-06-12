angular.module('members', [])

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/members', {
		templateUrl:'members/members-list.tpl.html',
		controller:'MembersViewCtrl',
		resolve:{
			projects:['Members', function (Members) {
				//TODO: fetch only for the current user
				return Members.all();
			}]
			//,authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
		}
	});
}])

.controller('MembersViewCtrl', ['$scope', '$location', 'members', function ($scope, $location, members) {
	$scope.members = members;

	$scope.viewMember = function (member) {
		$location.path('/members/'+member.$id());
	};

}]);
