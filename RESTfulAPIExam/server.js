/**
 * RESTfulAPIExam server.js
 */
var movieList = ['아바타','스타워즈','인터스텔라'];
var movieDetail = {
	'아바타':{ 'director':'제임스 카메론' },
	'스타워즈':{ 'director':'조지 루카스' },
	'인터스텔라':{ 'director':'크리스토퍼 놀란' }
};
var http = require('http');
var server = http.createServer(function(req,res){
	var method = req.method.toLowerCase();
	console.log(method);
	if (method == 'get') handleGetRequest(req,res);
	else if (method == 'post') handlePostRequest(req,res);
	else if (method == 'put') handlePutRequest(req,res);
	else if (method == 'delete') handleDeleteRequest(req,res);
	else { res.statusCode = 404; res.end('Wrong method'); }
});
server.listen(3000);
var urlencode = require('urlencode');
function handleGetRequest(req,res) {
	var url = req.url;
	if (url == '/movies') {
		res.writeHead(200, {'Content-Type':'application/json; charset=UTF-8'});
		res.end(JSON.stringify(movieList));
	} else {
		var itemName = url.split('/')[2];
		itemName = urlencode.decode(itemName);
		var item = movieDetail[itemName];
		if (item) {
			res.writeHead(200, {'Content-Type':'application/json; charset=UTF-8'});
			res.end(JSON.stringify(item));
		} else {
			res.statusCode = 404; res.end('Wrong movie name');
		}
	}
}
var querystring = require('querystring');
function handlePostRequest(req,res) {
	var url = req.url;
	if (url == '/movies') {
		var body = '';
		req.on('data',function(chunk) { body += chunk; });
		req.on('end',function() { 
			var parsed = querystring.parse(body);
			movieList.push(parsed.title);
			movieDetail[parsed.title] = { director:parsed.director };
			res.statusCode = 302; res.setHeader('Location','/movies'); res.end();
		});
	}
}
function handlePutRequest(req,res) {
	var url = req.url;
	if (url == '/movies') {
		var body = '';
		req.on('data',function(chunk) { body += chunk; });
		req.on('end',function() {
			var parsed = querystring.parse(body);
			var obj = JSON.parse(parsed.movies);
			movieList = []; movieDetail = {};
			for (var i = 0; i < obj.length; i++) {
				movieList.push(obj[i].title);
				movieDetail[obj[i].title] = { director:obj[i].director };
			}
			res.writeHead(200, {'Content-Type':'application/json; charset=UTF-8'});
			res.end(JSON.stringify({movieList:movieList,movieDetail:movieDetail}));
		});
	} else {
		var itemName = url.split('/')[2];
		itemName = urlencode.decode(itemName); 
		var body = '';
		var parsed = '';
		req.on('data',function(chunk) { body += chunk; });
		req.on('end',function() {
			parsed = querystring.parse(body);
			if (!movieDetail[itemName]) movieList.push(itemName);
			movieDetail[itemName] = { director:parsed.director };
			res.writeHead(200, {'Content-Type':'application/json; charset=UTF-8'});
			res.end(JSON.stringify({movieList:movieList,movieDetail:movieDetail}));
		});
	}
}
function handleDeleteRequest(req,res) {
	var url = req.url;
	if (url == '/movies') {
		movieList = [];
		movieDetail = {};
		res.writeHead(200, {'Content-Type':'application/json; charset=UTF-8'});
		res.end(JSON.stringify(movieList));
	} else {
		var itemName = url.split('/')[2];
		itemName = urlencode.decode(itemName);
		var item = movieDetail[itemName];
		if (item) {
			var index = movieList.indexOf(itemName);
			if (index != -1) movieList.splice(index,1);
			delete movieDetail[itemName];
			res.writeHead(200, {'Content-Type':'application/json; charset=UTF-8'});
			res.end(JSON.stringify({movieList:movieList,movieDetail:movieDetail}));
		} else {
			res.statusCode = 404; res.end('Wrong movie name');
		}
	}
}
