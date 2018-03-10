var fd = require('./faceDetector');
fd.faceDetectorAndClipper('./images/sheldon',200);
//fd.learnNewFaces('./images/sheldon','20162078','./NNModel.json');

// const path = require('path')
// const fs = require('fs')
// const fr = require('face-recognition')
// const win = new fr.ImageWindow()



// const dir = './images/sheldon';
// const allFiles = fs.readdirSync(dir)
// const sheldonFaces = []
// allFiles.forEach((picName) => sheldonFaces.push(fr.loadImage(path.join(dir, picName))))
// console.log(sheldonFaces)

// sheldonFaces.forEach((img) => {
// 	win.setImage(img);
// 	fr.hitEnterToContinue()
// });

/*const dataPath = path.resolve('./images')

const classNames = ['sheldon','stuart']

const image1 = fr.loadImage('/home/kanishtha/Desktop/face/images/me.jpg')
const image2 = fr.loadImage('/home/kanishtha/Desktop/face/images/flower.jpg')
const win = new fr.ImageWindow()

// display image
//win.setImage(image1)
const detector = fr.FaceDetector()
const faceRectangles = detector.locateFaces(image1)
const targetSize = 200
const faceImages = detector.detectFaces(image1, targetSize)
win.setImage(faceImages[1])
fr.hitEnterToContinue() */