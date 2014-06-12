exports.addRoutes = function (app, config) {
	
	// Retrieve congress members
	app.get('/members', function(req, res, next) {

		var membersList = [{
			"name": "Lanzuela Marina, Santiago",
			"url": "http://www.congreso.es/portal/page/portal/Congreso/Congreso/Diputados/BusqForm?_piref73_1333155_73_1333154_1333154.next_page=/wc/fichaDiputado?idDiputado=64&idLegislatura=10",
			"email": "abc@abc.com",
			"location": "Teruel",
			"key": "64",
			"group": "G.P. Popular( GP )"
		}]
		res.json(200, membersList);
		res.end();
	})
};