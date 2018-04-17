const express = require('express');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
var qr = require('./QRCodeGenerator');
var regisManager = require('./registration');
var {courseqrs, attendancerecord} = require('./models/attendance.js');
var {studentcourses, studentregistration} = require('./models/student.js');
var {facultycourses} = require('./models/faculty.js');
const {ObjectID} = require('mongodb');
const fs = require('fs');
const fr = require('face-recognition');
const fd = require('./faceDetector');
const geolib = require('geolib');
const pathToExistingModel = './NNModel.json'
var flash = require('connect-flash'); 
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');
var adminRoutes = require('./admin');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');


const H105Coordinates = {latitude: 17.4454934, longitude: 78.3494515};
app.use(fileUpload({limits: { fileSize: 50 * 1024 * 1024 }}));

const recognizer = fr.FaceRecognizer();
if(fs.existsSync(pathToExistingModel)){ //load the model if it exists
	const modelState = require(pathToExistingModel);
	recognizer.load(modelState);
}

app.use(bodyParser.json({limit: '50mb'})); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(bodyParser.raw({limit: '50mb'}));
app.use(session({
  secret: 'mysupersecret', 
  resave: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }), 
  saveUninitialized: false,
  cookie: { maxAge: 180 * 60 * 1000 }
}));

app.use(flash());

const port = process.env.PORT || '3000';
const imgResolution = 200;

hbs.registerPartials(__dirname+'/views/partials');
app.set('view engine','hbs');
app.use(express.static(__dirname+'/public'));

app.use('/admin', adminRoutes);

app.get('/', (req, res) => {
	var messages = req.flash('error')[0];
	res.render('facultyLogin.hbs', {
		successMsg: messages,
		noMessages: !messages
	})
});

app.post('/', (req, res) => {
	var userName = req.body.user;
	var password = req.body.passwd;
	facultycourses.findOne({facultyId: userName, password: password}).then((doc)=>{
		if(!doc){
			req.flash('error', 'Invalid username password');
			return res.redirect('/');
		}
		req.session.userName=userName;
		req.session.name=doc.facultyName;
		return res.redirect('/faculty/'+userName);
	});
});

app.get('/faculty/:facultyId',(req,res) => {
	if(!req.session.userName) return res.redirect('/');
	var facultyId = req.params.facultyId;
	var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    var date = [year, month, day].join('-');
    var name = req.session.name;
	facultycourses.findOne({facultyId : facultyId}).then((doc)=>{
		//console.log(doc.courses);
		res.render('faculty.hbs',{faculty: facultyId, name: name, coursesList : doc.courses, date: date});
	},(err)=>{
		console.log(err);
	})
});

app.post('/takeAttendance',(req,res) => {
	if(!req.session.userName) return res.redirect('/');
	res.render('takeAttendance.hbs',{
		faculty : req.body.facultyId,
		subj : req.body.course,
		date: req.body.dateOfAttendance
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
	row.save().then((doc) => {
		res.send({
			faculty : req.params.faculty,
			subj : req.params.subj,
			svg_string : QRCode[0].QRimage
		});
	}, (e) => {
	  console.log('Unable to save QRCode', e);
	});
});

app.post('/submitQRResponse',(req,res)=>{
	var rollNo = req.body.rollNo;
	var QRCode = req.body.QRCode;
	var courseId;
	var courseArray;
	var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    var today = [year, month, day].join('-');

	//check if QR code is a valid code emitted by us only
	courseqrs.findOne({QRCode: QRCode}).then((course) => {
		if(!course){
			console.log('QRCode not matched to any course');
			return res.send({status : 'FAILED',
							msg: 'Invalid QRCode!!'});
		}
    	courseId = course.courseId;
    	
    	//check if attendance is already marked
    	attendancerecord.findOne({courseId: courseId, 
    		rollNo: rollNo, 
    		markedOn: {"$gte": new Date(today+' 00:00:00').toISOString(), 
				"$lte": new Date(today+' 23:59:59').toISOString()}
						}).then((doc) => {
			if(doc){
				console.log('Attendance already marked for '+rollNo);
				return res.send({status : 'SUCCESS',
								msg: 'Attendance already marked'});		
			}
			//Check the QR code isnt stale
	    	var renderedOn = course.renderedOn.getTime();
	    	var currTime = Date.now();

	    	if(currTime - renderedOn > 5000){
	    		console.log('QR code has expired');
	    		return res.send({status : 'FAILED',
	    							msg: 'QR code has expired'});
	    	}

	    	//Check if imei and rollNo match 
	    	var imei = req.body.imei;
			studentregistration.findOne({rollNo: rollNo, imei: imei})
								.then((student) => {
				if(!student){
					console.log('RollNo and imei dont match');
			  		return res.send({status : 'FAILED', 
			  							msg: 'RollNo and imei dont match'});
				}

				var name = student.name;
				//check if student registered in that course
				studentcourses.findOne({rollNo: rollNo}).then((studentF) => {
					if(!studentF){
						console.log('RollNo doesn\'t exist');
				  		return res.send({status : 'FAILED', 
				  							msg: 'RollNo doesn\'t exist'});
					}
			    	courseArray = studentF.courses;

			    	//if student is registered in the course
			    	if(courseArray.indexOf(courseId) > -1) {
			    		// Mark attendance	
			    		var row = new attendancerecord({
			    			courseId: courseId,
			    			rollNo: rollNo,
			    			name: name
			    		});

			    		row.save().then((doc) => {
							console.log('Successfully saved Attendance for ', rollNo);
							return res.send({status : 'SUCCESS', 
												msg: 'Attendance marked'});
						}, (e) => {
							console.log('Unable to save attendance', e);
							return res.send({status : 'FAILED',
				  	   							msg: err});
						});

			    	}
					else{
						console.log('Student not registered in the course');
				  		return res.send({status : 'FAILED',
				  							msg: 'Student not registered in the course!!'});
					}
				  	
				},(err) => {
				  	   console.log(err);
				  	   return res.send({status : 'FAILED',
				  	   						msg: err});
				});
			},(err) => {
	  	   		console.log(err);
	  	   		return res.send({status : 'FAILED',
				  	   				msg: err});
	  		});
		});
  	},(err) => {
  	   console.log(err);
  	   return res.send({status : 'FAILED',
			  	   			msg: err});
  	});
});

app.post('/recognizeFace', function(req, res) {
	var rollNo = req.body.rollNo;
	if (!req.files)
	return res.status(400).send('No files were uploaded.');
	let faceImg = req.files.faceImg;
	const filePath = `./runTimeAppData/imagesForRecog/${rollNo}.jpg`;
	// Use the mv() method to place the file somewhere on your server
	faceImg.mv(filePath, function(err) {
		if (err){
			console.log(err);
			return res.status(500).send(err);
		}
		if(fd.recognizeFaces(recognizer,filePath,imgResolution) == rollNo){
			fs.unlinkSync(filePath);
			return res.send({status:'SUCCESS',
							msg: 'Face matched'});
		}
		else{
			fs.unlinkSync(filePath);
			return res.send({status:'FAILED',
								msg: 'Face Recognition Failed'});
		}
	});

});

app.post('/validatePhoneLocation', function(req, res){
	/*Not Using this for now
	var phnCoordinates = req.body.coordinates;
	if(geolib.getDistance(H105Coordinates, phnCoordinates) > 30)
		return res.send({status: 'Device not detected at Himalaya'});
	else
		return res.send({status: 'Location verified'});*/
	
});

app.post('/register', function(req, res){
	var args = {name: req.body.name, rollNo: req.body.rollNo, 
				imei: req.body.imei, phnNumber: req.body.phnNumber, 
				secretRegistrationKey: req.body.secretRegistrationKey};
	regisManager.register(args).then((status) => {
		console.log('Returning ', status);
		return res.send(status);
	}, (e) => {
		console.log(e);
		return res.send(e);
	});
});

app.listen(port,() => {
	console.log(`Server is up and running on port ${port}`);
});
