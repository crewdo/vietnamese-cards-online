class ComboChecker {
    constructor(cardBox){
        this.cardBox = cardBox;
    }
    checkingCombo(cardsData, lastCombo){
        console.log(this.cardBox);
        console.log(cardsData);
        console.log(lastCombo);


        let cardsDataBind = this.cardBox.map(e => {
            // return e.id ==
        });



        return true;

    }
    static isBiggerThanLastCombo(cardsData, lastCombo){
        if(!lastCombo){
            return true;
        }
        else{
            //compare now
        }
    }
}

module.exports = ComboChecker;