const lib = require("../core/Lib.js");
const singleCard = require("../core/Card");

class ComboChecker {
    constructor(cardBox) {
        this.theFullBox = [];
        [3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A', 2].map((e, i, a) => {
             this.theFullBox.push(new singleCard({id: i * 4, name: e + 'S', worth: i + 3, suit: 0}));
             this.theFullBox.push(new singleCard({id: i * 4 + 1, name: e + 'C', worth: i + 3, suit: 1}));
             this.theFullBox.push(new singleCard({id: i * 4 + 2, name: e + 'D', worth: i + 3, suit: 2}));
             this.theFullBox.push(new singleCard({id: i * 4 + 3, name: e + 'H', worth: i + 3, suit: 3}));
        });
    }

    checkingCombo(currentPlayer, cardsData, lastCombo) {
        cardsData.sort((a, b) => {
            return a - b
        });

        let currentPlayerCardSorted = lib.sortCards(currentPlayer.cards);

        let cardsDataBinding = currentPlayerCardSorted.filter(e => {
            return cardsData.indexOf(e.id) !== -1;
        });

        //Check own cards
        if (cardsDataBinding.length !== cardsData.length) {
            return false;
        }

        let comboType = this.validationChecking(cardsData, cardsDataBinding);
        if (!comboType) {
            return false;
        }
        if (comboType && !lastCombo.length) {
            return true;
        }
        if (comboType && lastCombo.length > 0) {
            lastCombo.sort((a, b) => {
                return a - b
            });
            let lastComboDataBinding = this.theFullBox.filter(e => {
                return lastCombo.indexOf(e.id) !== -1;
            });

            let lastComboType = this.validationChecking(lastCombo, lastComboDataBinding);
            if (lastComboType) {
                return this.compare(comboType, cardsData, cardsDataBinding, lastComboType, lastCombo, lastComboDataBinding);
            }

        }
        return false;

    }

     compare(comboType, cardsData, cardsDataBinding, lastComboType, lastCombo, lastComboDataBinding) {
         if((!this.twoChecking(lastCombo) && this.twoChecking(cardsData))
             && comboType === lastComboType && cardsDataBinding.length === lastComboDataBinding.length)
             return true;

        if((this.twoChecking(cardsData) === this.twoChecking(lastCombo))
            && comboType === lastComboType && cardsDataBinding.length === lastComboDataBinding.length
            && this.getComboStrength(cardsDataBinding) > this.getComboStrength(lastComboDataBinding) )
            return true;
        if(this.twoChecking(lastCombo) && !this.twoChecking(cardsData) &&
            ((comboType === 'twice_recursive' && (cardsData.length === 6 || cardsData.length === 8)) && lastCombo.length === 1)
            || ((comboType === 'twice_recursive' &&  cardsData.length === 8) && lastCombo.length === 2)
            || ((comboType === 'twice_recursive' &&  cardsData.length === 10) && lastCombo.length === 3)
            || (comboType === 'number_same_4' && lastCombo.length === 1))
            return true;

        return lastComboType === 'twice_recursive' && lastCombo.length === 6 && comboType === 'number_same_4';
    }

    getComboStrength(cardsBinding){
        return (cardsBinding[cardsBinding.length - 1].worth * 10) + cardsBinding[cardsBinding.length - 1].suit;
    }

    validationChecking(cardsArrayData, cardsObjectBinding) {
        if (cardsArrayData.length === 1) return 'single';
        if (cardsArrayData.length === 2 || cardsArrayData.length === 3 || cardsArrayData.length === 4) {
            let theSame = this.isNumberSame(cardsArrayData.length, cardsObjectBinding);
            if (theSame) return theSame;
        }
        if (cardsArrayData.length >= 3) {
            let recursive = this.isRecursive(cardsArrayData, cardsObjectBinding);
            if (recursive) return recursive;
        }
        if (cardsArrayData.length >= 5) {
            let twiceRec = this.isTwiceRecursive(cardsArrayData, cardsObjectBinding);
            if (twiceRec) return twiceRec;
        }
        return false;
    }

     twoChecking(cardsArrayData) {
        return cardsArrayData.indexOf(48) !== -1 || cardsArrayData.indexOf(49) !== -1 || cardsArrayData.indexOf(50) !== -1 || cardsArrayData.indexOf(51) !== -1;
    }

     isTwiceRecursive(cardsArrayData, e) {
        if (this.twoChecking(cardsArrayData)) return false;
        if (e.length % 2 === 0 && e.length >= 6) {
            for (let i = 0; i < e.length; i = i + 2) {
                if (e[i].worth !== e[i + 1].worth || (typeof e[i + 2] !== "undefined" && e[i].worth !== e[i + 2].worth - 1)) {
                    return false;
                }
            }
            return 'twice_recursive'
        }
        return false;
    }

     isRecursive(cardsArrayData, e) {
        if (this.twoChecking(cardsArrayData)) return false;
        if (e.length > 2 && e.length <= 12) {
            for (let i = 0; i < e.length - 1; i++) {
                if (e[i].worth !== e[i + 1].worth - 1) {
                    return false;
                }
            }
            return 'recursive';
        }
        return false;
    };

     isNumberSame(number, e) {
        if (e.length === number) {
            let keyCheck = e[0].worth;
            if (!e.some(ele => {
                return ele.worth !== keyCheck;
            }))
                return 'number_same_' + number;
        }
        return false;
    };

     isSixTwice(e) {
        if (e.length === 13) {
            let count = 0;
            let result = 0;
            for (let i = 0; i < e.length; i++) {
                if (count + 1 === 2 || count + 1 === 4) {
                    result++;
                }
                count = e[i].worth === e[i + 1].worth ? count + 1 : 0;
            }
            if (result === 6)
                return 'six_twice';
        }
        return false
    };

}

module.exports = ComboChecker;