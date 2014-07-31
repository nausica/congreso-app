angular.module('resources.votes', ['mongolabResource']);

angular.module('resources.votes')
	.factory('Votes', ['mongolabResource', function ($mongolabResource) {

	var Votes = $mongolabResource('votes');
	
	Votes.findByMemberId = function(memberId, successcb, errorcb) {
		return Votes.query({"member_id": { "$oid": memberId}}, successcb, errorcb);
	};
	Votes.findByVotingId = function(votingId, successcb, errorcb) {
		return Votes.query({"voting_id": { "$oid": votingId}}, successcb, errorcb);
	};
	Votes.findByMemberIdAndVotings = function(memberId, votings_list, successcb, errorcb) {
		var votings_id_arr = votings_list.map(function(v) {return v._id});
		return Votes.query(
			{
				"member_id": { "$oid": memberId },
				"voting_id": { $in: votings_id_arr }
			}, successcb, errorcb);
	};
	return Votes;
}]);
