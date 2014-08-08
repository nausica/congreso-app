angular.module('resources.provinces', ['ngResource']);

angular.module('resources.provinces')
	.factory('ProvincesJsonService', function($resource) {
		return $resource('/static/provinces.json');
	});