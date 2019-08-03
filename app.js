const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const http = require('http').Server(app)
const io = require('socket.io')(http);

var users = new Map()

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.render('login.ejs', {message: ''});
});

app.post('/login', function(req, res){
    var username = req.body.username;
    if(!users.has(username)) {
        if(users.size < 3) {
            users.set(username, true);
            res.render('chatroom.ejs', {username: username});
        } else {
            res.render('login.ejs', {message: 'Chatroom is full right now. Please try again in a few minutes'});
        }       
    } else {      
        res.render('login.ejs', {message: 'Username taken, please choose a different one.'});
    }
});

io.sockets.on('connection', function(socket) {
    console.log('A user connected');
    socket.on('username', function(username) {
        console.log(username + ' is online');
        socket.username = username
        io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');       
    });
    
    socket.on('disconnect', function() {
        console.log(socket.username + ' has disconnected');
        io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
        users.delete(socket.username);
        for (let k of users.keys()) {
            console.log(k);
        }        
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });
});

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});

