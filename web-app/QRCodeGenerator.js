var qr = require('qr-image');
const {MongoClient, ObjectID} = require('mongodb');

var QRCodeGenerator = (n) => {
	var QRCodes = [];
	for(var i=0;i<n;i++){
		var QR = qr.imageSync((new ObjectID()).toString(),
			{ type: 'svg', size: 5 });
		QRCodes.push(QR);
		//console.log(QR);
	}
	return QRCodes;
}

//console.log(QRCodeGenerator(2));