var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId

var committeeSchema = new mongoose.Schema({
	name: 'String',
	role: 'String',
	url: 'String'
});


// Subdocument schema for congress members
var memberSchema = new mongoose.Schema({ 
	name: 'String',
	url: 'String',
	email: 'String',
	location: 'String',
	key: 'Number',
	group: 'String',
	picture_url: 'String',
	personal_list: ['String'],
	committee_list: [committeeSchema],
	social_profile: {
		email: 'String',
		twitter: 'String',
		facebook: 'String',
		blog: 'String'
	}
});

// Subdocument schema for votings, session + order would be the key
var votingSchema = new mongoose.Schema({ 
	session: 'Number',
	order: 'Number',
	date: {
        type: Date,
        default: Date.now
    },
    title: 'String',
    text: 'String',
    result: 'String', // No or Sí
    attendees: 'Number',
    votes_for: 'Number',
    votes_against: 'Number',
    votes_abstaining: 'Number',
    votes_blank: 'Number'
    //,votes_list: [voteSchema]
});

// Subdocument schema for vote
var voteSchema = new mongoose.Schema({ 
	seat: 'Number',
	name: 'String', // Member name
	group: 'String',
	vote: 'String',
	voting_id: ObjectId,
	member_id: ObjectId
});



module.exports.Member = mongoose.model('Member', memberSchema);
module.exports.Voting = mongoose.model('Voting', votingSchema);
module.exports.Vote = mongoose.model('Vote', voteSchema);
module.exports.Committee = mongoose.model('Committee', committeeSchema);
