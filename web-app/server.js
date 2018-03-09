const express = require('express');
const hbs = require('hbs');
var qr = require('./QRCodeGenerator');
var {courseqrs} = require('./models/attendance.js');
var {studentcourses} = require('./models/student.js');
const {ObjectID} = require('mongodb');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const port = process.env.PORT || '3000';

hbs.registerPartials(__dirname+'/views/partials');
app.set('view engine','hbs');

// app.use((req, res, next) => {
// 	var now = new Date().toString();
// 	var log = `${now}: ${req.method} ${req.url}`;
// 	console.log(log);
// 	fs.appendFile('server.log',log+'\n', (err) =>{
// 		if(err)
// 			console.log('Error writing to the logs.');
// 	});
// 	next();
// });

// Un-comment to start maintenance mode
// app.use((req, res, next) => {
// 	res.render('maintenance.hbs');
// });

// app.use(express.static(__dirname+'/public'));

app.get('/',(req,res) => {
	res.render('faculty.hbs');
});

app.get('/takeAttendance/:faculty/:subj',(req,res) => {
	// var svg_string = qr.imageSync('I love QR!', { type: 'svg',size: 30});

	res.render('takeAttendance.hbs',{
		faculty : req.params.faculty,
		subj : req.params.subj
	});
});

app.get('/getNextQR/:faculty/:subj',(req,res) => {
	var QRCode = qr.QRCodeGenerator(1);
	var row = new courseqrs({
		_id: new ObjectID(QRCode[0].QRCode),
		facultyId: req.params.faculty,
		courseId: req.params.subj,
		QRCode: QRCode[0].QRCode
	});


	console.log(req.params.faculty)

	row.save().then((doc) => {
	  console.log('Successfully saved QRCode');
	}, (e) => {
	  console.log('Unable to save QRCode', e);
	});

	res.send({
		faculty : req.params.faculty,
		subj : req.params.subj,
		svg_string : QRCode[0].QRimage
	});

});

app.post('/submitQRResponse',(req,res)=>{
	var rollNo = req.body.rollNo;
	var QRCode = req.body.QRCode;
	var courseId;
	var courseArray;


	courseqrs.findOne({QRCode: QRCode}).then((docs) => {
		console.log(docs);
		if(docs){
			console.log(docs);
    		courseId = docs.courseId;

			studentcourses.findOne({rollNo: rollNo}).then((docs) => {
		    	courseArray = docs.courses;
		    	console.log(courseArray)

				// Mark attendance
			  	res.send({status : 'okay'});
		  	},(err) => {
		  	   console.log('Either RollNo doesn\'t exist or student not registered in the course', err);
		  	   res.send({status : 'RollNo doesn\'t exist or student not registered in the course!!'});
		  	});
		}
		else{
			console.log('QRCode not matched to any course', err);
  	   		res.send({status : 'Invalid QRCode!!'});
    	}
  	},(err) => {
  	   console.log(err);
  	   res.send({status : err});
  	});



});

// app.get('/about', (req,res) => {
// 	// res.send({
// 	// 	name: 'Ishan',
// 	// 	contact: '+91-9703002733'
// 	// });

// 	res.render('about.hbs',{
// 		pageName: 'About Page',
// 	});
// });

// app.get('/bad', (req,res) => {
// 	res.send({
// 		errorMsg: 'Some Error'
// 	});
// });

app.listen(port,() => {
	console.log(`Server is up and running on port ${port}`);
});
