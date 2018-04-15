var express = require('express');
var router = express.Router();
var {courses} = require('./models/coursesStudents.js');
var {attendancerecord} = require('./models/attendance.js');

router.use("/public", express.static('public'));

router.get('/', function(req, res, next) {
	var messages = req.flash('error')[0];
	res.render('adminLogin.hbs', {
		successMsg: messages,
		noMessages: !messages
	});
});

router.post('/',(req,res)=>{
	var userName = req.body.user;
	var password = req.body.passwd;
	if(userName=='admin' && password == 'admin')
		return res.redirect('/admin/dashboard');
	else{
		req.flash('error', 'Invalid username password');
		return res.redirect('/admin/');
	}
});

router.get('/dashboard', function(req, res, next) {
	attendancerecord.findOne().then((doc)=>{
		console.log(doc);
		res.render('DashBoard1.hbs',{coursesList : doc.courseNames});
	},(err)=>{
		console.log(err);
	})
});

router.post('/dashboard', function(req, res, next) {
	var courseId = req.body.course;
	var date = req.body.dateOfAttendance;
	console.log(courseId);
	console.log(date);
	attendancerecord.findOne({courseId:courseId,markedOn:date}).then((doc)=>{
		console.log(doc);
	},(err)=>{
		console.log(err);
	})
	var tempList = [{name:"Dhawnit",rollNo : "20162076", status:"Present"},{name:"Kanishtha",rollNo : "20162080", status:"Absent"}];
	res.render('DashBoard2.hbs',{courseName : courseName,dateOfAttendance : date, tempList : tempList});
});


module.exports = router;
