angular.module('resources.votes', ['mongolabResource']);

angular.module('resources.votes')
	.factory('Votes', ['mongolabResource', function ($mongolabResource) {

	var Votes = $mongolabResource('votes');
	
	Votes.findByMemberId = function(memberId, successcb, errorcb) {

		return Votes.query({"member_id": { "$oid": memberId}}, successcb, errorcb);
	};
	
	return Votes;
}]);
