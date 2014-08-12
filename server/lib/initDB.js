/* globals setTimeout, $ */
// code for initializing the DB w/ an admin user
// and load the data for the first time
var rest = require('request');
var mongoose = require('mongoose');
var uriUtil = require('mongodb-uri');
var phantom = require('phantom');
var async = require("async");
var _ = require('underscore');
var models = require('../models/models.js');
var Member = models.Member;

var initDB = {
	adminUser: { email: 'admin@abc.com', password: 'changeme', admin: true, firstName: 'Admin', lastName: 'User' },

	initialize: function(cfg) {
		initDB.apiKey = cfg.mongo.apiKey;
		initDB.baseUrl = cfg.mongo.dbUrl + '/databases/' + cfg.security.dbName + '/collections/';
		initDB.usersCollection = cfg.security.usersCollection;
		initDB.membersCollection = cfg.security.membersCollection;
		initDB.user = cfg.security.user;
		initDB.password = cfg.security.password;

	},
  
	checkDocument: function(collection, query, done) {
		var url = initDB.baseUrl + collection + '/';
		console.log("rest.get - " + url);
		var params = { apiKey: initDB.apiKey, q: JSON.stringify(query) };
		var request = rest.get(url, { qs: params, json: {} }, function(err, response, data) {
			if ( err ) {
				console.log('There was an error checking the documents', err);
			}
			done(err, data);
		});
	},
  
	createDocument: function(collection, doc, done) {
		var url = initDB.baseUrl + collection + '/';
		console.log("rest.post - " + url);
		var request = rest.post(url, { qs: { apiKey:initDB.apiKey }, json: doc }, function(err, response, data) {
			if ( !err ) {
				console.log('Document created', data);
			}
		done(err, data);
		});
	},
  
	deleteDocument: function(collection, docId, done) {
		var url = initDB.baseUrl + collection + '/' + docId;
		console.log("rest.del - " + url);
		var request = rest.del(url, { qs: { apiKey:initDB.apiKey }, json: {} }, function(err, response, data) {
			if ( !err ) {
				console.log('Document deleted', data);
			}
			done(err, data);
		});
	},
  
	addAdminUser: function(done) {
		console.log('*** Admin user properties:', initDB.adminUser);
		console.log('Checking that admin user does not exist...');
		initDB.checkDocument(initDB.usersCollection, initDB.adminUser, function(err, data) {
			if ( !err && data.length === 0 ) {
				console.log('Creating new admin user...', err, data);
				initDB.createDocument(initDB.usersCollection, initDB.adminUser, function(err, data) {
					console.log('Created new admin user...');
					console.log(err);
					console.log(data);
					done(err, data);
				});
			} else {
				if (data.message) {
					console.log('Error: ' + data.message);
				} else {
					console.log('User already created.');
				}
				done(err, data);
			}
		});
	},

	checkMembersCollection: function(done) {
		console.log('Checking that members collection is empty...');
		/*
		initDB.checkDocument(initDB.membersCollection, {}, function(err, data) {
			if ( !err && data.length === 0 ) {
				console.log('Uploading members data...');

				initDB.loadMembersData(done);

			} else {
				if (data.message) {
					console.log('Error: ' + data.message);
				} else {
					console.log('Database already uploaded.');
				}
				done(err, data);
			}
		});
*/
		initDB.loadMembersData(done);

	},

	loadMembersData: function(done) {
		/* 
		 * Mongoose by default sets the auto_reconnect option to true.
		 * We recommend setting socket options at both the server and replica set level.
		 * We recommend a 30 second connection timeout because it allows for 
		 * plenty of time in most operating environments.
		 */
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
 
		/*
		 * Mongoose uses a different connection string format than MongoDB's standard.
		 * Use the mongodb-uri library to help you convert from the standard format to
		 * Mongoose's format.
		 */
		var mongodbUri = 'mongodb://'+initDB.user+':'+initDB.password+'@ds035897.mongolab.com:35897/congreso';
		var mongooseUri = uriUtil.formatMongoose(mongodbUri);

		mongoose.connect(mongooseUri, options);
		var conn = mongoose.connection;             
		 
		conn.on('error', console.error.bind(console, 'connection error:'));  
		 
		conn.once('open', function() {
		// Wait for the database connection to establish.            

		// 0.load.js   
			/*
			* Remove all line breaks and tabs
			*/
			var clean = function(str) {
				return str.replace(/\n|\r|\t/g, '');
			};


			phantom.create(function(ph) {
				
				var scrape = function(url, callback) {
					console.log(url);

					var parse_page = function(page, ph) {
						page.evaluate(
							function() {
												
								var nameArr = [],
									dipArr = [],
									picture_url,
									committee_list = [],
									personal_list = [],
									social_profile = {},
									inactive = false;
														
								$('.nombre_dip').each(function() {
									nameArr.push($(this).text());
								});
								$('.dip_rojo').each(function(i) {
									if (i === 0) {

										// First: Location
										// Diputado/a?
										var str = $(this).text();
										var arr = str.split('Diputado por');
										var cleanStr;

										if (!arr[1]) {
											arr = str.split('Diputada por');
										}

										if (arr[1]) {
											cleanStr = arr[1].replace(/\n|\r|\t|\./g, '').trim();
										} 
										dipArr.push(cleanStr);
									} else {
										dipArr.push($(this).text());
									}
								});

								// Picture
								picture_url = 'http://www.congreso.es' + $("img[name='foto']").attr('src');

								// Personal stuff
								$('.texto_dip li:not(".regact_dip")').each(function(){
									var text = $(this).text().replace(/\n|\r|\t/g, '').trim();
									personal_list.push(text);
									// inactive?
									if (text.indexOf("Causó baja") !== -1) {
										inactive = true;
									}
								});
								
								// Social stuff
								$('.webperso_dip a').each(function() {
									var link = $(this);
									var link_href = link.attr('href');

									var regexp_mail = /mailto/;
									var regexp_twitter = /twitter/;
									var regexp_facebook = /facebook/;
									

									if (link_href) {
										if (regexp_mail.test(link_href)) {
											social_profile.email = link.text()
																	.replace(/\n|\r|\t/g, '').trim();
										} else if (regexp_twitter.test(link_href)) {
											social_profile.twitter = link_href;
										} else if (regexp_facebook.test(link_href)) {
											social_profile.facebook = link_href;
										}
									}
								});

								// Committees
								$('.listado_1').each(function(i){
									// 0 Current
									var self = $(this);
									if (i === 0) {
										self.find('li').each(function() {
											var committee = {
												role: $(this).text()
													.replace(/\n|\r|\t|\./g, '').trim()
											};
											
											$(this).find('a').each(function(){
												committee.name = $(this).text();
												committee.url = $(this).attr('href');
											});

											committee_list.push(committee);
										});
									}
									
									// 1 Previous
								});

						 
							return {
								name: nameArr[0],
								location: dipArr[0],
								group: dipArr[1],
								picture_url : picture_url,
								committee_list: committee_list,
								personal_list: personal_list,
								social_profile: social_profile,
								inactive: inactive,
								url: document.URL
								
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
					};

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
					};


					var MAX_ID = 397;
					var url_pattern = 'http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/fichaDiputado?idDiputado=<IDHERE>&idLegislatura=10';
					var url_array = [];

					// TODO Smart way to detect changes
					for (var i=1; i<=MAX_ID; i++) {
						url_array.push( url_pattern.replace('<IDHERE>', i) );
						//url_array.push('http://www.congreso.es')
					}

					async.mapSeries(url_array, 
						scrape,
						function(err, results){
							// results is now an array of stats for each file
							ph.exit();
						});
			});
		});
	}
};

module.exports = initDB;

