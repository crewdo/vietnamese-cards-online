class Player {
    constructor({userId, order, isHosted, userName, roomId}){
        this.userId = userId;
        this.cards = [];
        this.order = order;
        this.isHosted = isHosted;
        this.inRound = true;
        this.userName = userName;
    }

    play(cards){

    }
}
module.exports = Player;