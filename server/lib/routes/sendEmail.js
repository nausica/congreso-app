var nodemailer = require("nodemailer");

exports.addRoutes = function(app, config) {

	app.post('/send', function(req, res, next) {
		console.log('send');
		sendByEmail(req.param('sender'), req.param('recipient'), req.param('subject'), req.param('message'), 
			function(err, data) {
				if(!err) {
					res.json(200, {});
					res.end();
				} else {
					res.json(500, err);
					res.end();
				}
			})
			
	});

	function sendByEmail(sender, recipient, subject, message, callback) {

	    // create reusable transport method (opens pool of SMTP connections)
	    var smtpTransport = nodemailer.createTransport("SMTP", {
	        host: "localhost",
	        secureConnection: false,
	        port: 25
	    });

	    var htmlMessage = 'gggg';
	    var textMessage = htmlMessage.replace(/<br \/>/g, ' ');
		var mailOptions = {
	            from: 'noreply@contact.journeylabs.com',
	            to: recipient ? recipient : 'sonia.fabre@gmail.com',
	            subject: subject,
	            text: message,
	            html: '<p>'+message+'<p>' +
	            		(sender ? '<p>by '+ sender + '</p>' : '' )
	        };
	    smtpTransport.sendMail(mailOptions, function(error, response) {
	        if (error) {
	            callback(error);
	        } else {
	           	console.log('email sent');
	            callback(null);
	        }

			// if you don't want to use this transport object anymore, uncomment following line
			smtpTransport.close(); // shut down the connection pool, no more messages
	    });
	}
};