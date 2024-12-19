var express = require('express');
var router = express.Router();

const title = require('./titles');
const functions = require('./functions');

/* GET users listing. */
router.get('/notifications', function(req, res, next) {
	if (req.session.loggedin) {
		let getUser;
		typeof functions.getSessionDetails(req, function(result) {
			getUser = result;
		});
  		res.render('users/notifications', { title: title.dashboardHome, getDate: functions.getDate, username: getUser});
	} else {
		res.redirect('/login');
	}
});

router.get('/profile', function(req, res, next) {
	if (req.session.loggedin) {
		let getUser;
		typeof functions.getSessionDetails(req, function(result) {
			getUser = result;
		});
  		res.render('users/profile', { title: title.dashboardHome, getDate: functions.getDate, username: getUser});
	} else {
		res.redirect('/login');
	}
});

module.exports = router;
