angular.module('members', ['resources.members'])

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider
		.when('/members/:province', {
			templateUrl:'members/members-list.tpl.html',
			controller:'MembersViewCtrl',
			resolve:{
				members:['Members', '$route', function (Members, $route) { /* $routeParams.province isn't set when the callback is executed, using $route */
					return Members.forProvince($route.current.params.province);
				}]
				//,authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
			}
		})
		.when('/members', {
			templateUrl:'members/members-list.tpl.html',
			controller:'MembersViewCtrl',
			resolve:{
				members:['Members', function (Members) {
					return Members.all();
				}]
				//,authenticatedUser: securityAuthorizationProvider.requireAuthenticatedUser
			}
		})
}])

.controller('MembersViewCtrl', ['$scope', '$location', '$routeParams', 'members', function ($scope, $location, $routeParams, members) {
	$scope.members = members;
	$scope.province = $routeParams.province;

	$scope.viewMember = function (member) {
		$location.path('/members/'+member.$id());
	};

}]);
