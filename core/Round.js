class Round {
    constructor() {
        this.playersInRound = [];
        this.lastCombo = [];
        this.currentPlayerTurn = null;
        this.firstTurnInRound = false;
        this.firstTurnInFirstRound = false;
        this.smallestCardId = null;
    }

    reset(){
        this.playersInRound = [];
        this.lastCombo = [];
        this.currentPlayerTurn = null;
        this.firstTurnInRound = false;
        this.firstTurnInFirstRound = false;

    }
}

module.exports = Round;