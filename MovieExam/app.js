
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var movieList = ['아바타','스타워즈','인터스텔라'];
var movieDetail = {
	'아바타':{ 'director':'제임스 카메론' },
	'스타워즈':{ 'director':'조지 루카스' },
	'인터스텔라':{ 'director':'크리스토퍼 놀란' }
};
var urlencode = require('urlencode');
app.get('/movies', function(req,res){
	//res.send(movieList);
	res.render('movies.jade',
		{title:'Movie List', items:movieList});
});
app.get('/movies/:id',function(req,res){
	var itemName = req.params.id;
	itemName = urlencode.decode(itemName);
	var item = movieDetail[itemName];
	if (item) {
		//res.send(item);
		res.render('movie.jade',
			{
				title:itemName,
				director:item.director,
				actor:item.actor
			});
	} else {
		res.statusCode = 404; res.end('Wrong movie name');
	}
});
app.post('/movies',function(req,res){
	movieList.push(req.body.title);
	movieDetail[req.body.title] = { 
			director:req.body.director, 
			actor:req.body.actor
		};
	res.redirect('/movies');
});
app.put('/movies',function(req,res){
	var obj = JSON.parse(req.body.movies);
	movieList = []; movieDetail = {};
	for (var i = 0; i < obj.length; i++) {
		movieList.push(obj[i].title);
		movieDetail[obj[i].title] = { 
				director:obj[i].director, 
				actor:obj[i].actor
			};
	}
	res.writeHead(301, {location: '/movies'}); res.end();
	//res.send({movieList:movieList,movieDetail:movieDetail});
});
app.put('/movies/:id',function(req,res){
	var itemName = req.params.id;
	itemName = urlencode.decode(itemName);
	if (!movieDetail[itemName]) movieList.push(itemName);
	movieDetail[itemName] = { 
			director:req.body.director, 
			actor:req.body.actor
		};
	res.writeHead(301, {location: '/movies'}); res.end();
	//res.send({movieList:movieList,movieDetail:movieDetail});
});
app.delete('/movies',function(req,res){
	movieList = []; movieDetail = {};
	res.writeHead(301, {location: '/movies'}); res.end();
	//res.send({movieList:movieList,movieDetail:movieDetail});
});
app.delete('/movies/:id',function(req,res){
	var itemName = req.params.id;
	itemName = urlencode.decode(itemName);
	var item = movieDetail[itemName];
	if (item) {
		var index = movieList.indexOf(itemName);
		if (index != -1) movieList.splice(index,1);
		delete movieDetail[itemName];
		res.writeHead(301, {location: '/movies'}); res.end();
		//res.send({movieList:movieList,movieDetail:movieDetail});
	} else {
		res.statusCode = 404; res.end('Wrong movie name');
	}
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
