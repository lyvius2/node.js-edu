/**
 * server.js
 */
var formidable = require('formidable');
var http = require('http');
var fs = require('fs');
var paints = [];
var server = http.createServer(function(req,res) {
	if (req.url == '/list' && req.method == 'GET') {
		var html = '<html><head><meta charset="UTF-8"></head><body><H1>Favorite Paint</H1><ul>';
		for (var i = 0; i < paints.length; i++) {
			html += '<li><img src="http://127.0.0.1:3000/'+paints[i].image_url+'">'+paints[i].title+'</li>';
		}
		html += '</ul><br><form method="POST" action="/upload" enctype="multipart/form-data">작품이름:';
		html += '<input type="text" name="title"><BR><input type="file" name="file">';
		html += '<br><input type="submit" value="upload"></form></body></html>';
		res.end(html);
	} else if (req.url == '/upload' && req.method == 'POST') {
		var form = new formidable.IncomingForm();
		form.encoding = 'utf-8'; form.keepExtension = true; form.uploadDir = './upload';
		form.parse(req, function(err,fields,files) {
			var File = files.file;
			var filename = File['path'];
			filename = filename.replace(/\\/gm,'/');
			paints.push({title:fields.title,image_url:filename});
			res.statusCode = 302; res.setHeader('Location','/list'); res.end();
		});
	} else {
		var path = __dirname + req.url;
		fs.exists(path,function(exist) {
			if (exist) { 
				res.writeHead(200,{"Content-Type":"image/*"});
				fs.createReadStream(path).pipe(res);
			}
		});
	}
	
});
server.listen(3000);

