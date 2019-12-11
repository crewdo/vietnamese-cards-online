class ComboChecker {
    constructor(cardBox){
        this.cardBox = cardBox;
    }
    checkingCombo(cardsData, lastCombo){
        console.log(cardsData);
        console.log(lastCombo);
        return true;

    }
    static isBiggerThanLastCombo(cardsData, lastCombo){
        if(!lastCombo){
            return true;
        }
        //Check comboType
        if(this.checkComboTypeAndNumberOfCards(cardsData, lastCombo)){

        }

        //Do compare

    }
}

module.exports = ComboChecker;