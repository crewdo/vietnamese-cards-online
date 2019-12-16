const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const playRouter = require("./routes/play");

const socketHandler = require("./library/socketHandler");

const io = require("socket.io");
const port = 80;
const socket = io(server);

let _socketHandler = new socketHandler(socket);
_socketHandler._bindSocketEvent();


app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));

app.use("/play", playRouter);

server.listen(port, () =>{
    console.log("Connected to port: "+ port)
});