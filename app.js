const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const socketHandler = require("./library/socketHandler");

const io = require("socket.io");
const port = process.env.PORT || 3000;
const socket = io(server);
var path = require('path');

let _socketHandler = new socketHandler(socket);
_socketHandler._bindSocketEvent();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

var homeRouter = require('./routes/index');
// var tienLenRouter = require('./routes/tienlen');
app.use('/', homeRouter);
// app.use('/home', homeRouter);
// app.use('/tien', tienLenRouter);
// app.use('/test1', require('./routes/play'));

server.listen(port, () =>{
    console.log("Connected to port: "+ port)
});