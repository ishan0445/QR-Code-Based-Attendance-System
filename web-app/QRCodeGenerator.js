var qr = require('qr-image');
const {ObjectID} = require('mongodb');

var QRCodeGenerator = (n) => {
	var QRCodes = [];
	for(var i=0;i<n;i++){
		var code = new ObjectID().toString();
		var QR = qr.imageSync(code,
			{ type: 'svg', size: 22 });
		QRCodes.push({QRCode: code, 
					   QRimage : QR});
		//console.log(QR);
	}
	return QRCodes;
}

module.exports = {
	QRCodeGenerator
}
//console.log(QRCodeGenerator(2));