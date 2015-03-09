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
var fs 		= require('fs');
var exec    = require('child_process').exec;
var async 	= require('async');

var mongoose = require('mongoose');
var models = require('../../models/models.js');
var Member = models.Voting;

var MIN_SESSION = 4; // min session number, below this you get an error
var LEGISLATURE = 10; // fixed, current


var SESSIONS = [
	/*4,5,6,7,8,9,10,
	11,12,13,15,16,17,18,19,20,
	21,22,23,24,25,26,27,28,29,30,
	31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 
	51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 
	71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 
	91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 
	111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 
	131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 
	151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 
	171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190,
	191, 192
	*/
	231, 233, 234, 236
]

var downloadVotation = function(number, callback) {

	var filename = 'session'+number;
	var url = 'http://www.congreso.es/votaciones/OpenData?sesion='+number+'&completa=1&legislatura='+LEGISLATURE;
	var writeStream = fs.createWriteStream('./files/'+filename+'.zip');

	request(url)
		.pipe(writeStream)

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

async.map(SESSIONS, downloadVotation, function(err, result){
	console.log(result);
})
