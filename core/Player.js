class Player {
    constructor({userId, order, isHosted}){
        this.userId = userId;
        this.cards = [];
        this.order = order;
        this.isHosted = isHosted;
        this.inRound = true;
        this.won = false;
    }

    play(cards){

    }
}
module.exports = Player;