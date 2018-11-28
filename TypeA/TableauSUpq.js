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
 * This file stores the classes needed to perform the SU(p,q) algorithm
 * and its inverse.<br>
 * This algorithm needs two classes (in addition to the classes in TableauA.js).<br>
 * The main class is the {@link TableauSignsSUpq} class.
 * It stores the output of the algorithm.<br>
 * The {@link ParameterSUpq} class handles the input to the SU(p,q) algorithm.<br>
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * This class stores the output to the SU(p,q) algorithm.
 * The output is usually represented as a pair of tableaux,
 * one with numbers and one of the same shape, filled with signs.
 * However, since, in the sign tableau, signs alternate along rows,
 * all the information about the sign tableau is stored in the
 * last square of each row.  So, this class uses an array storing those last signs
 * to represent the sign tableau.  The method {@link TableauSignsSUpq#getTableauPair}
 * converts this array into the corresponding sign tableau.
 */
class TableauSignsSUpq {
        /**
         * This constructs a {@link TableauSignsSUpq} from a {@link TableauA} and an
         * array of signs, or an empty {@link TableauSignsSUpq}
         * if no tableau is supplied.
         * @param {TableauA} [tableau]
         * @param {string[]} [signs]
         */
        constructor(tableau, signs) {
                if (!tableau) {
                        /**
                         * @type {TableauA}
                         */
                        this.tableau = new TableauA();
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
         *  @return {TableauSignsSUpq}
         */
        clone() {
                let tab = this.tableau.clone();
                let signs = [];
                this.signs.forEach((sgn) => {
                        signs.push(sgn);
                });

                return new TableauSignsSUpq(tab, signs);
        }

        /**
         * @param {string} sign - either '+' or '-'
         * @return {string} the other sign
         */
        static oppositeSign(sign) {
                if (sign == "+") return "-";
                if (sign == "-") return "+";
                throw new Error("Input to oppositeSign is not a sign");
        }

        /**
         * This function creates the right tableau of the {@link TableauA} pair from
         * the shape of {@link TableauSignsSUpq#tableau}
         *  and the sign information in {@link TableauSignsSUpq#signs}.
         * The left tableau of the pair is a clone of {@link TableauSignsSUpq#tableau}.
         * @return {TableauAPair}
         */
        getTableauPair() {
                function makeSignRow(row, rowLength, endSign) {
                        let sign = endSign;
                        let opSign = TableauSignsSUpq.oppositeSign(sign);
                        let signRow = [];
                        for (let column = rowLength - 1; column >= 0; column -= 2) {
                                signRow[column] = new Tile({n: sign, x: column, y: row});
                        }

                        for (let column = rowLength - 2; column >= 0; column -= 2) {
                                signRow[column] = new Tile({n: opSign, x: column, y: row});
                        }

                        return signRow;
                }

                let tileList = [];
                this.signs.forEach((sign, index) => {
                        let rowLength = this.tableau.getRowLength(index);
                        let newTiles = makeSignRow(index, rowLength, sign);
                        tileList = tileList.concat(newTiles);
                });

                let rightTab = new TableauA(tileList);
                return new TableauAPair(this.tableau.clone(), rightTab);
        }

        /**
         * This function draws the {@link TableauAPair} associated to this
         * {@link TableauSignsSUpq}.
         */
        draw() {
                let tabAPair = this.getTableauPair();
                tabAPair.draw();
        }

        /**
         * This is a helper function for the main algorithm.
         * It adds a number with sign to a specified level of the
         * {@link TableauSignsSUpq},
         * or, recursively, to a lower level if it is not possible to add the
         * number with sign at the input level.
         * @param {number} number - a number which is larger than any currently
         * contained in this.tableau
         * @param {string} sign - '+' or '-'
         * @param {number} level - the row to try to add the number and sign to.
         */
        addNumberSign(number, sign, level) {
                let findSign = function(tsp, sign, startLevel, endLevel) {
                        let level = startLevel;
                        while (level <= endLevel) {
                                if (tsp.signs[level] == sign) {
                                        break;
                                }

                                level++;
                        }

                        return level;
                }

                let placeNumberSign = function(tsp, number, sign, level) {
                        let rowLength = tsp.tableau.getRowLength(level);
                        let tile = new Tile({n: number, x: rowLength, y: level});
                        tsp.tableau.insertAtEnd(tile);
                        tsp.signs[level] = sign;
                }

                let rowLength = this.tableau.getRowLength(level);
                if (rowLength == 0) {
                        placeNumberSign(this, number, sign, level);
                } else {
                        let endLevel = this.tableau.getColumnLength(rowLength - 1) - 1;
                        let opSignLevel = findSign(this, TableauSignsSUpq.oppositeSign(sign), level, endLevel);
                        if (opSignLevel == endLevel + 1) {
                                this.addNumberSign(number, sign, opSignLevel);
                        } else {
                                placeNumberSign(this, number, sign, level);
                                this.signs[opSignLevel] = sign;
                        }
                }
        }

        /**
         * This is the main SU(p,q) algorithm.
         * @param {ParameterSUpq} parameterObject
         * @return {TableauSignsSUpq}
         */
        static SUpqRobinsonSchensted(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauSignsSUpq = new TableauSignsSUpq();
                for (let number = 1; number < parameter.length; ++number) {
                        if (parameter[number] == "+") {
                                myTableauSignsSUpq.addNumberSign(number, "+", 0);
                        } else if (parameter[number] == "-") {
                                myTableauSignsSUpq.addNumberSign(number, "-", 0);
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                let position = myTableauSignsSUpq.tableau.nextRobinsonSchensted(first);
                                let x = position.x;
                                let y = position.y;
                                let level = y;
                                if (x == 0) {
                                        myTableauSignsSUpq.signs[level] = "+";
                                } else {
                                        myTableauSignsSUpq.signs[level] = TableauSignsSUpq.oppositeSign(myTableauSignsSUpq.signs[level]);
                                }

                                myTableauSignsSUpq.addNumberSign(number, TableauSignsSUpq.oppositeSign(myTableauSignsSUpq.signs[level]), level + 1);
                        }
                }

                return myTableauSignsSUpq;
        }

        /**
         * This function performs the main SU(p,q) algorithm,
         * just as the previous function does.
         * In addition, it draws each step.
         * @param {ParameterSUpq} parameterObject
         * @return {TableauSignsSUpq}
         */
        static SUpqRobinsonSchenstedDrawSteps(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauSignsSUpq = new TableauSignsSUpq();
                for (let number = 1; number < parameter.length; ++number) {
                        if (parameter[number] == "+") {
                                Page.displayText(number + "+");
                                myTableauSignsSUpq.addNumberSign(number, "+", 0);
                                myTableauSignsSUpq.draw();
                        } else if (parameter[number] == "-") {
                                Page.displayText(number + "-");
                                myTableauSignsSUpq.addNumberSign(number, "-", 0);
                                myTableauSignsSUpq.draw();
                        } else if (parameter[number] > 0) {
                                let first = parameter[number];
                                Page.displayText(first + "_" + number);

                                let previousTabPair = myTableauSignsSUpq.getTableauPair();
                                let position = myTableauSignsSUpq.tableau.nextRobinsonSchensted(first);
                                let leftTabToDraw = myTableauSignsSUpq.tableau.clone();
                                let positionTile = new Tile(position);
                                positionTile.n = "";
                                positionTile.highlight = 5;
                                leftTabToDraw.tileList.push(positionTile);
                                previousTabPair.left = leftTabToDraw;
                                previousTabPair.right.insertAtEnd(positionTile);
                                previousTabPair.draw();

                                let x = position.x;
                                let y = position.y;
                                let level = y;
                                if (x == 0) {
                                        myTableauSignsSUpq.signs[level] = "+";
                                } else {
                                        myTableauSignsSUpq.signs[level] = TableauSignsSUpq.oppositeSign(myTableauSignsSUpq.signs[level]);
                                }

                                myTableauSignsSUpq.addNumberSign(number, TableauSignsSUpq.oppositeSign(myTableauSignsSUpq.signs[level]), level + 1);
                                myTableauSignsSUpq.draw();
                        }
                }

                return myTableauSignsSUpq;
        }

        /**
         * This function performs the inverse of the SU(p,q) algorithm.
         * It starts with a {@link TableauSignsSUpq} object
         * and returns a {@link ParameterSUpq}.
         * @return {ParameterSUpq}
         */
        getParameter() {
                let source = this.clone();
                let tableau = source.tableau;
                let signs = source.signs;
                let tileList = tableau.tileList;
                let tileGrid = tableau.tileGrid;
                let paramArray = [0];

                function findLevel(sign, startLevel) {
                        if (startLevel < 0) {
                                return startLevel;
                        }

                        if (signs[startLevel] == sign) {
                                return startLevel;
                        }

                        let x = tableau.getRowLength(startLevel) - 1;
                        let endLevel = tableau.getColumnLength(x + 1);
                        let signLevel = -1;
                        for (let y = startLevel - 1; y >= endLevel; y--) {
                                if (signs[y] == sign) {
                                        signLevel = y;
                                        break;
                                }
                        }

                        if (signLevel >= 0) {
                                signs[startLevel] = sign;
                                signs[signLevel] = TableauSignsSUpq.oppositeSign(sign);
                                return startLevel;
                        }

                        return findLevel(sign, endLevel - 1);

                }

                while (tileList.length > 0) {
                        let lastTile = tileList.pop();
                        tileGrid.removeExtremal(lastTile);
                        let y = lastTile.y
                        let sign = signs[y];
                        let opSign = TableauSignsSUpq.oppositeSign(sign);
                        signs[y] = opSign;
                        let level = findLevel(opSign, y - 1);
                        if (level < 0) {
                                paramArray[lastTile.n] = sign;
                        } else {
                                let x = tableau.getRowLength(level) - 1;
                                let position = {x: x, y: level};
                                let number = tableau.removeRobinsonSchensted(position);
                                signs[level] = sign;
                                paramArray[lastTile.n] = number;
                                paramArray[number] = 0;
                        }
                }

                return new ParameterSUpq(paramArray);
        }
}

/**
 * This class handles the input to the SU(p,q) algorithm.
 * This parameter is an arrangement of the numbers 1 through n (where n = p + q)
 * into pairs and single numbers, where each single number is associated
 * with a sign, + or -.
 * The parameter is stored in the array {@link ParameterSUpq#parameter}.
 * A parameter can also be represented as a string, and is for display purposes.
 * So, this class contains functions to go between the two representations
 * of the parameter.
 */
class ParameterSUpq {
        /**
         * @param {Array|string} [input] - The input to this constructor can
         * either be an array of the type required for
         * {@link ParameterSUpq#parameter},
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
                        this.parameter = ParameterSUpq.getParameterString(input);
                } else {
                        this.parameter = [0];
                }
        }

        /**
         *  makes a deep copy
         *  @return {ParameterSUpq}
         */
        clone() {
                let param = [];
                this.parameter.forEach((item) => param.push(item));
                return new ParameterSUpq(param);
        }

        /**
         * This function generates a random parameter array
         * and stores it in a {@link ParameterSUpq} object.
         * @param {number} n - the size of the parameter
         * @param {number} [pairsInput] - the number of pairs in the parameter.
         * If <code>pairsInput</code> is not supplied,
        * the function will choose it randomly.
         * @return {ParameterSUpq}
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
                        parameter[num1] = 0;
                }

                for (let signIndex = 1; signIndex <= n - 2 * pairTotal; signIndex++) {
                        let num = chooseOne(numbers);
                        parameter[num] = Math.random() < .5 ? "+": "-";
                }

                return new ParameterSUpq(parameter);
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
                                output += first + "_";
                                output += number + " ";
                        }
                }

                output = output.slice(0, -1);
                return output;
        }

        /**
         * This function takes the string representation
         * of a parameter and returns the {@link ParameterSUpq} object
         * associated to that parameter.
         * @param {string} parameterString - a string representing a parameter
         * @return {ParameterSUpq} a {@link ParameterSUpq} object
         * representing the same parameter
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
                                        parameter[number1] = 0;
                                        parameter[number2] = number1;
                                }
                });

                return new ParameterSUpq(parameter);
        }
}
