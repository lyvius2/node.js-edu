/**
 * http://usejsdoc.org/
 */

var fs = require('fs');
var async = require('async');
var text = '';
var checkFileFunc = function(callback) {
	fs.stat('./README.md', function(err, stats) {
		console.log(err+'/'+stats);
		if (err) callback(err);
		else {
			if (stats.isFile()) {
				callback(null,'Check Done');
			} else {
				callback('not file');
			}
		}
	});
};
var readFileFunc = function(callback) {
	fs.readFile('./README.md', 'utf-8', function(err, data) {
		text = data;
		callback(null,'Read Done');
	});
};
var writeFileFunc = function(callback) {
	fs.writeFile('./HELLO.md', text, function(err) {
		if (err) callback(err);
		callback(null,'Write Done');
	});
};
async.series([ checkFileFunc, readFileFunc, writeFileFunc ], function(err,results) {
	console.log('Copy complete...'+results);
});