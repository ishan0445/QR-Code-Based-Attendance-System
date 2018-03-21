const express = require('express');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
var qr = require('./QRCodeGenerator');
var regisManager = require('./registration');
var {courseqrs, attendancerecord} = require('./models/attendance.js');
var {studentcourses} = require('./models/student.js');
const {ObjectID} = require('mongodb');
const fs = require('fs');
const fr = require('face-recognition');
const fd = require('./faceDetector');
const geolib = require('geolib');
const pathToExistingModel = './NNModel.json'
var app = express();
var bodyParser = require('body-parser');
const H105Coordinates = {latitude: 17.4454934, longitude: 78.3494515};
app.use(fileUpload());

const recognizer = fr.FaceRecognizer();
if(fs.existsSync(pathToExistingModel)){ //load the model if it exists
	const modelState = require(pathToExistingModel);
	recognizer.load(modelState);
}

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const port = process.env.PORT || '3000';
const imgResolution = 150;

hbs.registerPartials(__dirname+'/views/partials');
app.set('view engine','hbs');

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
	console.log(QRCode[0].QRCode);
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

	courseqrs.findOne({QRCode: QRCode}).then((course) => {
		if(!course){
			console.log('QRCode not matched to any course');
			return res.send({status : 'Invalid QRCode!!'});
		}
    	courseId = course.courseId;
    	//Check the QR code isnt stale

    	var renderedOn = course.renderedOn.getTime();
    	var currTime = Date.now();

    	if(currTime - renderedOn > 5000){
    		console.log('QR code has expired');
    		return res.send({status : 'QR code has expired'});
    	}

		studentcourses.findOne({rollNo: rollNo}).then((student) => {
			if(!student){
				console.log('RollNo doesn\'t exist');
		  		return res.send({status : 'RollNo doesn\'t exist'});
			}
	    	courseArray = student.courses;
	    	if(courseArray.indexOf(courseId) > -1) {//if student is registered in the course
	    		// Mark attendance	
	    		var row = new attendancerecord({
	    			courseId: courseId,
	    			rollNo: rollNo
	    		});

	    		row.save().then((doc) => {
					console.log('Successfully saved Attendance');
					return res.send({status : 'okay'});
				}, (e) => {
					console.log('Unable to save attendance', e);
					return res.send({status : e});
				});

	    	}
			else{
				console.log('Student not registered in the course');
		  		return res.send({status : 'Student not registered in the course!!'});
			}
		  	
		},(err) => {
		  	   console.log(err);
		  	   return res.send({status : err});
		});
  	},(err) => {
  	   console.log(err);
  	   return res.send({status : err});
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
		if (err)
			return res.status(500).send(err);
		if(fd.recognizeFaces(recognizer,filePath,imgResolution) == rollNo){
			fs.unlinkSync(filePath);
			return res.send({status:'Face matched'});
		}
		else{
			fs.unlinkSync(filePath);
			return res.send({status:'Face Recognition Failed'});
		}
	});

});

app.post('/validatePhoneLocation', function(req, res){
	phnCoordinates = req.body.coordinates;
	if(geolib.getDistance(H105Coordinates, phnCoordinates) > 30)
		return res.send({status: 'Device not detected at Himalaya'});
	else
		return res.send({status: 'Location verified'});
});

app.post('/register', function(req, res){
	var args = {name: req.body.name, rollNo: req.body.rollNo, 
				imei: req.body.imei, phnNumber: req.body.phnNumber, 
				secretRegistrationKey: req.body.secretRegistrationKey};
	regisManager.register(args).then((status) => {
		return res.send(status);
	}, (e) => {
		console.log(e);
		return res.send(e);
	});
});

app.listen(port,() => {
	console.log(`Server is up and running on port ${port}`);
});
