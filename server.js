// added in initial build
const mongo = require('mongodb').MongoClient;  // https://github.com/mongodb/node-mongodb-native


// added in express build
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');

// added in passport build
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const session = require('express-session');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');


// connect to database with mongoose
mongoose.connect('mongodb://localhost/seng513db');
const db = mongoose.connection;

// Start the server
const listener = server.listen(process.env.PORT || 4000);
console.log('Server Running on port %s', listener.address().port)

// routes (to be changed to single page later)
const routes = require('./routes/index');
const users = require('./routes/users');

// View engine --> handlebars : allows to dynamically change HTML
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// bodyparser and cookie parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(cookieParser());

// Serve the Client
app.use(express.static(path.join(__dirname, '/public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        let namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

// use flash messages
app.use(flash());

// Global Variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null; // determines if user is logged in or not
    next();
});

app.use('/', routes);
app.use('/users', users); // change to be single page later

// // Set Port & start app server (Dont use app, use server already defined above)
// app.set('port', (process.env.PORT || 3000));
// app.listen(app.get('port'), function(){
//     console.log('Server started on port '+app.get('port'));
// });









// canvas' logic
const Jimp = require('jimp');
const fs = require('fs');
let rooms;
initializeRooms('public/rooms/rooms.json');

// io respond on client;s connection
io.on('connection', onConnection);

// Saves an object as a string into a file
function saveToFile(object, filePath){
    let json = JSON.stringify(object);
    fs.writeFile(filePath, json, 'utf8', function(){
        console.log('saved to file');
    })
}

// Resizes and generates a base64 encoding of an image
function encodingFromFile(filePath, callback){
    let file = filePath;
    Jimp.read(file, function(err, file) {
        if (err) throw err;
        file.resize(720, 480);
        file.getBase64(Jimp.AUTO, function(err, data) {
            if (err) throw err;
            callback(data);
        });
    });
}

// Loads pre-existing rooms from file into the local rooms variable
function initializeRooms(filePath){
    fs.readFile(filePath, function(err, data){
        if (err) throw err;
        try {
            rooms = JSON.parse(data);
        } catch (e) {
            rooms = [];
        }
        console.log('Rooms loaded...');
    });
}

function onConnection(socket){
    socket.on('makeRoom', function(data){
        if (rooms.findIndex(room => room.id === data.name) === -1){
            encodingFromFile(data.path, function(encoding){
                var newRoom = {
                    "id": data.name,
                    "encoding": encoding
                }
                rooms.push(newRoom);
                saveToFile(rooms, 'public/rooms/rooms.json');
                console.log('rooms: '+rooms.length);
            });
        }
    });

    socket.on('subscribe', function(data){
        var roomName = data;
        var index = rooms.findIndex(room => room.id === roomName);
        socket.join(roomName);
        console.log(socket.id + ' joined room: ' + data);
            io.to(socket.id).emit('history', rooms[index].encoding);
        socket.on('drawing', function(data){
            rooms[index].encoding = data.canvas;
            io.sockets.in(roomName).emit('drawing', data);
        });
    });
}



// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mydb', function(err, db) {
    if (err) {
        throw err;
    }

    console.log('Mongodb connected...');

    // Connect to socket.io
    io.on('connection', function(socket) {
        let chat = db.collection('chats');

        // Create function to send status
        sendStatus = function(s) {
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res) {
            if (err) {
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data) {
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if (name == '' || message == '') {
                // Send error status
                sendStatus('Please enter a name and message');
            }
            else {
                // Insert message
                chat.insert({name: name, message: message}, function() {
                    io.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // Handle clear
        socket.on('clear', function(data) {
            // Remove all chats from collection
            chat.remove({}, function() {
                // Emit cleared
                socket.emit('cleared');
            });
        });
    });
});
