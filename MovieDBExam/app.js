
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

/////////////////////////////////////////////////////
var mysql = require('mysql');
var dbConfig = {
		host:'localhost',
		user:'root',
		password:'maria',
		database:'moviest'
};
var connection = mysql.createConnection(dbConfig);
connection.connect(function(err){
	if(err){
		console.log('error connecting:'+err.stack);
		return;
	}
	console.log('connected as id '+connection.threadId);
});
/////////////////////////////////////////////////////
var MongoClient = require('mongodb').MongoClient;
var mongodb = null;
MongoClient.connect('mongodb://localhost:27017/moviest',function(err,db){
	if(err){
		console.log('error connecting:'+err.stack);
		return;
	}
	console.log('Connected correctly to server');
	mongodb = db;
});


app.get('/movies', function(req,res){
	var select = 'select movie_id, title, director, year from movie;';
	connection.query(select, function(err,results){
		if(err){
			console.log('Select Error',err);
		} else {
			//res.send(results);
			console.log(results);
			res.render('movieList.jade',{title:'Movies', movies:results});
		}
	});
});/*
app.delete('/movies', function(req,res){
	var deleteQuery = 'delete from movie where movie_id = ?';
	connection.query(deleteQuery,[req.body.movie_id],function(err,results){
		if(err){
			console.log(err);
		} else {
			console.log(results);
			var movie = mongodb.collection('movie');
			movie.deleteOne({movie_id:req.body.movie_id},function(err,results){
				if(err){
					console.log(err);
				} else {
					res.writeHead(301,{location:'/movies'});
					res.end();
				}
			});
		}
	});
});*/
app.post('/movies/comment', function(req,res){
	var comments = mongodb.collection('comment');
	comments.insert({movie_id:Number(req.body.movie_id),comment:req.body.comment},
			function(err,results){
		if(err){
			console.log(err);
		} else {
			res.redirect('/movies/'+req.body.movie_id);
		}
	});
});
var ObjectId = require('mongodb').ObjectId;
app.delete('/movies/comment', function(req,res){
	var comments = mongodb.collection('comment');
	comments.remove({_id:ObjectId.createFromHexString(req.body._id)}, function(err,result){
		if(err) console.log(err);
		else {
			res.redirect('/movies/'+req.body.movie_id);
		}
	});
});
app.post('/movies/delete', function(req,res){
	var deleteQuery = 'delete from movie where movie_id = ?';
	connection.query(deleteQuery,[req.body.movie_id],function(err,results){
		if(err){
			console.log(err);
		} else {
			console.log(results);
			var movie = mongodb.collection('movie');
			movie.remove({movie_id:Number(req.body.movie_id)},function(err,results){
				if(err){
					console.log(err);
				} else {
					var comments = mongodb.collection('comment');
					comments.remove({movie_id:Number(req.body.movie_id)},function(err,results){
						if(err) console.log(err);
						else {
							res.redirect('/movies');
						}
					});
				}
			});
		}
	});
});
app.get('/movies/add', function(req,res){
	res.render('movieInsert.jade',{title:'Add Movie'});
});/*
app.post('/movies/mod', function(req,res){
	console.log(req.body);
	res.render('movieModify.jade',req.body);
});*/
app.post('/movies/add',function(req,res){
	var insert = 'insert into movie (title,director,year) values (?,?,?)';
	var body = req.body;
	connection.query(insert,[body.title,body.director,Number(body.year)],function(err,result){
		if(err){
			console.log(err);
		} else {
			console.log(result);
			var movie = mongodb.collection('movie');
			movie.insert({movie_id:result.insertId,synopsis:body.synopsis},function(err,results){
				if(err){
					console.log(err);
				} else {
					res.redirect('/movies');
				}
			});
		}
	})
});/*
app.put('/movies/add',function(req,res){
	var update = 'update movie set title=?, director=?, year=? where movie_id = ?';
	var body = req.body;
	connection.query(update,[body.title,body.director,Number(body.year),Number(body.movie_id)],function(err,result){
		if(err){
			console.log(err);
		} else {
			console.log(result);
			var movie = mongodb.collection('movie');
			console.log(body.synopsis);
			movie.updateOne({movie_id:Number(body.movie_id)},{$set:{synopsis:body.synopsis}},function(err,results){
				if(err){
					console.log(err);
				} else {
					console.log(results);
					res.redirect('/movies/'+body.movie_id);
				}
			});
		}
	})
});*/
app.get('/movies/modify/:id', function(req,res){
	var dynamicSelect = 'select * from movie where movie_id = ?';
	connection.query(dynamicSelect,[req.params.id], function(err,results){
		if(err){
			console.log('Select Error',err);
		} else {				
			var movieObj = {};
			if(results.length>0){
				movieObj = { movie_id:results[0].movie_id,
							 title:results[0].title,
							 director:results[0].director,
							 year:results[0].year,
							 comments:[],
							 synopsis:''
				};
				var movie = mongodb.collection('movie');
				movie.find({movie_id:Number(results[0].movie_id)}).toArray(function(err,docs){
					if(docs.length >0) movieObj.synopsis = docs[0].synopsis;
					res.render('movieModify.jade',{title:'Modify Movie Info',movie:movieObj})
				});
			}
		}
	});
});
app.post('/movies/modify', function(req,res){
	var update = 'update movie set title=?, director=?, year=? where movie_id = ?';
	var body = req.body;
	connection.query(update,[body.title,body.director,Number(body.year),Number(body.movie_id)],function(err,result){
		if(err){
			console.log(err);
		} else {
			var movie = mongodb.collection('movie');
			movie.findOneAndUpdate({movie_id:Number(body.movie_id)},{"$set":{synopsis:body.synopsis}},function(err,results){
				console.log(results);
				if(results.value==null){
					movie.insert({movie_id:Number(body.movie_id),synopsis:body.synopsis},function(err,results){
						if(err) console.log(err);
						else {
							res.redirect('/movies/'+body.movie_id);
							return;
						}
					});
				} else {
					res.redirect('/movies/'+body.movie_id);
				}
			});
			/*
			movie.update({movie_id:Number(body.movie_id)},{'$set':{synopsis:body.synopsis}},function(err,results){
				if(err) console.log(err);
				else {
					res.redirect('/movies/'+body.movie_id);
				}
			});*/
		}
	})
});
app.get('/movies/:id', function(req,res){
	var synopsis = '';
	var dynamicSelect = 'select * from movie where movie_id = ?';
	connection.query(dynamicSelect,[req.params.id], function(err,results){
		if(err){
			console.log('Select Error',err);
		} else {				
			var movieObj = {};
			if(results.length>0){
				movieObj = { movie_id:results[0].movie_id,
							 title:results[0].title,
							 director:results[0].director,
							 year:results[0].year,
							 comments:[],
							 synopsis:''
				};
				var movie = mongodb.collection('movie');
				movie.find({movie_id:Number(results[0].movie_id)}).toArray(function(err,docs){
					if(docs.length >0){
						movieObj.synopsis = docs[0].synopsis;
					}
					var comments = mongodb.collection('comment');
					comments.find({movie_id:Number(results[0].movie_id)}).toArray(function(err,docs){
						for(var i=0;i<docs.length;i++){
							movieObj.comments.push({_id:docs[i]._id,comment:docs[i].comment});
						}
						console.log(movieObj);
						res.render('movieDetail.jade',{movie:movieObj});
					});
				});
			}
		}
	});
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
