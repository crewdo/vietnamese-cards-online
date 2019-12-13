class ComboChecker {
    constructor(cardBox) {
        this.cardBox = cardBox;
    }

    checkingCombo(currentPlayer, cardsData, lastCombo) {
        console.log(this.cardBox);
        console.log(cardsData);
        console.log(lastCombo);

        //------------------------------------
        //Sorting First
        cardsData.sort((a, b) => {
            return a - b
        });

        //Checking Own cards and Binding Data
        let cardsDataBinding = currentPlayer.cards.filter(e => {
            return cardsData.indexOf(e.id) !== -1;
        });

        if (cardsDataBinding.length !== cardsData.length) {
            return false;
        }
        //------------------------------------

        //If Current combo is valid && Last combo == null
        let comboObject = this.validationChecking(cardsData, cardsDataBinding);

        if (!comboObject) {
            return false;
        }
        if (comboObject && !lastCombo) {
            return true;
        }

        if (comboObject && lastCombo) {
            lastCombo.sort((a, b) => {
                return a - b
            });
            let lastComboDataBinding = this.cardBox.filter(e => {
                return cardsData.indexOf(e.id) !== -1;
            });
            let lastComboObject = this.validatoionChecking(lastCombo, lastComboDataBinding);
            if (lastComboObject) {
                return this.compare(comboObject, lastComboObject);
            }

        }
        return false;

    }

    static compare(comboObject, lastComboObject) {
        return comboObject.type === lastComboObject.type && comboObject.length === lastComboObject.length && comboObject.strength > lastComboObject.strength;
    }

    static validationChecking(cardsArrayData, cardsObjectBinding) {

        if (cardsArrayData.length === 1) return 'single';
        if (cardsArrayData.length === 2 || cardsArrayData.length === 3 || cardsArrayData.length === 4) {
            let theSame = this.isNumberSame(cardsObjectBinding, cardsArrayData.length);
            if (theSame) return theSame;
        }
        if (cardsArrayData.length >= 3) {
            let recursive = this.isRecursive(cardsObjectBinding);
            if (recursive) return recursive;
        }
        if (cardsArrayData.length >= 5) {
            let twiceRec = this.isTwiceRecursive(cardsObjectBinding);
            if (twiceRec) return twiceRec;
        }
        return false;
    }

    static twoChecking(cardsArrayData) {
        return cardsArrayData.indexOf(48) || cardsArrayData.indexOf(49) || !cardsArrayData.indexOf(50) || !cardsArrayData.indexOf(51);
    }

    static isTwiceRecursive(e) {
        if (this.twoChecking()) return false;
        if (this.length % 2 === 0 && this.length >= 6) {
            for (let i = 0; i < this.length; i = i + 2) {
                if (this[i] !== this[i + 1] || (typeof this[i + 2] !== "undefined" && this[i] !== this[i + 2] - 1)) {
                    return false;
                }
            }
            return 'twice_recursive'
        }
        return false;
    }

    static isRecursive(e) {
        if (this.twoChecking()) return false;
        if (this.length > 2 && this.length <= 12) {
            for (let i = 0; i < this.length - 1; i++) {
                if (this[i] !== this[i + 1] - 1) {
                    return false;
                }
            }
            return 'recursive';
        }
        return false;
    };

    static isNumberSame(e, number) {
        if (this.length === number) {
            let keyCheck = this[0];
            if (!this.some(ele => {
                return ele !== keyCheck;
            }))
                return 'number_same_' + number;
        }
        return false;
    };

    static isSixTwice(e) {
        if (this.length === 13) {
            let count = 0;
            let result = 0;
            for (let i = 0; i < this.length; i++) {
                if (count + 1 === 2 || count + 1 === 4) {
                    result++;
                }
                count = this[i] === this[i + 1] ? count + 1 : 0;
            }
            if (result === 6)
                return 'six_twice';
        }
        return false
    };


    //
    // let array = [2,2,3,3,4,4,5,5,6,6];
    // console.log(array.isTwiceRecursive());
    //
    // let arrayTwo = [1,2,3,4,5,6,7,8];
    // console.log(arrayTwo.isRecursive());
    //
    // let arrayThree = [1,1,1,1];
    // console.log(arrayThree.isNumberSame(4));
    //
    // let arraySix = [0,0,2,2,2,3,3,4,4,5,5,7,7];
    // console.log(arraySix.isSixTwice())

}

module.exports = ComboChecker;