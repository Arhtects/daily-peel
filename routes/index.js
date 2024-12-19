var express = require('express');
var router = express.Router();

const cryptoRandomString = require('crypto');
const bcrypt = require("bcryptjs");

const connection = require('./db');
const title = require('./titles');
const functions = require('./functions');

var async = require('async');

let getCryptographicstring = cryptoRandomString.randomBytes(64).toString('base64');
const regex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/;
const regexNum = /\d/;
const banRegex = /^ban_[13][13456789abcdefghijkmnopqrstuwxyz]{59}$/;

const submitToUrl = "https://www.daily-peel.com/api/validate_banano_message";
const setAuthmessage = `message-dailypeel-auth-${getCryptographicstring}`;

const signRequestLink = `https://thebananostand.com/signing?request=message_sign&address=ban_address_replacement_target&message=${encodeURIComponent(setAuthmessage)}&url=${encodeURIComponent(submitToUrl)}`;


/* GET home page. */
router.get('/', function(req, res, next) {
	let getUser;
	if (req.session.loggedin) {
		typeof functions.getSessionDetails(req, function(result) {
			getUser = result;
		});
	}
  	res.render('index', { title: title.homeTitle, date: functions.getDate, username: getUser});
});

router.get('/login', function(req, res, next) {
  	if (req.session.loggedin) {
		res.redirect('/dashboard');
  	} else {
    	res.render('auth/login', { title: title.loginTitle, date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
 	}
});

router.post('/login', function(req, res) {
	let getUser = req.body.user;
  	let getPin = req.body.pin;
	if (getUser && getPin) {
		connection.query(`SELECT password, hasprofileimage, profileimageurl, gradientdefault FROM accounts WHERE username = '${getUser}'`,  function(error, results, fields) {
			if (error) throw error;
			if (results.length > 0) {
				let gethash = results[0].password;
				bcrypt.compare(getPin, gethash)
				.then(hash => {
					if(hash == true) {
						var sessionTimeout = 86400;
						req.session.loggedin = true;
						req.session.loggedin.expires = new Date(Date.now() + sessionTimeout);
						req.session.username = getUser;
						req.session.hasprofileimage = results[0].hasprofileimage;
						req.session.profileimageurl = results[0].profileimageurl;
						req.session.gradientdefault = results[0].gradientdefault;
						res.redirect('/dashboard');
					} else {
						res.render('auth/login', {"title" : title.loginTitle, "errormsg" : "Incorrect Password", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
					}
				})
				.catch(err =>  {
					res.render('auth/login', {"title" : title.loginTitle, "errormsg" : err.message, date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
				}); 
			} else {
        		res.render('auth/login', {"title" : title.loginTitle, "errormsg" : "Username Doesn't exist", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
			}
		});
	} else {
		//legacy browser support
		res.render('auth/login', {"title" : title.loginTitle, "errormsg" : "Please enter Username and Password!", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
  	}
});

router.get('/sign-up', function(req, res, next) {
  if (req.session.loggedin) {
    res.redirect('/dashboard');
  } else {
    res.render('auth/sign-up', { title: title.registerTitle, date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
  }
});

router.post('/sign-up', function(req, res, next) {
	let getUser = req.body.user;
  	let getPin = req.body.pin;
	let getRepeatedPin = req.body.pinRepeat;
	let getBanaddress = req.body.banaddress;
	if (getUser && getPin) {
		typeof functions.validatepass(getRepeatedPin, getPin, function(result) {
			if(result == "true") {
				if(!regex.test(getUser)) {
					typeof functions.callUserExistsFunction(getUser, function(result) {
						if(result == "false") {
							if(banRegex.test(getBanaddress)) {
								typeof functions.callBanExistsFunction(getBanaddress, function(result) {	
									if(result == "false") {
										let gradientGen;
										typeof functions.getGradient(function(result) {
											gradientGen = result;
											console.log(gradientGen);
										});
										bcrypt.hash(getPin, 8)
										.then(hash => {
											connection.query(`INSERT INTO accounts (id, username, password, salt, address, isVarified, privalges, dateJoined, hasprofileimage, profileimageurl, gradientdefault) VALUES ('', '${getUser}', '${hash}', '', '${getBanaddress}', 'false', '0', '', 'false', '', '${gradientGen}')`, function(error, results, fields) {
												if (error) {
													res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "You cant create an account at this time.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
												} else {
													res.render('auth/sign-up', {"title" : title.registerTitle, "successmsg" : "User created successfully.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
												}
											});
										})
										.catch(err =>  {
											res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : err.message, date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
										});
									} else {
										res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "Ban address already linked to account.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
									}
								},);
							} else {
								res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "Not a valid banano address.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
							}
						} else {
							res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "Username already exists.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
						}
					},);
				} else {
					res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "Invalid Characters Found In Username.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
				}
			} else {
				res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "Password didnt meet required standards", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
			}
		});
	} else {
			res.render('auth/sign-up', {"title" : title.registerTitle, "errormsg" : "Password or Username missing.", date: functions.getDate , authString: setAuthmessage, authUrl: signRequestLink });
	}
});

router.get('/logout', function(req, res) {
	req.session.destroy();
  	res.redirect('/login');
});

module.exports = router;