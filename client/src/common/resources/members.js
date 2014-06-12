angular.module('resources.members', ['mongolabResource']);

angular.module('resources.members')
	.factory('Members', ['mongolabResource', function ($mongolabResource) {

	var Members = $mongolabResource('members');

	Members.forUser = function(userId, successcb, errorcb) {
		//TODO: get projects for this user only (!)
		return Members.query({}, successcb, errorcb);
  	};
	/*
	Projects.prototype.isProductOwner = function (userId) {
		return this.productOwner === userId;
  	};
	*/

	return Members;
}]);
