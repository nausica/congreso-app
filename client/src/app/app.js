'use strict';

angular.module('app', [
	'ngRoute',
	'members',
	'votings',
	'templates.app',
	'templates.common']);

angular.module('app').constant('MONGOLAB_CONFIG', {
	baseUrl: '/databases/',
	dbName: 'congreso'
});


angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider.otherwise({redirectTo:'/members'});
}]);


angular.module('app')
	.controller('AppCtrl', ['$scope', function($scope) {
	
}]);

angular.module('app')
	.controller('HeaderCtrl', ['$scope', '$location', '$route',
		function ($scope, $location, $route) {
			$scope.location = $location;
			

			$scope.home = function () {
				$location.path('/members');
				
			};
	
		}
]);
