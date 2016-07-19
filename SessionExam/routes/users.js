var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  var userInfo = req.session.passport.user;
  //res.send('respond with a resource : ' + userInfo.name + ', ' + userInfo.email);
  res.render('users',userInfo);
});

module.exports = router;