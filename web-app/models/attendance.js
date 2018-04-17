var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');

var courseqrs = mongoose.model('courseqrs',{
	facultyId: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	},
	courseId: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	},
	// courseName: {
	// 	type: String,
	// 	required: false,
	// 	minlength: 1,
	// 	trim: true,
	// 	default: null
	// }, 
	QRCode: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	}, 
	renderedOn: {
		type: Date, 
		default: Date.now
	}
});

var attendancerecord = mongoose.model('attendancerecord',{
	courseId: {
		type: String,
		required: true,
		minlength:1,
		trim: true
	},
	rollNo: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	name: {
		type: String,
		required: false,
		minlength: 1,
		trim: true
	},
	markedOn: {
		type: Date,
		required: true,
		default: Date.now
	}
});

module.exports = {courseqrs, attendancerecord}
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