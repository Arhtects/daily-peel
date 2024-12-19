const connection = require('./db');

const regex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/;
const regexNum = /\d/;

module.exports = {
    getSessionDetails: function(req, callback) {
        let getUser = [];
		getUser[0] = req.session.username;
		getUser[1] = req.session.hasprofileimage;
		getUser[2] = req.session.profileimageurl;
		getUser[3] = req.session.gradientdefault;

        return callback(getUser);
    },
    getGradient: function(callback) {
        var deg = Math.floor(Math.random() *360);
        var gradient = "linear-gradient(" + deg + "deg, " + "#" + createHex() + ", " + "#" + createHex() +")";
        
        return callback(gradient);
    },
    getDate: function() {
        return new Date().getFullYear();
    }, 
    callBanExistsFunction: function(address, callback) {  
        connection.query(`SELECT * FROM accounts WHERE address = '${address}'`,  function(error, results, fields) {
            if (error) throw error;	
            if (results.length > 0) {
                return callback("true");
            } else {
                return callback("false");
            }
        });
    },
    callUserExistsFunction: function (name, callback) {      
        connection.query(`SELECT * FROM accounts WHERE username = '${name}'`,  function(error, results, fields) {
            if (error) throw error;	
            if (results.length > 0) {
                return callback("true");
            } else {
                return callback("false");
            }
        });
    },
    validatepass: function(getRepeatedPin, getPin, callback) {
        if(getRepeatedPin == getPin) {
            if(getPin.length > 10) {
                if(regex.test(getPin)) { 
                    if(regexNum.test(getPin)) {
                        return callback("true");
                    } else {
                        return callback("false");
                    }
                } else {
                    return callback("false");
                }
            } else {
                return callback("false");
            }
        } else {
            return callback("false");
        }
    },
    validateChecksum: function(address) {
        if (address.length === 64 && address.startsWith('ban_')) {
            const accountMap = "13456789abcdefghijkmnopqrstuwxyz";
            const accountLookup = {};

            for (let i = 0; i < 32; i++) {
                accountLookup[accountMap[i]] = this.uintToBitArray(i, 5);
            }

            const acropKey = address.substring(4, address.length - 8);
            const acropCheck = address.substring(address.length - 8);

            let numberL = [];
            for (let x = 0; x < acropKey.length; x++) {
                numberL = numberL.concat(accountLookup[acropKey[x]]);
            }
            numberL = numberL.slice(4); // reduce from 260 to 256 bit

            let checkL = [];
            for (let x = 0; x < acropCheck.length; x++) {
                if (!(acropCheck[x] in accountLookup)) {
                    return false;
                }
                checkL = checkL.concat(accountLookup[acropCheck[x]]);
            }
            checkL = this.byteswap(checkL); // reverse byte order to match hashing format
            
            const h = this.blake2b(numberL);
            return h === this.hex(checkL);
        } else {
            return false;
        }
    }
};

function createHex() {
    var hexCode1 = "";
    var hexValues1 = "0123456789abcdef";
    for ( var i = 0; i < 6; i++ ) {
      hexCode1 += hexValues1.charAt(Math.floor(Math.random() * hexValues1.length));
    }
    return hexCode1;
}