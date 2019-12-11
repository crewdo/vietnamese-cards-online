class Round {
    constructor() {
        this.lastCombo = [];
        this.currentPlayerTurn = null;
        this.firstTurnInRound = false;
        this.firstTurnInFirstRound = false;
        this.smallestCardId = null;
    }

    reset(){
        this.lastCombo = [];
        this.currentPlayerTurn = null;
        this.firstTurnInRound = false;
        this.firstTurnInFirstRound = false;

    }
}

module.exports = Round;