const game = require("../core/Game");
const player = require("../core/Player");
const singleCard = require("../core/Card");
const lib = require("../core/Lib.js");
const round = require("../core/Round");
const comboChecker = require("../core/ComboChecker");

class SocketHandler {
    constructor(socketMain) {
        this.socket = null;
        this.socketMain = socketMain;

        this.players = [];
        this.game = new game();

        this.cardBox = [];
        this.round = new round();
        this.initCardBox();

    }

    _bindSocketEvent() {
        let self = this;
        this.socketMain.on("connection", function (socket) {
            self.emitRoomMembers();
            socket.on('disconnect', () => {
                self.socket = socket;
                self.players = self.players.filter(e => {
                    return e.userId !== socket.id;
                });
                if (self.players.length > 0) {
                    self.players[0].isHosted = 1;
                    self.emitStartBtn(self.players[0].userId);
                } else {
                    self.game.state = 0;
                }
                self.emitRoomMembers();
                socket.disconnect();
            });
            socket.on("ready", (message) => {
                self.socket = socket;
                self.handleReadyRequest(message)
            });

            socket.on("start-game", (message) => {
                console.log(message);
                self.startGame();
            });

            socket.on("force-end-game", (message) => {
                console.log(message);
                self.game.state = 0;
                self.game.playersWin = [];
                self.round.reset()
            });

            socket.on("sort-cards", (message) => {
                let currentPlayer = self.getCurrentUser(socket.id);
                if (currentPlayer.cards.length > 0) {
                    currentPlayer.cards = lib.sortCards(currentPlayer.cards);
                }

                self.socketMain.to(`${socket.id}`).emit("card-sorted", {info: currentPlayer});
            });

            socket.on("play", (cardsData) => {
                console.log(cardsData);
                let currentPlayer = self.getCurrentUser(socket.id);
                if (currentPlayer === self.round.turnAssignee && self.players.length > 1 && currentPlayer.cards.length > 0) {

                    let ownCards = currentPlayer.cards.filter(e => {
                        return e.id.indexOf(cardsData) !== -1;
                    });

                    if(ownCards.length !== cardsData.length){
                        this.socketMain.to(`${socket.id}`).emit("not-own-cards");
                        return false;
                    }

                    if (self.round.firstTurnInFirstRound && self.game.lastWinner === null) {
                        let smallestCardChecking = cardsData.some(e => {
                            return e === self.round.smallestCardId;
                        });

                        if (smallestCardChecking) {
                            self.play(socket.id, cardsData, currentPlayer);
                            self.round.firstTurnInFirstRound = false;
                        } else {
                            self.socketMain.to(`${socket.id}`).emit("you-need-to-play-smallest-card");
                        }
                    } else {
                        self.play(socket.id, cardsData, currentPlayer);
                    }
                } else {
                    self.socketMain.to(`${socket.id}`).emit("not-your-turn");
                }

            });

            socket.on('pass', message => {
                console.log('Passing!');
                let currentPlayer = self.getCurrentUser(socket.id);
                if (currentPlayer === self.round.turnAssignee && self.players.length > 1) {
                    self.passed(currentPlayer, socket.id);
                } else {
                    self.socketMain.to(`${socket.id}`).emit("not-your-turn");
                }
            });

        });
    }

    play(socketId, cardsData, currentPlayer) {
        if (currentPlayer === this.round.keyKeeper) {
            this.round.lastCombo = null;
            this.players = this.players.map(e => {
                e.inRound = true;
                return e;
            });
        }

        if (this.comboChecker.checkingCombo(cardsData, this.round.lastCombo)) {
            currentPlayer.cards = currentPlayer.cards.filter(e => {
                return cardsData.indexOf(e.id) === -1;
            });

            this.round.lastCombo = cardsData;
            this.socketMain.emit("turn-passed-as-play", cardsData);
            this.socketMain.to(`${socketId}`).emit("remaining-cards", {info: currentPlayer});

            currentPlayer.inRound = true;
            this.round.keyKeeper = currentPlayer;

            if (currentPlayer.cards.length === 0) {
                if (this.game.playersWin.length === 0) {
                    this.game.lastWinner = currentPlayer;
                }
                this.game.playersWin.push(currentPlayer);
                this.socketMain.to(`${currentPlayer.userId}`).emit("you-win");
                this.round.prioritier = lib.findNextPlayer(this.players, currentPlayer);
                this.next();
                this.players = this.players.filter(e => {
                    return e.userId !== socketId;
                });

            } else {
                this.next();
            }

        } else {
            this.socketMain.to(`${socketId}`).emit("invalid-combo");
        }
    }

    next() {
        //find next inRound player
        let nextPlayer = this.findNextInRound();
        this.round.turnAssignee = nextPlayer;
        this.socketMain.to(`${nextPlayer.userId}`).emit("your-turn");

    }

    findNextInRound() {
        let next = lib.findNextPlayer(this.players, this.round.turnAssignee);
        while (!next.inRound) {
            next = lib.findNextPlayer(this.players, next);
        }
        return next;
    }

    passed(currentPlayer, socketId) {

        if (currentPlayer === this.round.keyKeeper) {
            this.socketMain.to(`${socketId}`).emit("your-turn-can-not-pass");
        } else {

            let nextPlayer = null;
            currentPlayer.inRound = false;

            let inRoundChecking = this.players.some(e => {
                return e.inRound;
            });

            if (inRoundChecking) {
                nextPlayer = this.findNextInRound();
            } else {
                nextPlayer = this.round.prioritier;
                this.round.keyKeeper = nextPlayer;
            }

            this.socketMain.to(`${socketId}`).emit("turn-passed-as-pass");
            this.round.turnAssignee = nextPlayer;
            this.socketMain.to(`${nextPlayer.userId}`).emit("your-turn");

        }


    }


    getCurrentUser(socketId) {
        return this.players.filter(player => {
            return player.userId === socketId;
        })[0];
    }

    handleReadyRequest(message) {
        console.log(message);
        let accepted = this.players;
        let isJoined = accepted.some(e => {
            return e.userId === this.socket.id
        });
        if (!isJoined && this.game.state === 0) {
            if (accepted.length === 0) {
                this.players.push(new player({userId: this.socket.id, order: 0, isHosted: 1}));
                this.emitStartBtn(this.socket.id);
            } else if (accepted.length < 4) {
                this.players.push(new player({userId: this.socket.id, order: accepted.length, isHosted: 0}));
            }
            this.emitRoomMembers();
        }

    };

    emitStartBtn(socketId) {
        if (this.game.state === 0) {
            this.socketMain.to(`${socketId}`).emit("start-btn-bind", {status: 'success'});
        }
    };

    emitRoomMembers() {
        if (this.game.state === 0) {
            this.socketMain.emit("room-members", {users: this.players});
        }
    };


    startGame() {
        let memCount = this.players.length;
        if (memCount > 1 && memCount < 5 && this.game.state === 0) {
            let divideFour = [[], [], [], []];
            this.cardBox = lib.shuffleArray(this.cardBox);
            this.cardBox.map(function (e, i, a) {
                divideFour[i % 4].push(e);
            });

            let self = this;
            this.players.map(function (e, i, a) {
                e.cards = divideFour[i];
                self.socketMain.to(`${e.userId}`).emit("card-result", {info: e});
            });

            this.game.state = 1;
            this.checkAndInitFirstRound();
        }

    }

    checkAndInitFirstRound() {
        this.round.reset();
        this.round.playersInRound = this.players;
        if (this.game.lastWinner) {
            this.round.turnAssignee = this.game.lastWinner;
        } else {
            let cardId = 0; //3 Shade
            while (this.round.turnAssignee === null) {
                var filterThreeShade = this.players.filter(e => {
                    return e.cards.some(e => {
                        return e.id === cardId;
                    })
                });
                if (filterThreeShade.length > 0) {
                    this.round.smallestCardId = cardId;
                    this.round.turnAssignee = filterThreeShade[0];
                }
                cardId++;
            }
        }
        this.round.firstTurnInFirstRound = true;
        this.socketMain.to(`${this.round.turnAssignee.userId}`).emit("your-first-turn-in-first-round");
    }

    initCardBox() {
        [3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A', 2].map((e, i, a) => {
            this.cardBox.push(new singleCard({id: i * 4, name: e + 'S', worth: i + 3, suit: 0}));
            this.cardBox.push(new singleCard({id: i * 4 + 1, name: e + 'C', worth: i + 3, suit: 1}));
            this.cardBox.push(new singleCard({id: i * 4 + 2, name: e + 'D', worth: i + 3, suit: 2}));
            this.cardBox.push(new singleCard({id: i * 4 + 3, name: e + 'H', worth: i + 3, suit: 3}));
        });

        this.comboChecker = new comboChecker(this.cardBox);
    }
}

module.exports = SocketHandler;
