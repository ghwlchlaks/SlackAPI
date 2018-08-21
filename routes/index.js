var express = require('express');
var router = express.Router();

const slack = require('../policies/slack')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/slack', slack.sendToSlack)
module.exports = router;
