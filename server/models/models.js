var mongoose = require('mongoose');

// Subdocument schema for congress members
var memberSchema = new mongoose.Schema({ 
	name: 'String',
	url: 'String',
	email: 'String',
	location: 'String',
	key: 'Number',
	group: 'String'
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
    votes_blank: 'Number',
    votes_list: [voteSchema]
});

// Subdocument schema for vote
var voteSchema = new mongoose.Schema({ 
	seat: 'Number',
	name: 'String', // Member name
	group: 'String',
	vote: 'String'
});

module.exports.Member = mongoose.model('Member', memberSchema);
module.exports.Voting = mongoose.model('Voting', votingSchema);
module.exports.Vote = mongoose.model('Vote', voteSchema);
