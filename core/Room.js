const game = require("../core/Game");
const player = require("../core/Player");
const lib = require("../core/Lib.js");
const singleCard = require("../core/Card");
const round = require("../core/Round");
const comboChecker = require("../core/ComboChecker");

class Room{
 constructor(socketGlobal, roomId){
     this.players = [];
     this.game = new game();
     this.cardBox = [];
     this.round = new round();
     this.initCardBox();
     this.socketMain = socketGlobal;
     this.roomId = roomId;
 }

    play(socketId, cardsData, currentPlayer) {
        if (currentPlayer === this.round.keyKeeper) {
            this.round.lastCombo = [];
            this.players = this.players.map(e => {
                e.inRound = true;
                return e;
            });
            this.socketMain.to(`${this.roomId}`).emit("new-round");
        }

        if (this.comboChecker.checkingCombo(currentPlayer, cardsData, this.round.lastCombo)) {
            currentPlayer.cards = currentPlayer.cards.filter(e => {
                return cardsData.indexOf(e.id) === -1;
            });

            if((this.comboChecker.twoChecking(this.round.lastCombo) && !this.comboChecker.twoChecking(cardsData))  || this.round.lastCombo.length > 5){
                this.socketMain.to(`${this.roomId}`).emit("kill-two");
            }
            this.round.lastCombo = cardsData;
            this.socketMain.to(`${this.roomId}`).emit("turn-passed-as-play", cardsData);
            this.socketMain.to(`${socketId}`).emit("remaining-cards", {info: currentPlayer});

            currentPlayer.inRound = true;
            this.round.keyKeeper = currentPlayer;
            this.round.firstTurnInFirstRound = false;

            if (currentPlayer.cards.length === 0) {
                if (this.game.playersWin.length === 0) {
                    this.game.lastWinner = currentPlayer;
                }
                this.game.playersWin.push(currentPlayer);
                this.socketMain.to(`${this.roomId}`).emit("you-win", currentPlayer);

                this.round.prioritier = lib.findNextPlayer(this.players, currentPlayer);
                this.next();
                this.players = this.players.filter(e => {
                    return e.userId !== socketId;
                });

                if(this.players.length === 1){
                    this.players[0].cards = [];
                    this.game.playersWin.push(this.players[0]);
                    this.restart();
                }

            } else {
                this.next();
            }
            return true;
        } else {
            this.socketMain.to(`${socketId}`).emit("invalid-combo");
            return false;
        }
    }

    next() {
        //find next inRound player
        let nextPlayer = this.findNextInRound();
        this.round.turnAssignee = nextPlayer;
        this.socketMain.to(`${nextPlayer.userId}`).emit("your-turn");
        this.socketMain.to(`${this.roomId}`).emit("next-player-turn", nextPlayer.order);

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
            this.socketMain.to(`${this.roomId}`).emit("turn-passed-as-pass-global", currentPlayer.order);
            this.round.turnAssignee = nextPlayer;
            this.socketMain.to(`${nextPlayer.userId}`).emit("your-turn");
            this.socketMain.to(`${this.roomId}`).emit("next-player-turn", nextPlayer.order);


        }
    }

    getCurrentUser(socketId) {
        let currentPlayer = this.players.filter(player => {
            return player.userId === socketId;
        })[0];
        if(typeof currentPlayer !== "undefined") {
            return currentPlayer;
        }
        return false;

    }

    restart(){
        this.players = this.game.playersWin;
        this.game.state = 0;
        this.game.playersWin = [];
        this.round.reset();
        this.players = this.players.map(e => {
            e.inRound = true;
            return e;
        });

        this.players =  this.players.sort((a, b) =>{
            return a.order - b.order;
        });

        this.socketMain.to(`${this.roomId}`).emit("game-end", this.game.playersWin);
        let hostedUserId = this.players.filter(e => e.isHosted === 1);
        if(hostedUserId.length > 0){
            this.socketMain.to(`${hostedUserId[0].userId}`).emit("start-btn-bind", {status: 'success'});
        }

    }

    handleReadyRequest(userName, socketId) {
        let accepted = this.players;
        let isJoined = accepted.some(e => {
            return e.userId === socketId
        });
        if (!isJoined && this.game.state === 0) {
            if(userName == null){
                userName = "Player " + accepted.length;
            }
            if (accepted.length === 0) {
                this.players.push(new player({userId: socketId, order: 0, isHosted: 1, userName: userName}));
                this.emitStartBtn(socketId);
                if (this.game.state === 0) {
                    this.socketMain.to(`${socketId}`).emit("you-come-in", {newOrder: 0, comeInPlayer: this.players[0]});
                }

            } else if (accepted.length < 4) {
                this.players.push(new player({userId: socketId, order: accepted.length, isHosted: 0, userName: userName}));
                if (this.game.state === 0) {
                    this.socketMain.to(`${socketId}`).emit("you-come-in", {newOrder: this.players.length - 1, comeInPlayer: this.players[this.players.length - 1]});
                }
            }
            this.emitRoomMembers();
        }
        else{
            this.socketMain.to(`${socketId}`).emit("the-game-is-busy");
        }

    };

    emitStartBtn(socketId) {
        if (this.game.state === 0) {
            this.socketMain.to(`${socketId}`).emit("start-btn-bind", {status: 'success'});
        }
    };

    emitRoomMembers() {
        if (this.game.state === 0) {
            this.socketMain.to(`${this.roomId}`).emit("room-members", {users: this.players});
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

        this.comboChecker = new comboChecker();
    }
}
module.exports = Room;