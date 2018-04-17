var express = require('express');
var router = express.Router();
var {courses, coursestudent} = require('./models/coursesstudents.js');
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
							markedOn: {"$gte": new Date(date+' 00:00:00').toISOString(), 
							"$lte": new Date(date+' 23:59:59').toISOString()}
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
		markedOn: {"$gte": new Date(date+' 00:00:00').toISOString(), 
							"$lte": new Date(date+' 23:59:59').toISOString()}
						}).distinct('courseId', function(err, coursesOnDate){

		var size = coursesOnDate.length;
		if(size == 0) return res.render('DashBoard4.hbs', {date: date});
		coursesOnDate.forEach((course, j)=>{
			coursestudent.findOne({courseId: course}).then((doc)=>{
				var totalStudents = doc.rollNos.length;
				attendancerecord.find({courseId : course, 
					markedOn: {"$gte": new Date(date+' 00:00:00').toISOString(), 
							"$lte": new Date(date+' 23:59:59').toISOString()}
						}).count(function(err, presentStudents){
					//console.log(presentStudents, totalStudents);
					data.push({courseId: course, percentage: (presentStudents/totalStudents)*100});

					if(j==size-1){
						//console.log(data, j, size);
						res.render('DashBoard4.hbs', {data: data, date: date});			
					}
				});
			});
		});
	});
});

router.get('/dashboard5', function(req, res, next) {
	res.render('DashBoard5.hbs');
});

module.exports = router;
