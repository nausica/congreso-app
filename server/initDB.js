var config = require('./config');
var initDB = require('./lib/initDB');
var loadDB = require('./lib/loadDB');
console.log('*** Configuration: \n', config);

initDB.initialize(config);

initDB.checkMembersCollection(function() {
	console.log('done with Members');
	//loadDB.downloadLatestVotations( function(err) {
		loadDB.initialize(config);
		loadDB.importLatestVotations();
	//});

});

