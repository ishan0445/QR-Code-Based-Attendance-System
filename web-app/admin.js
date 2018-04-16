var express = require('express');
var router = express.Router();
var {courses, coursestudent} = require('./models/coursesStudents.js');
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
	courses.find().then((docs)=>{
		var Courses = [];
		docs.forEach((doc) => Courses.push(doc.courseId));
		res.render('DashBoard1.hbs',{coursesList : Courses});
	},(err)=>{
		console.log(err);
	})
});

router.post('/dashboard', function(req, res, next) {
	var courseId = req.body.course;
	var date = req.body.dateOfAttendance;

	attendancerecord.find({courseId: courseId,
							markedOn: {"$gte": new Date(date+' 00:00:00Z'), 
							"$lte": new Date(date+' 23:59:59Z')}
						}).then((Students)=>{
		var courseAttendance = [];
		var presentStudents = [];
		Students.forEach((student) => {
			courseAttendance.push({
				name: student.name,
				rollNo: student.rollNo,
				status: 'Present'
			});
			presentStudents.push(student.rollNo);
		});

		/*//get absent students
		coursestudent.find({courseId: courseId}).then((doc) => {
			var allStudents = doc.rollNos;
			var absent = coursestudent.diff(presentStudents);
			absent.forEach((student) => {
				courseAttendance.push({
					name: 'Khurana',
					rollNo: student.rollNo,
					status: 'Absent'
				});
			});
			res.render('DashBoard2.hbs',{courseName : courseId,
						dateOfAttendance : date, tempList : courseAttendance});
		});*/
		res.render('DashBoard2.hbs',{courseName : courseId,
						dateOfAttendance : date, tempList : courseAttendance});
	},(err)=>{
		console.log(err);
	});
});

router.get('/dashboard3', function(req, res, next) {
	res.render('DashBoard3.hbs');
});


router.post('/dashboard3', function(req, res, next) {
	var date = req.body.dateOfAttendance;
	var data = [];
	attendancerecord.find({
		markedOn: {"$gte": new Date(date+' 00:00:00Z'), 
							"$lte": new Date(date+' 23:59:59Z')}
						}).distinct('courseId', function(err, coursesOnDate){
		coursesOnDate.forEach((course)=>{
			coursestudent.find({courseId : course}).count(function(err, totalStudents){
				attendancerecord.find({courseId : course, 
					markedOn: {"$gte": new Date(date+' 00:00:00Z'), 
							"$lte": new Date(date+' 23:59:59Z')}
						}).count(function(err, presentStudents){
					console.log(totalStudents, presentStudents);
					data.push({courseId: course, percentage: presentStudents/totalStudents});
				});
			});
		});
		res.render('DashBoard4.hbs', data);
	});
});

router.get('/dashboard5', function(req, res, next) {
	res.render('DashBoard5.hbs');
});

module.exports = router;
