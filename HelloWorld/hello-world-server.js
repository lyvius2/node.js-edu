var http = require('http');

var hello = require('./myModule1.js');
var hello2 = require('./myModule1.js');
hello.howAreYou();
hello2.howAreYou();

var hello3 = require('./myModule2.js');
var greeting = hello3.createGreeting();
greeting.hello('Steve jobs');
greeting.howAreYou();

var hello4 = require('./myModule3.js');
var obj = new hello4();
obj.howAreYou();

var hello5 = require('./myModule4.js');
hello5.hello();

///////////////////////////////////////////////////////////////////

function task1() {
	console.log('First Task Started');
	setTimeout(function() {
		console.log('First Task Done');
	},3000);
}
function task2() {
	console.log('Second Task Started');
	setTimeout(function() {
		console.log('Second Task Done');
	},1000);
}
task1();
task2();

function task3(callback) {
	console.log('#First Task Started');
	setTimeout(function() {
		console.log('#First Task Done');
		callback();
	},3000);
}
function task4() {
	console.log('#Second Task Started');
	setTimeout(function() {
		console.log('#Second Task Done');
	},1000);
}
task3(function() {
	task4();
});

var async = require('async');
async.series([
              	function(callback) {
              		console.log('$First Task Started');
              		setTimeout(function() {
              			console.log('$First Task Done');
              			callback(null, 'Done');
              		},3000);
              	},
              	function(callback) {
              		console.log('$Second Task Started');
              		setTimeout(function() {
              			console.log('$Second Task Done');
              			callback(null, 'Done');
              		},1000);
              	}
              ], function(err, results) {
	console.log('$All Task Done, series '+results);
});

///////////////////////////////////////////////////////////////////

http.createServer(function handler(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World!!!!\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');
