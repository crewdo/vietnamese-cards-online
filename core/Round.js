class Round {
    constructor() {
        this.lastCombo = [];
        this.turnAssignee = null;
        this.firstTurnInFirstRound = false;
        this.smallestCardId = null;
        this.keyKeeper = null;
        this.prioritier = null;

    }

    reset(){
        this.lastCombo = [];
        this.turnAssignee = null;
        this.firstTurnInFirstRound = false;
        this.prioritier = null;
        this.keyKeeper = null;
        this.smallestCardId = null;


    }
}

module.exports = Round;