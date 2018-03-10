var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');

var token = mongoose.model('token',{
	tokenValue: 
	{
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	date: 
	{ 
		type: Date, 
		default: null 
	},
	used: 
	{
		type: Boolean,
		default: false
	}
});

module.exports = {token}
