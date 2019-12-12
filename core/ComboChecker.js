class ComboChecker {
    constructor(cardBox){
        this.cardBox = cardBox;
    }
    checkingCombo(currentPlayer, cardsData, lastCombo){
        console.log(this.cardBox);
        console.log(cardsData);
        console.log(lastCombo);


        //------------------------------------

        //Checking Own cards and Binding Data
        let cardsDataBinding = currentPlayer.cards.filter(e => {
            return cardsData.indexOf(e.id) !== -1;
        });

        if(cardsDataBinding.length !== cardsData.length){
            return false;
        }
        //------------------------------------


        //Binding Last Combo data
        let lastComboDataBinding = null;
        if(!lastCombo){
             lastComboDataBinding = this.cardBox.filter(e => {
                return cardsData.indexOf(e.id) !== -1;
            });
        }

        //------------------------------------

        //Validation checking
        let comboType = this.validationChecking(cardsDataBinding);





        return true;

    }

    static validationChecking(cardsObject){
        return 1;
    }
    // static isBiggerThanLastCombo(cardsData, lastCombo){
    //     if(!lastCombo){
    //         return true;
    //     }
    //     else{
    //         //compare now
    //     }
    // }
}

module.exports = ComboChecker;