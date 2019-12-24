const room = require("../core/Room");
const lib = require("../core/Lib.js");

class SocketHandler {
    constructor(socketMain) {
        this.socketMain = socketMain;
        this.roomList = {};
    }

    _bindSocketEvent() {
        let self = this;

        this.socketMain.on("connection", function (socket) {
            socket.on('has-just-come', function() {
                socket.emit('rooms', self.filterDefaultRoom(self.roomList));
            });

            socket.on('room-created', (userNameGlobal, callback) => {
                if(Object.keys(socket.rooms).length === 1) {
                    let roomId = 'roomID::' + Math.random().toString(36).substring(2);
                    socket.join(roomId);
                    callback(roomId);

                    self.roomList[roomId] = new room(self.socketMain, roomId);
                    self.roomList[roomId].handleReadyRequest(userNameGlobal, socket.id);

                    self.socketMain.emit('rooms', self.filterDefaultRoom(self.roomList));
                }
            });

            socket.on('disconnecting', function(){
                var rooms = socket.rooms;
                var socketInRoom = self.getCurrentRoomId(rooms);
                if(socketInRoom && self.checkingRoomExisting(socketInRoom)){
                        let oldPlayersCount = self.roomList[socketInRoom].players.length;
                        self.roomList[socketInRoom].players = self.roomList[socketInRoom].players.filter(e => {
                            return e.userId !== socket.id;
                        });
                        let newPlayerCount = self.roomList[socketInRoom].players.length;

                        if(newPlayerCount < oldPlayersCount){
                            self.roomList[socketInRoom].game.lastWinner = null;
                        }

                        self.roomList[socketInRoom].emitRoomMembers();

                        if (self.roomList[socketInRoom].players.length > 0) {
                            self.roomList[socketInRoom].players[0].isHosted = 1;
                            if(self.roomList[socketInRoom].game.state === 0){
                                self.roomList[socketInRoom].emitStartBtn(self.roomList[socketInRoom].players[0].userId);
                            }

                        } else {
                            delete self.roomList[socketInRoom];
                        }
                    }

            });

            socket.on('join-a-room', (roomId, userNameGlobal, callback)=> {
                if(typeof socket.adapter.rooms[roomId] !== "undefined" && typeof self.roomList[roomId] !== "undefined" && socket.adapter.rooms[roomId].length < 4){
                    if(Object.keys(socket.rooms).length === 1){
                        if(self.roomList[roomId].game.state === 0){
                            socket.join(roomId);
                            callback('This message from server');
                            self.roomList[roomId].handleReadyRequest(userNameGlobal, socket.id);

                            self.socketMain.emit('rooms', self.filterDefaultRoom(self.roomList));
                        }
                        else{
                            self.socketMain.to(`${socket.id}`).emit("the-game-is-playing");
                        }
                    }
                }

            });

            socket.on('disconnect', () => {
                self.socketMain.emit('rooms', self.filterDefaultRoom(self.roomList));
                socket.disconnect();
            });
            socket.on("start-game", (roomId) => {
                if(self.checkingRoomExisting(roomId)){
                    let host = self.roomList[roomId].getCurrentUser(socket.id);
                    if(typeof host !== "undefined"){
                        if(host.isHosted && self.roomList[roomId].players.length >= 2 ){
                            self.roomList[roomId].startGame();
                        }
                        else{
                            self.socketMain.to(`${socket.id}`).emit("not-enough-player");
                        }
                    }
                }

            });

            socket.on("sort-cards", (roomId) => {
                if(self.checkingRoomExisting(roomId)) {
                    let currentPlayer = self.roomList[roomId].getCurrentUser(socket.id);
                    if (currentPlayer.cards.length > 0) {
                        currentPlayer.cards = lib.sortCards(currentPlayer.cards);
                    }

                    self.socketMain.to(`${socket.id}`).emit("card-sorted", {info: currentPlayer});
                }
            });

            socket.on("play", (roomId, cardsData) => {
                if(self.checkingRoomExisting(roomId)) {
                    let currentPlayer = self.roomList[roomId].getCurrentUser(socket.id);
                    if (currentPlayer === self.roomList[roomId].round.turnAssignee && self.roomList[roomId].players.length > 1 && currentPlayer.cards.length > 0) {
                        if (self.roomList[roomId].round.firstTurnInFirstRound && self.roomList[roomId].game.lastWinner === null) {
                            let smallestCardChecking = cardsData.some(e => {
                                return e === self.roomList[roomId].round.smallestCardId;
                            });

                            if (smallestCardChecking) {
                                if (self.roomList[roomId].play(socket.id, cardsData, currentPlayer)) {
                                }
                            } else {
                                self.socketMain.to(`${socket.id}`).emit("you-need-to-play-smallest-card");
                            }
                        } else {
                            self.roomList[roomId].play(socket.id, cardsData, currentPlayer);
                        }
                    } else {
                        self.socketMain.to(`${socket.id}`).emit("not-your-turn");
                    }
                }

            });

            socket.on('pass', roomId => {
                if(self.checkingRoomExisting(roomId)) {
                    let currentPlayer = self.roomList[roomId].getCurrentUser(socket.id);
                    if (currentPlayer === self.roomList[roomId].round.turnAssignee && self.roomList[roomId].players.length > 1 && !self.roomList[roomId].round.firstTurnInFirstRound) {
                        self.roomList[roomId].passed(currentPlayer, socket.id);
                    } else {
                        self.socketMain.to(`${socket.id}`).emit("not-your-turn");
                    }
                }
            });

        });
    }

    checkingRoomExisting(roomId){
        return typeof this.roomList[roomId] !== "undefined";
    }

    filterDefaultRoom(allRooms) {
        return Object.keys(allRooms).filter(key => key.indexOf('roomID::') !== -1)
            .reduce((obj, key) => { obj[key] = {length: allRooms[key].players.length}; return obj; }, {});
    }

    getCurrentRoomId(playerRooms) {
        let currentRoomObject = Object.keys(playerRooms).filter(key => key.indexOf('roomID::') !== -1);
        if(currentRoomObject.length > 0) return currentRoomObject[0];
        return false;
    }

}

module.exports = SocketHandler;
