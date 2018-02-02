var qr = require('qr-image');
 
// var qr_svg = qr.image('I love QR!', { type: 'svg' });
// qr_svg.pipe(require('fs').createWriteStream('i_love_qr.svg'));
 
var svg_string = qr.imageSync('I love QR!', { type: 'svg',
	size: 5 });

console.log(svg_string)