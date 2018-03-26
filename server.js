const mongo = require('mongodb').MongoClient;  // https://github.com/mongodb/node-mongodb-native
//const io = require('socket.io').listen(4000).sockets;  // https://github.com/socketio/socket.io



const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const path = require('path');

// Start the server
const listener = server.listen(process.env.PORT || 4000);
console.log('Server Running on port %s', listener.address().port)


// Serve the Client
app.use(express.static(path.join(__dirname, '/public')));


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
