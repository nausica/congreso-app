angular.module('dashboard', [])

.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/dashboard', {
		templateUrl: 'dashboard/dashboard.tpl.html',
		controller: 'DashboardCtrl',
		resolve: {}
  });
}])

.controller('DashboardCtrl', ['$scope', '$location', function ($scope, $location) {

	$scope.manageBacklog = function (projectId) {
		$location.path('/projects/' + projectId + '/productbacklog');
  	};

	$scope.manageSprints = function (projectId) {
		$location.path('/projects/' + projectId + '/sprints');
	};
}]);