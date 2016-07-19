var express = require('express');
var session = require('express-session');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

// 로그인 인증
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
// 로그인 검증
var authCheck = require('./utils/authCheck.js').createAuthFunctions();

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB를 세션 저장소로 사용하기
var MongoStore = require('connect-mongo')(session);
var sessionStoreOptions = {
  url: 'mongodb://127.0.0.1:27017/session'
};
// Session Option -> 이 부분이 passport 모듈에 session 설정해주는 부분보다 먼저 와야 함
app.use(session({
  secret: 'Secret Key',
  rolling: true,  // request 시마다 세션 생명 연장
  resave: false,
  saveUninitialized: false,
  store: new MongoStore(sessionStoreOptions)
}));

app.use(passport.initialize());
app.use(passport.session());      // passport를 사용한 인증 시 session 사용 설정

app.use('/', routes);
app.use('/users', authCheck.isAuthenticated, users);

// Local Auth 처리
var strategy = new LocalStrategy(
    function(username, password, done){
      if(username == 'user' && password == '1234'){
        var userInfo = {name:'user', email:'user@gmail.com'};
        return done(null, userInfo);
      }
      done(null, false, {message:'Incorrect ID/PW'});
    }
);
passport.use(strategy);
// Login 시 사용자 정보를 Session에 저장
passport.serializeUser(function(user, done){
  console.log('user serialize',user);
  done(null, user);
});
passport.deserializeUser(function(user, done){
  console.log('logged in', user);
  done(null, user);
});

// Login 화면
app.get('/login', function(req,res){
  console.log('authorized GET : ', req.isAuthenticated());
  console.log('req.session.cookie.expires login screen',req.session);
  res.render('login',{title:'로그인'});
});
// Login Action : 'POST'
app.post('/login', passport.authenticate('local',{session: true}), function(req, res){
  console.log('authorized POST : ', req.isAuthenticated());
  //req.session.cookie.expires = new Date(Date.now() + 60000);    // 세션 기한
  req.session.cookie.maxAge = 60000;    // 세션 생명주기 1분
  console.log('login info in session', req.session.passport.user);
  res.redirect(301, '/users');
  /*
  var userInfo = req.session.passport.user;
  console.log('app.js -> req.session', req.session);
  res.send('로그인 성공! 사용자 이름 : ' + userInfo.name + ', ' + userInfo.email);
  */
});
// Logout Action : 'GET'
app.get('/logout', function(req, res){
  authCheck.logout(req, res);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;