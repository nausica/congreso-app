/*
* Process that gets last session number (if any) in the database and tries to retrieve data for next sessions (consecutively) till it gets an error.
* The idea is getting existing votations at the beginning and make sure we didn't miss any if the process fails once up and running.
* 
* 1. Download session zip, save in files folder, different folder per session
* 2. Unzip the file
* 3. Loop over the files in the folder. Each one corresponds to a votation.
* 4. Parse xml and insert votation and votes.
*/

var request = require('request');
var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async'); 
var xml2js = require('xml2js');
var moment = require('moment');
var utf8 = require('utf8');
var Iconv = require('iconv').Iconv;
var iconv_lite = require('iconv-lite');

var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var models = require('../models/models.js');
var Member = models.Member;
var Voting = models.Voting;
var Vote = models.Vote;
var MIN_SESSION = 4; // min session number, below this you get an error
var LEGISLATURE = 10; // fixed, current


var MAX_SESSION = 259;

var parser = new xml2js.Parser();
var members_map = {};
// After this call all Node basic primitives will understand iconv-lite encodings.
iconv_lite.extendNodeEncodings();

var downloadVotation = function(number, callback) {
	var child;
	var filename = 'session'+number;	
	var url = 'http://www.congreso.es/votaciones/OpenData?sesion='+number+'&completa=1&legislatura='+LEGISLATURE;
	var writeStream;

	var r = request
				.get(url)
				.on('error', function(err) {
    				console.log(err)
  				})
  				.on('response',
		        	function (response) {
		        		// Only if a file is coming
		        		if (response.headers['content-type'] === 'application/zip') {
		        			writeStream = fs.createWriteStream('./files/'+filename+'.zip');

		        			writeStream.on('close', function() {
								child = exec('cd files; unzip '+filename+'.zip -d'+filename, function(error, stdout, stderr) {
									if (error !== null) {
										console.log('error');
										callback(error);
									} else {
										console.log('ok');
										callback(null, filename);
									}
								});
							});

		        			r.pipe(writeStream);
		        		}
		        	}
      			)
};

var getDirs = function(rootDir, callback) {
	fs.readdir(rootDir, function(err, files) {
		var dirs = [];

		files.forEach(function(file, index){
			if (file[0] !=='.') {
				var filePath = rootDir+'/'+file;
				fs.stat(filePath, function(err, stat){
					if (stat.isDirectory()) {
						dirs.push(file);
					}
					if (files.length === (index + 1)) {
						callback(err, dirs);
					}
				});
			}
		});
	});
};

var importFile = function(file, callback) {

	fs.readFile(file, 'ISO-8859-1', function(err, data) {
		console.log(file);
		//iconv = new Iconv('ISO-8859-1', 'UTF8');
		//converted = iconv.convert(data);
		parser.parseString(data, function (err, result) {
					
			var info = result['Resultado']['Informacion'][0];
			var totals = result['Resultado']['Totales'][0];
			var votes = result['Resultado']['Votaciones'][0]['Votacion'];
			var voting = new Voting();

			voting.session = info['Sesion'] ? info['Sesion'][0] : undefined;
			voting.order = info['NumeroVotacion'][0];
			voting.date = moment(info['Fecha'][0], "DD/MM/YYYY").toDate();
			voting.title = info['Titulo'][0];
			voting.text = info['TextoExpediente'][0];

			voting.result = totals['Asentimiento'] ? totals['Asentimiento'] : undefined;
			voting.votes_for = totals['AFavor'] ? totals['AFavor'][0] : undefined;
			voting.votes_against =  totals['EnContra'] ? totals['EnContra'][0] : undefined;
			voting.votes_abstaining = totals['Abstenciones'] ? totals['Abstenciones'][0] : undefined;
			voting.votes_blank = totals['NoVotan'] ? totals['NoVotan'][0] : undefined;

			// Save voting
			voting.save(function(err, voting_result) {

				if(err) {
					if (callback) {
						callback(err);
					}
				} else {
					//votes
					if (votes) {
						// Import vote function
						var importVote = function(v, callback) {
							var vote = new Vote();
							vote.seat = v['Asiento'][0];
							vote.name = v['Diputado'][0];
							vote.group = v['Grupo'] ? v['Grupo'][0] : undefined;
							vote.vote = v['Voto'][0];
							vote.voting_id = voting_result.id;
							vote.member_id = members_map[vote.name];
							vote.save(function(err) {
								callback(err);
							});
						};
						async.mapSeries(
							votes,
							importVote,
							function(err, results) {
								if (err) {
									console.log(err);
								}
								console.log('Votes imported')
								callback(err);
						});
					} else {
						callback(null);
					}
				}
			});
		});
	});
};

var importDir = function(rootDir, callback) {
	var iconv, converted;

	rootDir = './files/'+ rootDir;

	fs.readdir(rootDir, function(err, files) {
		// import files
		async.mapSeries(
			files.map(function(filename) {return rootDir+'/'+filename}),
			importFile,

			function(err, results) {
				console.log('Files imported')
				callback(err, null);
			});

	});

};
var loadDB = {

	initialize: function(cfg) {
		loadDB.apiKey = cfg.mongo.apiKey;
		loadDB.baseUrl = cfg.mongo.dbUrl + '/databases/' + cfg.security.dbName + '/collections/';
		loadDB.user = cfg.security.user;
		loadDB.password = cfg.security.password;

	},
	
	downloadLatestVotations : function( done ) {
		var votings = [];
		for (var i=1; i<=MAX_SESSION; i++) {
			votings.push( i );
		}
		async.map(votings, downloadVotation, function(err, result){
			console.log('done');
			done(err);
		});
	},

	importLatestVotations : function( done ) {
		var options = { 
			server: { 
				socketOptions: { 
					keepAlive: 1, 
					connectTimeoutMS: 30000 
				} 
			}, 
			replset: { 
				socketOptions: { 
					keepAlive: 1, 
					connectTimeoutMS : 30000 
				} 
			} 
		};    
		var mongodbUri = 'mongodb://'+loadDB.user+':'+loadDB.password+'@ds035897.mongolab.com:35897/congreso';
		var mongooseUri = uriUtil.formatMongoose(mongodbUri);

		mongoose.connect(mongooseUri, options);
		var conn = mongoose.connection;
		 
		conn.on('error', console.error.bind(console, 'connection error:'));  
		 
		conn.once('open', function() {
			// Wait for the database connection to establish.   
			Member.find({}, function(err, members) {
				members.forEach(function(m) {
					m.name = m.name ? m.name.replace(/\s/g,' ') : undefined;
					members_map[m.name] = m._id.toString();
				});
				
				var arr = getDirs('./files', function(err, dirs){
				async.mapSeries(dirs,
					importDir,
					function(err, results) {
						conn.close()
					});
				});

			})  
			
		});
	}
};


module.exports = loadDB;
