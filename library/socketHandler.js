const game = require("../core/Game");
const player = require("../core/Player");
const singleCard = require("../core/Card");
const lib = require("../core/Lib.js");
const round = require("../core/Round");
const comboChecker = require("../core/ComboChecker");

class SocketHandler {
    constructor(socketMain){
        this.socket = null;
        this.socketMain = socketMain;

        this.players = [];
        this.game = new game();

        this.cardBox = [];
        this.round = new round();
        this.initCardBox();

    }

    _bindSocketEvent(){
        let _this = this;
        this.socketMain.on("connection", function (socket) {
            _this.emitRoomMembers();
            socket.on('disconnect', () => {
                _this.socket = socket;
                _this.players = _this.players.filter(e => {
                    return e.userId !== socket.id;
                });
                if(_this.players.length > 0){
                    _this.players[0].isHosted = 1;
                    _this.emitStartBtn( _this.players[0].userId);
                }
                else{
                    _this.game.state = 0;
                }
                _this.emitRoomMembers();
                socket.disconnect();
            });
            socket.on("ready", (message) =>{
                _this.socket = socket;
                _this.handleReadyRequest(message)
            });

            socket.on("start-game", (message) =>{
                console.log(message);
                _this.startGame();
            });

            socket.on("force-end-game", (message) =>{
                console.log(message);
                _this.game.state = 0;
            });

            socket.on("force-end-hack", (message) =>{
                _this.game.state = 0;
                _this.players = [];
            });

            socket.on("sort-cards", (message) =>{
                let playerObj = _this.getCurrentUser(socket.id);
                if(playerObj.cards.length > 0){
                    playerObj.cards = lib.sortCards(playerObj.cards);
                }

                _this.socketMain.to(`${socket.id}`).emit("card-sorted", {info: playerObj});
            });

            socket.on("play", (cardsData) =>{
                console.log(cardsData);
                let playerObj = _this.getCurrentUser(socket.id);
                if(playerObj === _this.round.currentPlayerTurn && _this.players.length > 1){
                    if(_this.round.firstTurnInFirstRound && _this.game.lastWinner === null){
                        let smallestCardChecking = cardsData.some(e => {
                            return e === _this.round.smallestCardId;
                        });

                        if(smallestCardChecking){
                            _this.play(socket.id, cardsData);
                        }
                        else {
                            _this.socketMain.to(`${socket.id}`).emit("you-need-to-play-smallest-card");
                        }
                        _this.round.firstTurnInFirstRound = false;

                    }
                    else {
                        _this.play(socket.id, cardsData);
                    }
                }
                else {
                    _this.socketMain.to(`${socket.id}`).emit("not-your-turn");
                }


            });

            socket.on('pass', message => {
                console.log('Passing!');
                let playerObj = _this.getCurrentUser(socket.id);
                if(playerObj === _this.round.currentPlayerTurn && _this.players.length > 1){
                    if(!_this.round.firstTurnInRound){
                    _this.round.currentPlayerTurn.inRound = false;
                    _this.next();
                    _this.socketMain.to(`${socket.id}`).emit("turn-passed-as-pass");
                    }
                    else{
                        _this.socketMain.to(`${socket.id}`).emit("your-turn-can-not-pass");
                    }
                }
                else {
                    _this.socketMain.to(`${socket.id}`).emit("not-your-turn");
                }
            });

        });
    }

    play(socketId, cardsData){
        let currentPlayer = this.getCurrentUser(socketId);
        if(this.comboChecker.checkingCombo(cardsData,  this.round.lastCombo)){
            currentPlayer.cards = currentPlayer.cards.filter(e => {
                return cardsData.indexOf(e.id) === -1;
            });
            this.round.lastCombo = cardsData;
            this.socketMain.emit("turn-passed-as-play", cardsData);

            this.next();

            this.socketMain.to(`${socketId}`).emit("remaining-cards", {info: currentPlayer});
        }
        else {
            this.socketMain.to(`${socketId}`).emit("invalid-combo");
        }
    }

    next(){
            let next =  lib.findNextPlayer(this.players, this.round.currentPlayerTurn);
            while(!next.inRound || next.won){
                next = lib.findNextPlayer(this.players, next);
            }
            if(this.round.currentPlayerTurn === next){
                this.round.currentPlayerTurn = next;
                this.round.firstTurnInRound = true;
                this.players = this.players.map(e => {
                    e.inRound = true;
                    return e;
                });

                if(next.cards.length === 0){
                    if(this.game.playersWin.length === 0){
                        this.game.lastWinner = next;
                    }
                    this.game.playersWin.push(next);
                    next.won = true;

                    this.socketMain.to(`${next.userId}`).emit("you-win");
                    this.next();

                }
                else{
                    this.socketMain.to(`${this.round.currentPlayerTurn.userId}`).emit("your-turn");
                    this.round.lastCombo = null;
                }


            }
            else{
                this.round.currentPlayerTurn = next;
                this.socketMain.to(`${next.userId}`).emit("your-turn");
                this.round.firstTurnInRound = false;
            }
    }

    getCurrentUser(socketId){
        return this.players.filter(player => {
            return player.userId === socketId;
        })[0];
    }

    handleReadyRequest(message){
        console.log(message);
        let accepted = this.players;
        let isJoined = accepted.some( e =>  {
            return e.userId === this.socket.id
        });
        if(!isJoined && this.game.state === 0){
            if (accepted.length === 0) {
                this.players.push(new player({userId: this.socket.id, order: 0,  isHosted : 1}));
                this.emitStartBtn(this.socket.id);
            }
            else if(accepted.length < 4){
                this.players.push(new player({userId: this.socket.id, order : accepted.length, isHosted : 0}));
            }
            this.emitRoomMembers();
        }

    };

    emitStartBtn(socketId){
        if(this.game.state === 0) {
            this.socketMain.to(`${socketId}`).emit("start-btn-bind", {status: 'success'});
        }
    };

    emitRoomMembers(){
        if(this.game.state === 0){
            this.socketMain.emit("room-members", { users: this.players });
        }
    };


    startGame(){
        let memCount = this.players.length;
        if(memCount > 1 && memCount < 5 && this.game.state === 0){
            let divideFour = [[], [], [], []];
            this.cardBox = lib.shuffleArray(this.cardBox);
            this.cardBox.map(function (e, i, a) {
                divideFour[i % 4].push(e);
            });

            let _this = this;
            this.players.map(function (e, i, a) {
               e.cards = divideFour[i];
                _this.socketMain.to(`${e.userId}`).emit("card-result", { info: e});
            });

            this.game.state = 1;
            this.checkAndInitFirstRound();
        }

    }

    checkAndInitFirstRound(){
        this.round.reset();
        this.round.playersInRound = this.players;
        if(this.game.lastWinner){
            this.round.currentPlayerTurn = this.game.lastWinner;
        }
        else{
            let cardId = 0; //3 Shade
            while (this.round.currentPlayerTurn === null){
                var filterThreeShade = this.players.filter(e => {
                    return e.cards.some(e => {
                        return e.id === cardId;
                    })
                });
                if(filterThreeShade.length > 0){
                    this.round.smallestCardId = cardId;
                    this.round.currentPlayerTurn = filterThreeShade[0];
                }
                cardId++;
            }
        }
        this.round.firstTurnInFirstRound = true;
        this.socketMain.to(`${this.round.currentPlayerTurn.userId}`).emit("your-first-turn-in-first-round");
    }

    initCardBox(){
        [3,4,5,6,7,8,9,10,'J','Q','K','A',2].map((e, i, a) => {
            this.cardBox.push(new singleCard({id: i * 4, name: e + 'S', worth: i+3, suit: 0}));
            this.cardBox.push(new singleCard({id: i * 4 + 1,name: e + 'C', worth: i+3, suit: 1}));
            this.cardBox.push(new singleCard({id: i * 4 + 2,name: e + 'D', worth: i+3, suit: 2}));
            this.cardBox.push(new singleCard({id: i * 4 + 3,name: e + 'H', worth: i+3, suit: 3}));
        });

        this.comboChecker = new comboChecker(this.cardBox);
    }
}

module.exports = SocketHandler;
