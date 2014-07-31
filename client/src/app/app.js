/* global angular */

(function () {

	'use strict';

	angular.module('app', [
		'ui.router',
		'members',
		'votings',
		'templates.app',
		'templates.common']);

	angular.module('app').constant('MONGOLAB_CONFIG', {
		baseUrl: '/databases/',
		dbName: 'congreso'
	});


	angular.module('app')
		.config(['$locationProvider', '$stateProvider', '$urlRouterProvider', function ($locationProvider, $stateProvider, $urlRouterProvider) {
			$locationProvider.html5Mode(true);
			// For any unmatched url, send to /members
    		$urlRouterProvider.otherwise("/members");
    		$stateProvider
				.state('about', {
					url: '/about',
					templateUrl:'about.tpl.html'
				})
				.state('movement', {
					url: '/movement',
					templateUrl:'movement.tpl.html'
				})
	}])

	angular.module('app')
		.controller('AppCtrl', ['$scope', function($scope) {
		
		}])

		.controller('HeaderCtrl', ['$scope', '$location',
			function ($scope, $location) {	
				
				$scope.home = function () {
					$location.path('/members');
				};
		
			}
		]);

}());
