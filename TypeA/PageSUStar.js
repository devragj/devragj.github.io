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
 * This file contains the PageSUStar class, which extends the Page class.
 * This file also initiales the PageSUStar object for the webpage
 * SUStar2nAlgorithm.html.
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * This is a small extension to the Page class.
 * Its sole purpose is to override the getN() function.
 * This override is needed because, for this webpage, n needs to be an even number.
 */
class PageSUStar extends Page {
        /**
         * The parameter for this constructor is the same as for the
         * Page class.
         * @param {Object} table
         */
        constructor(table) {
                super(table);
        }

        /**
         * This function  obtains the
         * value from the textbox with id 'nbox'.
         * @override
         * @return {number}  the value obtained from the textbox
         * @throws "No Good" - if the entry fails
         */
        getN() {
                let message = "Please enter a positive even integer in the 2n box.";
                let entry = document.getElementById('nbox').value.trim();
                let number = parseInt(entry);
                if (isNaN(number) || number < 2 || number % 2 == 1) {
                        alert(message);
                        throw "No Good";
                }

                return number;
        }
}

/**
 * The configuration object for the webpage SUStar2nAlgorithm.html.
 */
const pageSUStar = new PageSUStar({
        clearList: ['comment', 'tableauARender'],
        parse: ParameterSUStar.parse,
        generateParameter: ParameterSUStar.generateParameter,
        getDrawable: TableauSUStar.SUStarRobinsonSchensted,
        drawSteps: TableauSUStar.SUStarRobinsonSchenstedDrawSteps
        });
