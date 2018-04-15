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
mongoose.connect('mongodb://localhost/seng513db', function (err, db) {
        if (err) {
            throw err;
        }
        console.log('Mongodb Chat connected...');
    });
const db = mongoose.connection;

// Start the server
const listener = server.listen(process.env.PORT || 4000);
console.log('Server Running on port %s', listener.address().port)

// routes (to be changed to single page later)
const routes = require('./routes/index');
const users = require('./routes/users');

// View engine --> handlebars : allows to dynamically change HTML
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// bodyparser and cookie parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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
    errorFormatter: function (param, msg, value) {
        let namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
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

// canvas' logic
const Jimp = require('jimp');
const fs = require('fs');
const Canvas = require('canvas-prebuilt');
const Image = Canvas.Image;

let rooms;
let whiteboards = [];

//loads existing rooms from rooms.json
initializeRooms('public/rooms/rooms.json');

// io respond on client's connection
io.on('connection', onConnection);

// Saves an object as a string into a file
function saveToFile(filePath, perpetuate) {
    for (i in rooms) {
        rooms[i].encoding = whiteboards[i].toDataURL();
    }
    let json = JSON.stringify(rooms);
    fs.writeFile(filePath, json, 'utf8', function () {
        console.log('saved to file');
    })
    if (perpetuate) setTimeout(saveToFile, 15000, 'public/rooms/rooms.json', true);
}

// Resizes and generates a base64 encoding of an image
function encodingFromFile(filePath, callback) {
    let file = filePath;
    Jimp.read(file, function (err, file) {
        if (err) throw err;
        file.resize(720, 480);
        file.getBase64(Jimp.AUTO, function (err, data) {
            if (err) throw err;
            callback(data);
        });
    });
}

// Loads pre-existing rooms from file into the local rooms variable
function initializeRooms(filePath) {
    fs.readFile(filePath, function (err, data) {
        if (err) throw err;
        try {
            rooms = JSON.parse(data);
        } catch (e) {
            rooms = [];
        }
        console.log('Rooms loaded...');
        //create an array of virtual canvases
        for (i in rooms) {
            whiteboards.push(new Canvas(720, 480));
            let ctx = whiteboards[i].getContext('2d');
            let img = new Image;
            img.src = rooms[i].encoding;
            ctx.drawImage(img, 0, 0);
        }
        console.log('Canvases initialized...');
        saveToFile('public/rooms/rooms.json', true);
    });
}

function onConnection(socket) {
	io.to(socket.id).emit('roomData', rooms);

    socket.on('makeRoom', function (data) {
        if (rooms.findIndex(room => room.id === data.name) === -1) {
            encodingFromFile(data.path, function (encoding) {
                var newRoom = {
                    "id": data.name,
                    "encoding": encoding
                }
                rooms.push(newRoom);
                console.log('rooms: ' + rooms.length);
                //create a new virtual canvas for the new room
                whiteboards.push(new Canvas(720, 480));
                let ctx = whiteboards[whiteboards.length - 1].getContext('2d');
                let img = new Image;
                img.src = rooms[whiteboards.length - 1].encoding;
                ctx.drawImage(img, 0, 0);
                saveToFile('public/rooms/rooms.json', false);
                io.emit('roomData', rooms);
            });
        }
    });

	socket.on('getCanvas',function(listOfRooms){
		let listOfHistory = [];
		listOfRooms.forEach(function(roomName){
			//console.log(listOfRooms);
			let index = rooms.findIndex(room => room.id === roomName);
			rooms[index].encoding = whiteboards[index].toDataURL();
			listOfHistory.push({
				name : roomName,
				encoding : rooms[index].encoding
			});

		});
		socket.emit('canvasFromServer',listOfHistory);
	});

    socket.on('subscribe', function (data) {
        var roomName = data;
        var index = rooms.findIndex(room => room.id === roomName);
        socket.join(roomName);
        console.log(socket.id + ' joined room: ' + data);

        let chat = db.collection(roomName);
        console.log("Chat connected to room: " + roomName);

        rooms[index].encoding = whiteboards[index].toDataURL();
        io.to(socket.id).emit('history', rooms[index].encoding);
        socket.on('drawing', function (data) {
            //draw on the virtual canvas
            let ctx = whiteboards[index].getContext('2d');
            ctx.beginPath();
			ctx.globalCompositeOperation="source-over";
			ctx.moveTo(data.x0 * whiteboards[index].width, data.y0 * whiteboards[index].height);
			ctx.lineTo(data.x1 * whiteboards[index].width, data.y1 * whiteboards[index].height);
			ctx.strokeStyle = data.color;
			ctx.lineWidth = data.thickness;
			ctx.stroke();
            ctx.closePath();
            //emit to the rest of the room
            io.sockets.in(roomName).emit('drawing', data);
			io.emit('multiDrawing', {
				name: roomName,
				canvasData: data
			});
        });
        socket.on('clrCanvas', function (data) {
            //clear the virtual canvas
            let ctx = whiteboards[index].getContext('2d');
            ctx.clearRect(0, 0, whiteboards[index].width, whiteboards[index].height);
            //emit to the rest of the room
            io.sockets.in(roomName).emit('clearCanvas', data.canvas);
        });

        sendStatus = function (s) {
            socket.emit('status', s);
        }

        chat.find({}).toArray(function(err,res){
			if (err) {
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);

		});

        // CHAT SOCKET EVENTS
        // Handle input events
        socket.on('input', function (data) {
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if (name == '' || message == '') {
                // Send error status
                sendStatus('Please enter a name and message');
            }
            else {
                // Insert message
                chat.insert({ name: name, message: message }, function () {
                    io.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });
            }
        });

        // // Handle clear
        // socket.on('clear', function (data) {
        //     // Remove all chats from collection
        //     chat.remove({}, function () {
        //         // Emit cleared
        //         socket.emit('cleared');
        //     });
        // });
    });
}
