var express = require('express');
var router = express.Router();

const connection = require('./db');
const title = require('./titles');
const functions = require('./functions');

/* GET users listing. */
router.get('/', function(req, res, next) {
	if (req.session.loggedin) {
		let getUser;
		typeof functions.getSessionDetails(req, function(result) {
			getUser = result;
			console.log(result);
		});
  		res.render('dashboard/home', { title: title.dashboardHome, getDate: functions.getDate, username: getUser});
	} else {
		res.redirect('/login');
	}
});

module.exports = router;
