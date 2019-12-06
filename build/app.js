"use strict";

var _socketHandler = require("./library/socketHandler");

var express = require("express");
var app = express();
var server = require("http").Server(app);
var bodyParser = require("body-parser");
var playRouter = require("./routes/play");

// const socketHandler = require("./library/socketHandler");


var io = require("socket.io");
var port = 3000;
var socket = io(server);

var socketHandler = new _socketHandler.SocketHandler(socket);

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.use("/play", playRouter);

server.listen(port, function () {
    console.log("Connected to port: " + port);
});