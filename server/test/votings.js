var fs = require('fs');
var xml2js = require('xml2js');
var iconv = require('iconv-lite');


var parser = new xml2js.Parser();
var rootDir = './files/';

module.exports = {
	testEncoding: function(test) {
		iconv.extendNodeEncodings();

		fs.readFile(rootDir+'session10/sesion10votacion1.xml', 'iso-8859-15', function(err, data) {
			parser.parseString(data, function (err, result) {
				console.log(result);
				test.equal(1,1);
				test.done();
			});
		});
	}
};
