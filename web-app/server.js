const express = require('express');
const hbs = require('hbs');
var qr = require('qr-image');

var app = express();

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
	var svg_string = qr.imageSync('I love QR!', { type: 'svg',size: 30});

	res.render('takeAttendance.hbs',{
		faculty : req.params.faculty,
		subj : req.params.subj,
		svg_string
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