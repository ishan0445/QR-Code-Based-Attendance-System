var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/qrbasedattendancesystem');

var {facultycourses} = require('./../models/faculty.js');
var {courses,coursestudent} = require('./../models/coursesstudents.js');
var {studentcourses} = require('./../models/student.js');

var faculty = [
	new facultycourses({
		facultyId: 'drpawan',
		facultyName: 'Dr. Pawan',
		password: 'drpawan',
		courses: ['Parallel-Systems', 'Scientific-Computing', 'DataStructures']
	}),
	new facultycourses({
		facultyId: 'drkanan',
		facultyName: 'Dr. Kanan',
		password: 'drkanan',
		courses: ['POIS', 'Security-Research']
	}),
	new facultycourses({
		facultyId: 'drpurini',
		facultyName: 'Dr. Purini',
		password: 'drpurini',
		courses: ['Distributed-Systems', 'Operating-Systems']
	})
]

for (var i = 0; i < faculty.length; i++) {
  faculty[i].save()
}


var allCourses = [
	new courses({
		courseId: 'Parallel-Systems'
	}),
	new courses({
		courseId: 'Scientific-Computing'
	}),
	new courses({
		courseId: 'DataStructures'
	}),
	new courses({
		courseId: 'POIS'
	}),
	new courses({
		courseId: 'Security-Research'
	}),
	new courses({
		courseId: 'Distributed-Systems'
	}),
	new courses({
		courseId: 'Operating-Systems'
	})
]

for (var i = 0; i < allCourses.length; i++) {
  allCourses[i].save()
}

var courseData = [
	new coursestudent({
		courseId: 'Parallel-Systems',
		rollNos: ['20162078', '20162035', '20162076', '20162115'
		]
	}),
	new coursestudent({
		courseId: 'Scientific-Computing',
		rollNos: ['20162035', '20162076', '20162115'
		]
	}),
	new coursestudent({
		courseId: 'DataStructures',
		rollNos: ['20162078', '20162035', '20162076', '20162115'
		]
	})
]

for (var i = 0; i < courseData.length; i++) {
  courseData[i].save()
}

var studentData = [
	new studentcourses({
		rollNo: '20162078',
		courses: ['Parallel-Systems', 'DataStructures']
	}),
	new studentcourses({
		rollNo: '20162035',
		courses: ['Parallel-Systems', 'DataStructures', 'Scientific-Computing']

	}),
	new studentcourses({
		rollNo: '20162076',
		courses: ['Parallel-Systems', 'DataStructures', 'Scientific-Computing']
	}),
	new studentcourses({
		rollNo: '20162115',
		courses: ['Parallel-Systems', 'DataStructures', 'Scientific-Computing']
	})
]

for (var i = 0; i < studentData.length; i++) {
  studentData[i].save()
}