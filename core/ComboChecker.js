class ComboChecker {
    constructor(cardBox) {
        this.cardBox = cardBox;
    }

    checkingCombo(currentPlayer, cardsData, lastCombo) {
        console.log(this.cardBox);
        console.log(cardsData);
        console.log(lastCombo);

        cardsData.sort((a, b) => {
            return a - b
        });

        let cardsDataBinding = currentPlayer.cards.filter(e => {
            return cardsData.indexOf(e.id) !== -1;
        });

        if (cardsDataBinding.length !== cardsData.length) {
            return false;
        }
        let comboType = this.validationChecking(cardsData, cardsDataBinding);
        console.log(comboType);
        if (!comboType) {
            return false;
        }
        if (comboType && !lastCombo) {
            return true;
        }
        if (comboType && lastCombo) {
            lastCombo.sort((a, b) => {
                return a - b
            });
            let lastComboDataBinding = this.cardBox.filter(e => {
                return cardsData.indexOf(e.id) !== -1;
            });
            let lastComboType = this.validationChecking(lastCombo, lastComboDataBinding);

            if (lastComboType) {
                return this.compare(comboType, cardsData, cardsDataBinding, lastComboType, lastCombo, lastComboDataBinding);
            }

        }
        return false;

    }

    static compare(comboType, cardsData, cardsDataBinding, lastComboType, lastCombo, lastComboDataBinding) {
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

    static getComboStrength(cardsBinding){
        return (cardsBinding[cardsBinding.length - 1].worth * 10) + cardsBinding[cardsBinding.length - 1].suit;
    }

    static validationChecking(cardsArrayData, cardsObjectBinding) {
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

    static twoChecking(cardsArrayData) {
        return cardsArrayData.indexOf(48) || cardsArrayData.indexOf(49) || cardsArrayData.indexOf(50) || cardsArrayData.indexOf(51);
    }

    static isTwiceRecursive(cardsArrayData, e) {
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

    static isRecursive(cardsArrayData, e) {
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

    static isNumberSame(number, e) {
        if (e.length === number) {
            let keyCheck = e[0].worth;
            if (!e.some(ele => {
                return ele.worth !== keyCheck;
            }))
                return 'number_same_' + number;
        }
        return false;
    };

    static isSixTwice(e) {
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