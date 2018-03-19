const path = require('path');
const fs = require('fs');
const fr = require('face-recognition');
var Regex = require('regex');

var faceDetectorAndClipper = (dirPath,resolution) => {
	const detector = fr.FaceDetector();
	const allFiles = fs.readdirSync(dirPath);
	allFiles.forEach((picName,i) => {
		const faceImages = detector.detectFaces(
			fr.loadImage(path.join(dirPath, picName)), resolution);
		faceImages.forEach((img,j) => fr.saveImage(
			path.join(dirPath, `detected_${i}_${j}.png`), img));
	});
}

function learnNewFaces(dirPath,rollNo,recognizer){
	console.log(dirPath);
	//following regex library is shitty, so is the regex :(
	var regex = new Regex(/detected(0|1|2|3|4|5|6|7|8|9|_)*.png/);
	const allFiles = fs.readdirSync(dirPath);
	allFiles.forEach((picName) => {
		if(regex.test(picName)){
			var image = [];
			image.push(fr.loadImage(path.join(dirPath, picName)));
			recognizer.addFaces(image, rollNo);	
		}
	});
	console.log(dirPath, ' completed');	
}

var learning = (dirPath,pathToExistingModel) => {
		const allRolls = fs.readdirSync(dirPath);
		const recognizer = fr.FaceRecognizer();
		if(fs.existsSync(pathToExistingModel)){ 
			//load the model if it exists
			const modelState = require(pathToExistingModel);
			recognizer.load(modelState);
		}
	
		allRolls.forEach((rollNo) => 
			learnNewFaces(path.join(dirPath, rollNo), 
				rollNo, recognizer)
		);		

		const modelState = recognizer.serialize();
		fs.writeFileSync(pathToExistingModel, JSON.stringify(modelState));
}

var recognizeFaces = (recognizer,faceImgPath,resolution) => {
	faceImg = fr.loadImage(faceImgPath);
	const detector = fr.FaceDetector();
	const faceImages = detector.detectFaces(faceImg, resolution);
	if(faceImages.length == 0) 
		return 'null';
	const bestPrediction = recognizer.predictBest(faceImages[0]);
	if(bestPrediction.distance > 0.6) //some metric of accuracy
		return 'null';
	return bestPrediction.className;
}

module.exports = {
	faceDetectorAndClipper, 
	learnNewFaces,
	learning,
	recognizeFaces
}


