/**
 * server.js
 */
var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var movies = [];
var server = http.createServer(function(req,res){
	//console.log(req);
	if (req.url == '/' && req.method == 'GET') {
		res.writeHead(200, {'Content-Type':'text/html; charset=UTF-8'});
		fs.createReadStream('index.html').pipe(res);
		return;
	} else if (req.url == '/list' && req.method == 'GET') {
		var html = '<html><head><meta charset="UTF-8"></head><body><H1>Favorite Movie</H1><ul>';
		for (var i = 0; i < movies.length; i++) {
			html += '<li>'+movies[i].title+'('+movies[i].director+')</li>';
		}
		html += '</ul><H2>새 영화 입력</H2><form method="POST" action="/upload">';
		html += '<input type="text" name="title">';
		html += '<BR><input type="text" name="director"><BR>';
		html += '<input type="submit" value="upload"></BODY></HTML>';
		res.end(html);
	} else if (req.url == '/upload' && req.method == 'POST') {
		var body = '';
		req.on('data',function(chunk) {
			console.log('got %d bytes of data', chunk.length);
			body += chunk;
		});
		req.on('end',function() {
			console.log('there will be no more data'); console.log('end:'+body);
			var query = querystring.parse(body);
			movies.push({title:query.title,director:query.director});
			res.statusCode = 302; res.setHeader('Location','/list'); res.end();
			//console.log('name1:'+query.name1);
			//console.log('name2:'+query.name2);
		});
	}
});
server.listen(3000);