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
 * This file stores the classes needed to perform the SU*(2n) algorithm
 * and its inverse.<br>
 * This algorithm needs two classes (in addition to the classes in TableauA.js).<br>
 * The main class is the {@link TableauSUStar} class,
 * which stores the output of the algorithm.<br>
 * The {@link ParameterSUStar} class handles the input to the SU*(2n) algorithm.<br>
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * As an object, a {@link TableauSUStar} is just a {@link TableauA},
 * with the restriction that every row has even length.
 * Of course the algorithm methods are different.
 * @extends {TableauA}
 */
class TableauSUStar extends TableauA {
        /**
          * This constructor just calls the constructor for {@link TableauA}.<br>
          * @param {Tile[]} [tileList = []] - an Array of Tiles (which is often empty).
        */
        constructor(tileList) {
                super(tileList);
        }

        /**
         *  makes a deep copy
         *  @override
         *  @return {TableauSUStar}
         */
        clone() {
                return new TableauSUStar(Tile.cloneList(this.tileList));
        }

        /**
         * This is the main SU*(2n) algorithm.
         * @param {ParameterSUStar} parameterObject
         * @return {TableauSUStar}
         */
        static SUStarRobinsonSchensted(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauSUStar = new TableauSUStar();
                for (let number = 1; number < parameter.length; ++number) {
                        if (parameter[number] > 0) {
                                let first = parameter[number];
                                let position = myTableauSUStar.nextRobinsonSchensted(first);
                                let x = position.x;
                                let y = position.y;
                                let secondTile = new Tile({n: number, x: x + 1, y: y});
                                myTableauSUStar.insertAtEnd(secondTile);
                        }
                }

                return myTableauSUStar;
        }

        /**
         * This function performs the main SU*(2n) algorithm,
         * just as the previous function does.
         * In addition, it draws each step.
         * @param {ParameterSUStar} parameterObject
         * @return {TableauSuStar}
         */
        static SUStarRobinsonSchenstedDrawSteps(parameterObject) {
                let parameter = parameterObject.parameter;
                        let myTableauSUStar = new TableauSUStar();
                        for (let number = 1; number < parameter.length; ++number) {
                                if (parameter[number] > 0) {
                                        let first = parameter[number];
                                        Page.displayText(first + "_" + number);

                                        let position = myTableauSUStar.nextRobinsonSchensted(first);
                                        let tabToDraw = myTableauSUStar.clone();
                                        let positionTile = new Tile(position);
                                        positionTile.n = "";
                                        positionTile.highlight = 5;
                                        tabToDraw.tileList.push(positionTile);
                                        tabToDraw.draw();

                                        let x = position.x;
                                        let y = position.y;
                                        let secondTile = new Tile({n: number, x: x + 1, y: y});
                                        myTableauSUStar.insertAtEnd(secondTile);
                                        myTableauSUStar.draw();
                                }
                        }

                        return myTableauSUStar;
                }

        /**
         * This function performs the inverse of the SU*(2n) algorithm.
         * It starts with a {@link TableauSUStar} and returns a {@link ParameterSUStar}.
         * @return {ParameterSUStar}
         */
        getParameter() {
                let permArray = [0];
                let tableau = this.clone();
                while (tableau.tileList.length > 0) {
                        let lastTile = tableau.tileList.pop();
                        let secondNumber = lastTile.n;
                        let x = lastTile.x;
                        let y = lastTile.y;
                        tableau.tileGrid.removeExtremal(lastTile);
                        let firstNumber = tableau.removeRobinsonSchensted({x: x - 1, y: y});
                        permArray[secondNumber] = firstNumber;
                        permArray[firstNumber] = 0;
                }

                return new ParameterSUStar(permArray);
        }
}

/**
 * This class handles the input to the SU*(2n) algorithm.
 * This parameter is an arrangement of the numbers 1 through 2n
 * into pairs.
 * The parameter is stored in the array {@link ParameterSUStar#parameter}..
 * A parameter can also be represented as a string, and is for display purposes.
 * So, this class contains functions to go between the two representations
 * of the parameter.
 */
class ParameterSUStar {
        /**
         * @param {number[]|string} [input] - The input to this constructor can
         * either be an array of the type required for
         * {@link ParameterSUStar#parameter},
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
                        this.parameter = ParameterSUStar.getParameterString(input);
                } else {
                        this.parameter = [0];
                }
        }

        /**
         *  makes a deep copy
         *  @return {ParameterSUStar}
         */
        clone() {
                let param = [];
                this.parameter.forEach((item) => param.push(item));
                return new ParameterSUStar(param);
        }

        /**
         * This function generates a random parameter array
         * and stores it in a {@link ParameterSUStar} object.
         * @param {number} n - the total size of the parameter,
         * so n must be even.
         * @return {ParameterSUStar}
         */
        static generateParameter(n) {
                let chooseOne = function(array) {
                        let choiceIndex = Math.floor(Math.random() * array.length);
                        return array.splice(choiceIndex, 1)[0];
                }

                let pairTotal = n / 2;

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

                return new ParameterSUStar(parameter);
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
                        if (parameter[number] > 0) {
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
         * of a parameter and returns the {@link ParameterSUStar} object
         * associated to that parameter.
         * @param {string} parameterString - a string representing a parameter
         * @return {ParameterSUStar} a {@link ParameterSUStar} object
         * representing the same parameter.
         */
        static parse(parameterString) {
                let data = parameterString.split(" ");
                let parameter = [0];
                data.forEach((datum) => {
                                data = datum.split("_");
                                let number1 = parseInt(data[0]);
                                let number2 = parseInt(data[1]);
                                parameter[number1] = 0;
                                parameter[number2] = number1;
                });

                return new ParameterSUStar(parameter);
        }
}
