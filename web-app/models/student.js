var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');

var studentcourses = mongoose.model('studentcourses',{
	rollNo: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	courses: [{
		type: String,
		required: true,
		minlength:1,
		trim: true
	}]
});

var studentregistration = mongoose.model('studentregistration',{
	name: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	}, 
	rollNo: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	},
	imei: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	}, 
	phnNumber:{
		type: String,
		required: true,
		minlength:1,
		trim: true
	}
});

var attendanceregistration = mongoose.model('attendanceregistration',{
	rollNo: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	},
	secretRegistrationKey: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	}
});

module.exports = {studentcourses, studentregistration, attendanceregistration}
// var otherTodo = new courseqrs({
//   facultyId: 'F123',
//   courseId: '123',
//   courseName: 'ds',
//   QRCode:'hello'
// });

// otherTodo.save().then((doc) => {
//   console.log(JSON.stringify(doc.renderedOn.getTime(), undefined, 2));
// }, (e) => {
//   console.log('Unable to save', e);
// });