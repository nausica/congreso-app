/*
* Process that updates Members collection.
* It is supposed to be run just once at the beginning
* TODO : Add email, social media, picture url
*/

var phantom = require('phantom');
var async = require("async");
var _ = require('underscore');
var mongoose = require('mongoose');


var models = require('../models/models.js');
var Member = models.Member;

mongoose.connect('mongodb://localhost:27017/congress'); 

/*
* Remove all line breaks and tabs
*/
var clean = function(str) {
	return str.replace(/\n|\r|\t/g, '');
};

phantom.create(function(ph) {

	var scrape = function(url, callback) {
		console.log(url)

		var parse_page = function(page, ph) {
			page.evaluate(
				function() {
		                        
				    var nameArr = [],
				    	dipArr = [];
				                        
				    $('.nombre_dip').each(function() {
				        nameArr.push($(this).text());
				    });
				    $('.dip_rojo').each(function() {
				    	dipArr.push($(this).text());
				    });
		 
		    	return {
		        	name: nameArr[0],
		            location: dipArr[0],
		            group: dipArr[1]
		        };
		                        
		        }, function(result) {
		        	var member = new Member(result);
		
					member.save(function(err) {
						if(err) {
							callback(err);
						} else {
							callback(null, result);
						}
					});

		            
		        });
		}

		//phantom.create(function(ph) {
			ph.createPage(function(page) {
		    	page.open(url, function(status) {
		      	console.log("opened site? ", status);  

		            page.includeJs('http://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js', function(err) {
		                //jQuery Loaded.
		                //Wait for a bit for AJAX content to load on the page. Here, we are waiting 5 seconds.
		                setTimeout(function() {
		                	parse_page(page, ph);
		                    
		                }, 5000);
		 
		            });       
		        });
		    });
		//});
	}


	var MAX_ID = 386;
	var url_pattern = 'http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/fichaDiputado?idDiputado=<IDHERE>&idLegislatura=10'
	var url_array = [];

	// TODO Smart way to detect changes
	for (var i=256; i<=MAX_ID; i++) {
		url_array.push( url_pattern.replace('<IDHERE>', i) );
		//url_array.push('http://www.congreso.es')
	}

	async.mapSeries(url_array, 

		scrape,

		function(err, results){
	    	// results is now an array of stats for each file
	    	console.log(results)
	    	ph.exit();
		});

});

