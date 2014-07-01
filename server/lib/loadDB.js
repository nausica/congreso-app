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
var Voting = models.Voting;
var Vote = models.Vote;
var MIN_SESSION = 4; // min session number, below this you get an error
var LEGISLATURE = 10; // fixed, current


var SESSIONS = [
	/*
	4,5,6,7,8,9,10,
	11,12,13,15,16,17,18,19,20,
	21,22,23,24,25,26,27,28,29,30,
	31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 
	51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 
	71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 
	91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 
	111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 
	131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 
	151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 
	171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 
	186, 187, 188, 189, 190,
	*/
	191, 192, 193, 195, 196
	
];

var parser = new xml2js.Parser();
// After this call all Node basic primitives will understand iconv-lite encodings.
iconv_lite.extendNodeEncodings();

var downloadVotation = function(number, callback) {
	var child;
	var filename = 'session'+number;	
	var url = 'http://www.congreso.es/votaciones/OpenData?sesion='+number+'&completa=1&legislatura='+LEGISLATURE;
	var writeStream = fs.createWriteStream('./files/'+filename+'.zip');

	request(url)
		.pipe(writeStream);

	writeStream.on('close', function () {
		console.log('All done!');
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

var importDir = function(rootDir, callback) {
	var iconv, converted;

	rootDir = './files/'+ rootDir;

	fs.readdir(rootDir, function(err, files) {

		files.forEach(function(file, index){
			
			fs.readFile(rootDir+'/'+file, 'ISO-8859-1', function(err, data) {
				console.log(rootDir+'/'+file);
				//iconv = new Iconv('ISO-8859-1', 'UTF8');
				//converted = iconv.convert(data);
				parser.parseString(data, function (err, result) {
					
					console.log(result);
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

					//votes
					if (votes) {
						votes.forEach(function(v) {
							var vote = new Vote();
							vote.seat = v['Asiento'][0];
							vote.name = v['Diputado'][0];
							vote.group = v['Grupo'][0];
							vote.vote = v['Voto'];
							voting.votes_list.push(vote);
						});
					}

					// Save voting
					voting.save(function(err) {
						if(err) {
							if (callback) {
								callback(err);
							}
						} else {
							if (callback) {
								callback(null, result);
							}
						}
					});
				});
			});	
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
		async.map(SESSIONS, downloadVotation, function(err, result){
			console.log('done');
			// TODO parse xml
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
			var arr = getDirs('./files', function(err, dirs){
				
				//importDir('./files/'+dirs[0])
				async.mapSeries(dirs,
				//async.mapSeries(['session16'],
					importDir,

					function(err, results) {

					});
			});
		});
	}
};


module.exports = loadDB;
