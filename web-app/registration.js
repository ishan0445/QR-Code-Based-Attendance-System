const {ObjectID} = require('mongodb');
var fs = require('fs'),
readline = require('readline');
var {studentregistration, attendanceregistration} = require('./models/student.js');

var populateAttendanceRegistration = (rollNoFile) => {
	var rd = readline.createInterface({
	    input: fs.createReadStream(rollNoFile),
	});

	rd.on('line', function(line) {
	    var row = new attendanceregistration({
			rollNo: line,
			secretRegistrationKey: new ObjectID().toString()
		});
	    row.save().then(() => {
		},(err) => {
			console.log(err);
			return {status : err};
		});
	});
}

var register = (args) => {
	return new Promise((resolve, reject)=>{
		attendanceregistration.findOne({rollNo: args.rollNo, 
				secretRegistrationKey: args.secretRegistrationKey}).then((doc) => {
			if(!doc)
				return reject({status: 'Invalid rollNo or Registration Key'});

			//register the student
			var row = new studentregistration({
				name: args.name,
				rollNo: args.rollNo,
				imei: args.imei, 
				phnNumber: args.phnNumber
			});

			//save the student details
			row.save().then(() => {
				//now delete the registrationKey so that it cant be used again
				attendanceregistration.remove({rollNo: args.rollNo, 
				secretRegistrationKey: args.secretRegistrationKey}).then((doc) => {
					//successful registration
					console.log('Registration successful', args.rollNo);
		  			return resolve({status: 'Registration successful'});
				},(e) => {
					console.log(err);
	  				return reject({status : err});
				});	
			},(err) => {
				console.log(err);
				return reject({status : err});
			});
		},(err) => {
	  	   console.log(err);
	  	   return reject({status : err});
	  	});
	});
}

module.exports = {
	register,
	populateAttendanceRegistration
}