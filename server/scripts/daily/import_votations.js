var fs 		= require('fs');
var xml2js  = require('xml2js');

var parser  = new xml2js.Parser();

var getDirs = function(rootDir, callback) {
	fs.readdir(rootDir, function(err, files) {
		var dirs = [];

		files.forEach(function(file, index){
			if (file[0] != '.') {
				var filePath = rootDir+'/'+file;
				fs.stat(filePath, function(err, stat){
					if (stat.isDirectory()) {
						dirs.push(file);
					}
					if (files.length == (index + 1)) {
						callback(err, dirs)
					}
				})
			}
		})
	})
}

var importDir = function(rootDir, callback) {
	fs.readdir(rootDir, function(err, files) {

		files.forEach(function(file, index){
			console.log(rootDir+'/'+file)
			fs.readFile(rootDir+'/'+file, function(err, data) {
				parser.parseString(data, function (err, result) {
			        console.dir(JSON.stringify(result));
			        console.log('Done');
			    });
			})	
		})
	})

}

var arr = getDirs('./files', function(err, dirs){
	console.log(dirs)
	console.log(dirs[0])
	importDir('./files/'+dirs[0])
})