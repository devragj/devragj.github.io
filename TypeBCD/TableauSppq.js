/**
 MIT License

 Copyright (c) 2016-2017 Devra Garfinkle Johnson
 Copyright (c) 2016 Christian Johnson

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * @file
 * This file stores the classes needed to perform the Sp(p,q) algorithm
 * and its inverse.<br>
 * This algorithm needs two classes (in addition to the classes in Tableau.js).<br>
 * The main class is the {@link TableauSignsSppq} class.  It stores the output of the algorithm.<br>
 * The {@link ParameterSppq} class handles the input to the Sp(p,q) algorithm.<br>
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 */

"use strict";

/**
 * This class stores the output to the Sp(p,q) algorithm.
 * The output is usually represented as a pair of tableaux,
 * one with numbers and one of the same shape, filled with signs.
 * However, since, in the sign tableau, signs alternate along rows,
 * all the information about the sign tableau is stored in the
 * last square of each row.  So, this class uses an array storing those last signs
 * to represent the sign tableau.  The method {@link TableauSignsSppq#getTableauPair}
 * converts this array into a sign tableau with the same shape as the number tableau.<br><br>
 * More precisely, the tableaux which are output by this algorithm have the property that
 * their columns have even length, or, said another way, the number of rows of
 * a given length is even.  In addition, for i odd, the ith and (i + 1)st row
 * have the same sign associated to them.  So, we need only store the sign information
 * for every other row, and that is what is done in the member variable signs,
 * which is an array of signs (+ or -).<br><br>
 * Since Sp(p,q) is of type C, the tableau part of {@link TableauSignsSppq}
 * will be a {@link TableauWithGrid} of type C.
 */
class TableauSignsSppq {
        /**
         * This constructs a  {@link TableauSignsSppq} from a
         * {@link TableauWithGrid} of type C and an array of signs.
         * If no tableau is supplied, it constructs an empty
         * {@link TableauSignsSppq}.
         * @param {TableauWithGrid} [tableau] - tableau will be of type C
         * @param {string[]} [signs] - the elements of signs can be '+' or '-'
         */
        constructor(tableau, signs) {
                if (!tableau) {
                        /**
                         * Type C
                         * @type {TableauWithGrid}
                         */
                        this.tableau = new TableauWithGrid("C");
                        /**
                         * the elements of signs can be '+' or '-'
                         * @type {Array.<string>}
                         */
                        this.signs = [];
                } else {
                        this.tableau = tableau;
                        this.signs = signs;
                }
        }

        /**
         *  makes a deep copy
         *  @return {TableauSignsSppq}
         */
        clone() {
                let tab = this.tableau.clone();
                let signs = [];
                this.signs.forEach((sgn) => {
                        signs.push(sgn);
                });

                return new TableauSignsSppq(tab, signs);
        }

        /**
         * @param {string} sign - either '+' or '-'
         * @return {string} the other sign
         */
        static oppositeSign(sign) {
                if (sign == "+") return "-";
                return "+";
        }

        /**
         * This function creates the right tableau of the Tableau pair from
         * the shape of {@link TableauSignsSppq#tableau}
         * and the sign information in {@link TableauSignsSppq#signs}.
         * The left tableau of the pair is a clone of {@link TableauSignsSppq#tableau}.
         * @return {TableauPair}
         */
        getTableauPair() {
                function makeSignRow(row, rowLength, endSign) {
                        let sign = endSign;
                        let opSign = TableauSignsSppq.oppositeSign(sign);
                        let signRow = [];
                        for (let column = 0; column < rowLength - 1; column += 2){
                                let nextBox = new Domino({n:"", x: column, y: row})
                                nextBox.box = true;
                                signRow[column / 2] = nextBox;
                        }

                        let endDomino = new Domino({n: endSign, x: rowLength - 1, y: row, horizontal: false});
                        if (rowLength % 2 == 0) {
                                endDomino.noBorder = true;
                        }

                        signRow.push(endDomino);
                        return signRow;
                }

                let dominoList = [];
                this.signs.forEach((sign, index) => {
                        let rowLength = this.tableau.getRowLength(2 * index);
                        let newDominos = makeSignRow(2 * index, rowLength, sign);
                        dominoList = dominoList.concat(newDominos);
                });

                let rightTableau = new TableauWithGrid("C", dominoList);
                return new TableauPair(this.tableau.clone(), rightTableau);
        }

        /**
         * This function draws the {@link TableauPair} associated to this
         * {@link TableauSignsSppq}.
         */
        draw() {
                let tableauPair = this.getTableauPair();
                tableauPair.draw();
        }

        /**
         * This is a helper function for the main algorithm.
         * It adds a number with sign to a specified level of the
         * {@link TableauSignsSppq},
         * or, recursively, to a lower level if it is not possible to add the
         * number with sign at the input level.
         * @param {number} number - a number which is larger than any currently
         * contained in this.tableau
         * @param {string} sign - '+' or '-'
         * @param {number} level - the level to try to add the number and sign to.
         * <code>level<code/> corresponds to the row at index <code>2 * level</code>.
         */
        addNumberSign(number, sign, level) {
                let findSign = function(tsp, sign, startLevel, endLevel) {
                        let level = startLevel;
                        while (level <= endLevel) {
                                if (tsp.signs[level] == sign) break;
                                level++;
                        }

                        return level;
                }

                let placeNumberSign = function(tsp, number, sign, level) {
                        let rowLength = tsp.tableau.getRowLength(2 * level);
                        let domino = new Domino({n: number, x: rowLength, y: 2 * level, horizontal: false});
                        tsp.tableau.insertAtEnd(domino);
                        tsp.signs[level] = sign;
                }

                let y = 2 * level;
                let x = this.tableau.getRowLength(y);
                let gridSubPosition = this.tableau.getGridSubPosition({x: x, y: y});
                if (x == 0) {
                        placeNumberSign(this, number, sign, level);
                } else if (gridSubPosition =="X") {
                        if (this.signs[level] != sign) {
                                placeNumberSign(this, number, sign, level);
                        } else if (this.tableau.getRowLength(2 * (level + 1)) == x) {
                                placeNumberSign(this, number, sign, level);
                                this.signs[level + 1] = TableauSignsSppq.oppositeSign(this.signs[level + 1]);
                        } else {
                                let backSquare = new Square({x: x - 1, y: y + 1});
                                let forwardSquare = this.tableau.getForwardSquare(backSquare);
                                if (forwardSquare.y == y) {
                                        this.tableau.moveOpenCycle(backSquare);
                                        let domino = new Domino({n: number, x: x - 1, y: y + 1, horizontal: true});
                                        this.tableau.insertAtEnd(domino);
                                        this.signs[level] = sign;
                                } else {
                                        placeNumberSign(this, number, sign, level);
                                        if (forwardSquare.x > 0) {
                                                let otherLevel = forwardSquare.y / 2;
                                                this.signs[otherLevel] = TableauSignsSppq.oppositeSign(this.signs[otherLevel]);
                                        }
                                }
                        }
                } else { // gridSubPosition =="Y"
                        let endLevel = this.tableau.getColumnLength(x - 1) / 2 - 1;
                        let opSignLevel = findSign(this, TableauSignsSppq.oppositeSign(sign), level, endLevel);
                        if (opSignLevel == endLevel + 1) {
                                this.addNumberSign(number, sign, opSignLevel);
                        } else {
                                placeNumberSign(this, number, sign, level);
                                this.signs[opSignLevel] = sign;
                        }
                }
        }

        /**
         * This is the main Sp(p,q) algorithm.
         * @param {ParameterSppq} parameterObject
         * @return {TableauSignsSppq}
         */
        static SppqRobinsonSchensted(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauSignsSppq = new TableauSignsSppq();
                for (let number = 1; number < parameter.length; ++number) {
                        if (parameter[number] == "+") {
                                myTableauSignsSppq.addNumberSign(number, "+", 0);
                        } else if (parameter[number] == "-") {
                                myTableauSignsSppq.addNumberSign(number, "-", 0);
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                let rsNumber = parameter[first] == 0 ? first : -first;
                                let position = myTableauSignsSppq.tableau.nextRobinsonSchensted(rsNumber);
                                let x = position.x;
                                let y = position.y;
                                let gridSubPosition = myTableauSignsSppq.tableau.getGridSubPosition(position);
                                let level = y / 2;
                                if (position.horizontal && gridSubPosition == "X") {
                                        let domino = new Domino({n: number, x: x, y: y + 1, horizontal: true});
                                        myTableauSignsSppq.tableau.insertAtEnd(domino);
                                        if (x == 0) {
                                                myTableauSignsSppq.signs[level] = "+";
                                        } else {
                                                myTableauSignsSppq.signs[level] = TableauSignsSppq.oppositeSign(myTableauSignsSppq.signs[level]);
                                        }
                                } else if (position.horizontal) { // gridSubPosition == "Y"
                                        myTableauSignsSppq.tableau.moveOpenCycle(new Square({x: x + 1, y: y}));
                                        myTableauSignsSppq.addNumberSign(number, myTableauSignsSppq.signs[level], level + 1);
                                        myTableauSignsSppq.signs[level] = TableauSignsSppq.oppositeSign(myTableauSignsSppq.signs[level]);
                                } else if (gridSubPosition =="Y") { // !position.horizontal
                                        myTableauSignsSppq.addNumberSign(number, myTableauSignsSppq.signs[level], level + 1);
                                } else { // !position.horizontal, gridSubPosition == "X"
                                        if (x == 0) {
                                                myTableauSignsSppq.signs[level] = "+";
                                        }

                                        myTableauSignsSppq.addNumberSign(number, TableauSignsSppq.oppositeSign(myTableauSignsSppq.signs[level]), level + 1);
                                }
                        }
                }

                return myTableauSignsSppq;
        }

        /**
         * This function performs the main Sp(p,q) algorithm,
         * just as the previous function does.
         * In addition, it draws each step.
         * @param {ParameterSppq} parameterObject
         * @return {TableauSignsSppq}
         */
        static SppqRobinsonSchenstedDrawSteps(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauSignsSppq = new TableauSignsSppq();
                for (let number = 1; number < parameter.length; ++number) {
                        if (parameter[number] == "+") {
                                Page.displayText(number + "+");
                                myTableauSignsSppq.addNumberSign(number, "+", 0);
                                myTableauSignsSppq.draw();
                        } else if (parameter[number] == "-") {
                                Page.displayText(number + "-");
                                myTableauSignsSppq.addNumberSign(number, "-", 0);
                                myTableauSignsSppq.draw();
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                if (parameter[first] == 0) {
                                        Page.displayText(first + "_" + number);
                                } else {
                                        Page.displayText(first + "_-" + number);
                                }

                                let previousTableauPair = myTableauSignsSppq.getTableauPair();
                                let rsNumber = parameter[first] == 0 ? first : -first;
                                let position = myTableauSignsSppq.tableau.nextRobinsonSchensted(rsNumber);
                                let leftTableauToDraw = myTableauSignsSppq.tableau.clone();
                                let positionDomino = new Domino(position);
                                positionDomino.n = "";
                                positionDomino.highlight = 5;
                                leftTableauToDraw.dominoList.push(positionDomino);
                                previousTableauPair.left = leftTableauToDraw;
                                //previousTableauPair.right.dominoList.push(positionDomino);
                                previousTableauPair.right.insertAtEnd(positionDomino);
                                previousTableauPair.draw();
                                let x = position.x;
                                let y = position.y;
                                let gridSubPosition = myTableauSignsSppq.tableau.getGridSubPosition(position);
                                let level = y / 2;
                                if (position.horizontal && gridSubPosition == "X") {
                                        let domino = new Domino({n: number, x: x, y: y + 1, horizontal: true});
                                        myTableauSignsSppq.tableau.insertAtEnd(domino);
                                        if (x == 0) {
                                                myTableauSignsSppq.signs[level] = "+";
                                        } else {
                                                myTableauSignsSppq.signs[level] = TableauSignsSppq.oppositeSign(myTableauSignsSppq.signs[level]);
                                        }
                                } else if (position.horizontal) { // gridSubPosition == "Y"
                                        myTableauSignsSppq.tableau.moveOpenCycle(new Square({x: x + 1, y: y}));
                                        myTableauSignsSppq.addNumberSign(number, myTableauSignsSppq.signs[level], level + 1);
                                        myTableauSignsSppq.signs[level] = TableauSignsSppq.oppositeSign(myTableauSignsSppq.signs[level]);
                                } else if (gridSubPosition =="Y") { // !position.horizontal
                                        myTableauSignsSppq.addNumberSign(number, myTableauSignsSppq.signs[level], level + 1);
                                } else { // !position.horizontal, gridSubPosition == "X"
                                        if (x == 0) {
                                                myTableauSignsSppq.signs[level] = "+";
                                        }

                                        myTableauSignsSppq.addNumberSign(number, TableauSignsSppq.oppositeSign(myTableauSignsSppq.signs[level]), level + 1);
                                }

                                myTableauSignsSppq.draw();
                        }

                }

                return myTableauSignsSppq;
        }

        /**
         * This function performs the inverse of the Sp(p,q) algorithm.
         * It starts with a {@link TableauSignsSppq} object
         * and returns a {@link ParameterSppq}.
         * @return {ParameterSppq}
         */
        getParameter() {
                let source = this.clone();
                let tableau = source.tableau;
                let signs = source.signs;
                let dominoList = tableau.dominoList;
                let dominoGrid = tableau.dominoGrid;
                let paramArray = [0];

                function enterInArray(upperNumber, lowerNumber) {
                        let pairEntry = lowerNumber > 0? 0: -1;
                        let number = lowerNumber > 0? lowerNumber: -lowerNumber;
                        paramArray[upperNumber] = number;
                        paramArray[number] = pairEntry;
                }

                function findLevelAndPosition(sign, startLevel) {
                        if (startLevel < 0) {
                                return {level: startLevel};
                        }

                        let yStart = 2 * startLevel + 1;
                        let x = tableau.getRowLength(yStart) - 1;
                        let position = {x: x, y: yStart - 1, horizontal: false};
                        if (tableau.getGridSubPosition({x: x, y: yStart}) == "W") {
                                if (signs[startLevel] == sign) {
                                        if (startLevel > 0 && tableau.getRowLength(yStart - 2) == x + 1) {
                                                signs[startLevel] = TableauSignsSppq.oppositeSign(sign);
                                                signs[startLevel - 1] = TableauSignsSppq.oppositeSign(signs[startLevel - 1]);
                                        } else {
                                                let backSquare = new Square({x: x, y: yStart});
                                                let forwardSquare = tableau.getForwardSquare(backSquare);
                                                let forwardY = forwardSquare.y;
                                                if (forwardY != yStart - 1) {
                                                        let forwardLevel = forwardY / 2;
                                                        signs[startLevel] = TableauSignsSppq.oppositeSign(sign);
                                                        signs[forwardLevel] = TableauSignsSppq.oppositeSign(signs[forwardLevel]);
                                                } else {
                                                        tableau.moveOpenCycle(backSquare);
                                                        position.horizontal = true;
                                                        signs[startLevel] = TableauSignsSppq.oppositeSign(sign);
                                                }
                                        }
                                }

                                return {level: startLevel, position: position};
                        }

                        let endLevel = tableau.getColumnLength(x + 1) / 2;
                        let signLevel = -1;
                        for (let y = startLevel; y >= endLevel; y--) {
                                if (signs[y] == sign) {
                                        signLevel = y;
                                        break;
                                }
                        }

                        if (signLevel >= 0) {
                                if (signLevel != startLevel) {
                                        signs[startLevel] = sign;
                                        signs[signLevel] = TableauSignsSppq.oppositeSign(sign);
                                }

                                if (x == 0) {
                                        signs.pop();
                                }

                                return {level: startLevel, position: position};
                        }

                        return findLevelAndPosition(sign, endLevel - 1);
                }

                while (dominoList.length > 0) {
                        let lastDomino = dominoList.pop();
                        dominoGrid.removeExtremal(lastDomino);
                        let gridSubPosition = tableau.getGridSubPosition(lastDomino);
                        let y = lastDomino.y
                        let level = (y / 2) | 0;
                        let sign = signs[level];
                        let opSign = TableauSignsSppq.oppositeSign(sign);
                        if (gridSubPosition == 'Z') {
                                let position = {x: lastDomino.x, y: y - 1, horizontal: true};
                                let number = tableau.removeRobinsonSchensted(position);
                                enterInArray(lastDomino.n, number);
                                if (lastDomino.x == 0) {
                                        signs.pop();
                                } else {
                                        signs[level] = opSign;
                                }
                        } else {
                                if (gridSubPosition == 'W') {
                                        tableau.moveOpenCycleToSquare(new Square(lastDomino));
                                } else {
                                        if (lastDomino.x == 0) {
                                                signs.pop();
                                        } else {
                                                signs[level] = opSign;
                                        }
                                }

                                let levelInfo = findLevelAndPosition(opSign, level - 1);
                                let upperLevel = levelInfo.level;
                                if (upperLevel < 0) {
                                        paramArray[lastDomino.n] = sign;
                                } else  {
                                        let position = levelInfo.position;
                                        let number = tableau.removeRobinsonSchensted(position);
                                        enterInArray(lastDomino.n, number);
                                }
                        }
                }

                return new ParameterSppq(paramArray);
        }
}

/**
 * This class handles the input to the Sp(p,q) algorithm.
 * This parameter is an arrangement of the numbers 1 through n (where n = p + q)
 * into pairs and single numbers, where each single number is associated
 * with a sign, + or -.  In addition, a pair of numbers will also have a sign
 * (or orientation) associated with it.
 * The parameter is stored in the array {@link ParameterSppq#parameter}.
 * A parameter can also be represented as a string, and is for display purposes.
 * So, this class contains functions to go between the two representations
 * of the parameter.
 */
class ParameterSppq {
        /**
         * @param {Array|string} [input] - The input to this constructor can
         * either be an array of the type required for
         * {@link ParameterSppq#parameter},
         * or it can be the string representation of the parameter.
         * If <code>input</code> is not given, the constructor returns the
         * representation of the empty parameter.
         */
        constructor(input) {
                if (Array.isArray(input)) {
                        /**
                         * This is an array which stores a representation of the
                         * parameter which is convenient for the algorithm.
                         * It contains numbers and sign strings ('+' and '-').
                         * Functionally, the array is 1-based, that is, parameter[0] = 0,
                         * (basically just to discard that entry).
                         * @type {Array}
                         */
                        this.parameter = input;
                } else if (typeof input == "string") {
                        this.parameter = ParameterSppq.parseParameterString(input);
                } else {
                        this.parameter = [0];
                }
        }

        /**
         *  makes a deep copy
         *  @return {ParameterSppq}
         */
        clone() {
                let param = [];
                this.parameter.forEach((item) => param.push(item));
                return new ParameterSppq(param);
        }

        /**
         * This function generates a random parameter array
         * and stores it in a {@link ParameterSppq} object.
         * @param {number} n - the size of the parameter
         * @param {number} [pairsInput] - the number of pairs in the parameter.
        * If <code>pairsInput</code> is not supplied,
        * the function will choose it randomly.
         * @return {ParameterSppq}
         */
        static generateParameter(n, pairsInput) {
                let chooseOne = function(array) {
                        let choiceIndex = Math.floor(Math.random() * array.length);
                        return array.splice(choiceIndex, 1)[0];
                }

                let pairTotal = pairsInput;
                if (!pairTotal && pairTotal != 0) {
                        let maxPairs = Math.floor(n / 2);
                        pairTotal = Math.floor(Math.random() * (maxPairs + 1));
                }

                let numbers = [];
                for (let i = 1; i <= n; i++) { numbers.push(i); }

                let parameter = [];
                parameter[0] = 0;
                for (let pairIndex = 1; pairIndex <= pairTotal; pairIndex++) {
                        let num1 = chooseOne(numbers);
                        let num2 = chooseOne(numbers);
                        if (num1 > num2) {
                                let temp = num1;
                                num1 = num2;
                                num2 = temp;
                        }

                        parameter[num2] = num1;
                        parameter[num1] = (Math.random() < .5) - 1;
                }

                for (let signIndex = 1; signIndex <= n - 2 * pairTotal; signIndex++) {
                        let num = chooseOne(numbers);
                        parameter[num] = Math.random() < .5 ? "+": "-";
                }

                return new ParameterSppq(parameter);
        }

        /**
         * This function gets the string representation
         * of the parameter.
         * @return {string} the string representation
         */
        getParameterString() {
                let parameter = this.parameter;
                let output = "";
                for (let number = 1; number < parameter.length; number++) {
                        if (parameter[number] == "+") {
                                output += number + "+ ";
                        } else if (parameter[number] == "-") {
                                output += number + "- ";
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                let signRef = parameter[first];
                                output += first + "_";
                                if (signRef == -1) {
                                        output += "-";
                                }
                                output += number + " ";
                        }
                }

                output = output.slice(0, -1);
                return output;
        }

        /**
         * This function takes the string representation
         * of a parameter and returns the {@link ParameterSppq} object
         * associated to that parameter.
         * @param {string} parameterString - a string representing a parameter
         * @return {ParameterSppq} a {@link ParameterSppq} object representing
         * the same parameter
         */
        static parse(parameterString) {
                let data = parameterString.split(" ").filter(x => x);
                let parameter = [0];
                data.forEach((datum) => {
                                if (datum.endsWith("+")) {
                                        let number = parseInt(datum.slice(0, -1));
                                        parameter[number] = "+";
                                } else if (datum.endsWith("-")) {
                                        let number = parseInt(datum.slice(0, -1));
                                        parameter[number] = "-";
                                } else {
                                        data = datum.split("_");
                                        let number1 = parseInt(data[0]);
                                        let number2 = parseInt(data[1]);
                                        if (number2 < 0) {
                                                parameter[number1] = -1;
                                                number2 = -number2;
                                        } else {
                                                parameter[number1] = 0;
                                        }

                                        parameter[number2] = number1;
                                }
                });
                return new ParameterSppq(parameter);
        }

        /**
         * @return {string}
         */
        toString() {
                return "ParameterSppq: " +  this.getParameterString();
        }
}
