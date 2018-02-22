var qr = require('qr-image');
 
var svg_string = qr.imageSync("237781623876182338978973"
	, { type: 'svg', size: 5 });

console.log(svg_string)