var express = require('express');
var router = express.Router();

router.use("/public", express.static('public'));
router.get('/', function(req, res, next) {
	return res.send('Hello Admin!');
});

module.exports = router;
