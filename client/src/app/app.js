angular.module('app', [
	'ngRoute',
	//'projectsinfo',
	//'dashboard',
	//'projects',
	//'admin',
	//'services.breadcrumbs',
	//'services.i18nNotifications',
	//'services.httpRequestTracker',
	'members',
	//'security',
	//'directives.crud',
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

/*

angular.module('app').run(['security', function(security) {
	// Get the current user when the application starts
	// (in case they are still logged in from a previous session)
	security.requestCurrentUser();
}]);
*/

angular.module('app').controller('AppCtrl', ['$scope', function($scope, i18nNotifications) {
	/*
	$scope.notifications = i18nNotifications;

	$scope.removeNotification = function (notification) {
		i18nNotifications.remove(notification);
	};

	$scope.$on('$routeChangeError', function(event, current, previous, rejection){
		i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
	});
*/
}]);

angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route' /*'security', 'breadcrumbs', 'notifications','httpRequestTracker'*/ ,
	//function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker) {
	function ($scope, $location, $route) {
	$scope.location = $location;
	//$scope.breadcrumbs = breadcrumbs;

	//$scope.isAuthenticated = security.isAuthenticated;
	//$scope.isAdmin = security.isAdmin;

	$scope.home = function () {
		$location.path('/members');
		/*
		if (security.isAuthenticated()) {
			$location.path('/dashboard');
		} else {
			$location.path('/members');
		}
		*/
	};
	/*
	$scope.isNavbarActive = function (navBarPath) {
		return navBarPath === breadcrumbs.getFirst().name;
	};

	$scope.hasPendingRequests = function () {
		return httpRequestTracker.hasPendingRequests();
	};
	*/
}]);
