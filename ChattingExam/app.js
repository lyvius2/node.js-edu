
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

var server = http.createServer(app);
var socketio = require('socket.io');
var io = socketio.listen(server);		// Socket 통신 생성
var users = [];
var redis = require('redis');
var subscriber = redis.createClient();	// Redis Client 생성
var publisher = redis.createClient();	// Redis Client 생성
//===========================================================
var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/test');
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;
var chatLogs = new Schema({
	id:ObjectId,log:String,date:String
});
var ChatLogModel = mongoose.model('chatlog',chatLogs);
var chatMsgs = new Schema({
	id:ObjectId,message:String
});
var ChatMsgModel = mongoose.model('chatmsg',chatMsgs);
function saveLog(socket,id,state){
	var chatLog = new ChatLogModel();
	if(state == 'conn')
		chatLog.log = id+'님이 접속했습니다.';
	else
		chatLog.log = id+'님이 나갔습니다.';
	chatLog.date = new Date();
	chatLog.save(function(err){
		if(err) console.log(err);
		else {
			ChatLogModel.find({},function(err,logs){
				console.log('logs',logs);
				socket.emit('logs',JSON.stringify(logs));
				socket.broadcast.emit('logs',JSON.stringify(logs));
			});
		}
	})
}
//===========================================================
var chatPass = '';
io.sockets.on('connection',function(socket){
	console.log('connection');
	//-----------------------------------------------------------
	subscriber.subscribe('chat');		// 대기
	subscriber.on('message',function(channel,message){
		socket.emit('message_go',JSON.stringify({message:message}));
	});
	socket.on('message',function(raw_msg){
		console.log('message',raw_msg);
		var msg = JSON.parse(raw_msg);
		console.log(msg);
		var chat_msg = msg.chat_id+':'+msg.message;
		publisher.publish('chat',chat_msg);
		var chatmsg = new ChatMsgModel();
		chatmsg.message = chat_msg;
		chatmsg.save(function(err){if(err)console.log(err);});
	});
	//-----------------------------------------------------------
	socket.on('chat_conn',function(raw_msg){
		console.log('chat_conn:'+raw_msg);
		var msg = JSON.parse(raw_msg);
		var index = users.indexOf(msg.chat_id);
		if(index == -1){
			users.push(msg.chat_id);
			socket.emit('chat_join',JSON.stringify(users));				// 소켓접속한 client 사용자 본인에게 이벤트 발생
			socket.broadcast.emit('chat_join',JSON.stringify(users));	// 다른 사용자 전부에게 이벤트 발생
			ChatMsgModel.find({},function(err,results){
				socket.emit('message_go',JSON.stringify(results));
			});
			saveLog(socket,msg.chat_id,'conn');
		} else {
			socket.emit('chat_fail',JSON.stringify(msg.chat_id));
		}
	});
	socket.on('leave',function(raw_msg){
		console.log('leave'+raw_msg);
		var msg = JSON.parse(raw_msg);
		if (msg.chat_id != '' && msg.chat_id != undefined){
			var index = users.indexOf(msg.chat_id);
			users.splice(index,1);
			socket.emit('someone_leaved',JSON.stringify(users));
			socket.broadcast.emit('someone_leaved',JSON.stringify(users));
			saveLog(socket,msg.chat_id,'leave');
		}
	});
	//클라이언트의 브라우저가 종료되어도 연결종료 처리 가능
	socket.on('disconnect',function(raw_msg){
		console.log('disconnection',raw_msg);
		subscriber.unsubscribe();
		subscriber.quit();
		publisher.quit();
	});
});
/*
io.sockets.on('close',function(socket){
	subscriber.unsubscribe();
	subscriber.close();
	publisher.close();
});*/
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
