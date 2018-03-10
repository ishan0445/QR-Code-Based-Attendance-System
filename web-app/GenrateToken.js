var mongoose = require('mongoose');
var {token} = require('./models/token.js');

const {MongoClient,ObjectID} = require('mongodb');

var generateToken = (n) => {
	mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');
	console.log('Connected to Token Generator');
	for(var i=0;i<n;i++){
		var tokn = new ObjectID().toString(); //token value
		console.log("Generated Token :",tokn);
		var tokenvalue = new token({
		  tokenValue: tokn
		});
		tokenvalue.save().then((doc) => {
		  console.log(JSON.stringify(doc, undefined, 2));
		}, (e) => {
		  console.log('Unable to save', e);
		});	
	}
	
}

module.exports = {
	generateToken
}