// NOTE: The way the tutorial was coded these scripts must be run after the page is initally loaded, therefore mofing the file will cause the no not work.


(function () {
    // connect to server socket
    let socket = io();

    var element = function (id) {
        return document.getElementById(id);
    }

    // Get Elements
    //var status = element('status'); // original way... doesnt work anymore

    // var status = $('#status'); // jQuery way... doesn't work here
    // var messages = $('#messages');
    // var textarea = $('#textarea');
    // var username = $('#username');
    // var clearBtn = $('#clear');

    var status = element('status');
    var messages = element('messages');
    var textarea = element('textarea');
    var username = element('username');
    var clearBtn = element('clear');

    // Set default status
    var statusDefault = status.textContent;

    var setStatus = function (s) {
        // Set status
        status.textContent = s;

        if (s != statusDefault) {
            var delay = setTimeout(function () {
                setStatus(statusDefault);
            }, 4000);
        }
    }

    // Connect to socket.io
    //var socket = io.connect('http://127.0.0.1:4000');

    // Check for connection
    if (socket != undefined) {
        console.log('Connected to socket...');

        // Handle output
        socket.on('output', function (data) {
            //console.log(data);
            if (data.length) {
                for (var i = 0; i < data.length; i++) {
                    // Build out message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[i].name + ": " + data[i].message;
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }
        });

        // Get status from server
        socket.on('status', function (data) {
            // Get message status
            setStatus((typeof data == 'object') ? data.message : data);

            // If status is clear, clear text
            if (data.clear) {
                textarea.value = '';
            }
        });

        // Handle input
        textarea.addEventListener('keydown', function (event) {
            // Key code 13 is enter/return and no shift while pressing
            if (event.which == 13 && event.shiftKey == false) {
                // Emit to server input
                socket.emit('input', {
                    name: username.value,
                    message: textarea.value
                });
            }
        });

        // Handle chat clear
        clearBtn.addEventListener('click', function () {
            socket.emit('clear');
        });

        // Clear message
        socket.on('cleared', function () {
            messages.textContent = '';
        });
    }

})();