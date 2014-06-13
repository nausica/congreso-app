angular.module('resources.members', ['mongolabResource']);

angular.module('resources.members')
	.factory('Members', ['mongolabResource', function ($mongolabResource) {

	var Members = $mongolabResource('members');

	Members.forProvince = function(province, successcb, errorcb) {
		console.log('Province = '+ province)
		return Members.query({'location': province}, successcb, errorcb);
  	};
	

	return Members;
}]);
