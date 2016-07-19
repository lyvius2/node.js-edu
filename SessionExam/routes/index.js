var express = require('express');
var router = express.Router();

/* GET home page. */

var createCurrentDateString = function(){
  var date = new Date();
  return date.getFullYear() + '.' + (date.getMonth()+1) + '.' + date.getDay() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

router.get('/', function(req, res, next) {
  var currentDate = createCurrentDateString();
  if(req.session.visit) {
    req.session.visit = parseInt(req.session.visit) + 1;
  } else {
    req.session.visit = 1;
    req.session.startDate = currentDate;
  }
  req.session.finalDate = currentDate;
  console.log(req.sessionID);
  //console.log(req._startTime);
  //console.log(res);
  res.render('index', { title: 'Express', sessionInfo: req.session });
});

module.exports = router;
