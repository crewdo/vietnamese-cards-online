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
            console.log('connected');
            socket.on('has-just-come', function() {
                socket.emit('rooms', socket.adapter.rooms);
            });

            socket.on('room-created', (userNameGlobal, roomId, callback) => {
                socket.join(roomId);
                self.socketMain.emit('rooms', socket.adapter.rooms);
                callback(roomId);
                self.roomList[roomId] = new room(self.socketMain, roomId);
                self.roomList[roomId].handleReadyRequest(userNameGlobal, socket.id)
            });
            //

            socket.on('join-a-room', (roomId, userNameGlobal, callback)=> {
                if(typeof socket.adapter.rooms[roomId] !== "undefined" && typeof self.roomList[roomId] !== "undefined" && socket.adapter.rooms[roomId].length < 4){
                    socket.join(roomId);
                    callback('this message from server');
                    self.socketMain.emit('rooms', socket.adapter.rooms);
                    self.roomList[roomId].handleReadyRequest(userNameGlobal, socket.id)
                }


            });


            socket.on('disconnect', () => {
                self.socketMain.emit('rooms', socket.adapter.rooms);
                //
                // console.log('dis');
                //
                // let oldPlayersCount = self.players.length;
                // self.players = self.players.filter(e => {
                //     return e.userId !== socket.id;
                // });
                // let newPlayerCount = self.players.length;
                //
                // if(newPlayerCount < oldPlayersCount){
                //     self.game.lastWinner = null;
                // }
                //
                // if (self.players.length > 0) {
                //     self.players[0].isHosted = 1;
                //     if(self.game.state === 0){
                //         self.emitStartBtn(self.players[0].userId);
                //     }
                // } else {
                //     self.game.playersWin = [];
                //     self.restart();
                // }
                // self.emitRoomMembers();
                socket.disconnect();
            });
            socket.on("start-game", (roomId) => {
                if(self.checkingRoomExisting(roomId)){
                    let host = self.roomList[roomId].getCurrentUser(socket.id);
                    if(typeof host !== "undefined"){
                        if(host.isHosted && self.roomList[roomId].players.length >= 2 ){
                            self.roomList[roomId].startGame();
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

}

module.exports = SocketHandler;
