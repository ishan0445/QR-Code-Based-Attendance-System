var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');


var courses = mongoose.model('courses',{
	courseId: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	}
});

var coursestudent = mongoose.model('coursestudent',{
	courseId: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	rollNos: [{
		type: String,
		required: true,
		minlength:1,
		trim: true
	}]
});


module.exports = {courses,coursestudent}