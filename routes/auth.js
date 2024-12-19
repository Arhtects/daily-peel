var express = require('express');
var router = express.Router();

const functions = require('./functions');

router.get('/ajax/*', function(req, res) {
	let getUrl = req.originalUrl
	let getParams = req.query.attr;
	getUrl = getUrl.split('/')[3].split('?')[0];
	if(getUrl == "checkBanAddressExists") {
		typeof functions.callBanExistsFunction(getParams, function(result) {
			res.send(result);
		});
	}
	if(getUrl == "checkUsernameExists") {
		typeof functions.callUserExistsFunction(getParams, function(result) {
			res.send(result);
		});
	}
});

router.get('/auth', function(req, res) {
    res.send("0");
});

module.exports = router;