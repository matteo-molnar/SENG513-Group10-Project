'use strict';

let debug = false;
var socket = io();
var checkedList = [];

function setIntent(roomName) {
    io.intent = roomName;
    console.log('intent set: ' + io.intent);
}

function joinRoom(roomName) {
    socket.emit('subscribe', roomName);
}