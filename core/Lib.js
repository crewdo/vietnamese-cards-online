class Lib {
    static shuffleArray(array){
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static sortCards(array){
        array.sort(function(a, b) {
            return (a.worth * 10 + a.suit) - (b.worth * 10 + b.suit);
        });

        return array;
    }

    static findNextPlayer(arrayPlayerObject, currentPlayer){
        let i = arrayPlayerObject.indexOf(currentPlayer);
        if (i === -1) return undefined;
        return arrayPlayerObject[(i + 1) % arrayPlayerObject.length];
    }

    static checkOwnCards(player, cardsData){
        let cardFilter =  player.cards.filter(card => {
            return cardsData.indexOf(card.id) !== -1;
        });
        return cardsData.length === cardFilter.length
    }

}

module.exports = Lib;