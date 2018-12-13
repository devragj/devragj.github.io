/**
 MIT License

 Copyright (c) 2016-2018 Devra Garfinkle Johnson
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
 * This file contains the {@link PageCycles} class, which extends
 * the {@link Page} class.
 * It is used by the pages which animate cycles.
 * The {@link Page} class has methods which handle user input to these pages,
 * but the output for these pages differs significantly from that
 * which the {@link Page} class is designed to handle.  Thus the extension.
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016 Christian Johnson
 */

"use strict";

/**
 * helper class for displaying various animations of cycles
 * @extends Page
 */
class PageCycles extends Page {
        /**
         * @param {Object} table
         * @param {string[]} table.clearList - a list of the class names of the DOM
         * objects on the page which need to be removed when the user requests new output.
         * @param {function} table.parse - the function which parses a string
         * representation of the parameter input which has been supplied by the user.
         * @param {function} table.generateParameter - the function which generates a
         * random parameter based on the input supplied by the user.
         * @param {function} table.getDrawable - the function which gets a
         * {@link TableauCycles} or {@link TableauPairCycles} object
         * @param {function} table.draw - the function which draws the
         * {@link TableauCycles} or {@link TableauPairCycles} object on the page
         * @param {boolean} [table.inPlace] - If true, the cycle animation
         * takes place on the original tableau, otherwise,
         * clones are created and shown.
         * @param {boolean} [table.unboxedOnly] - If true, only special squares for
         * unboxed cycles will be shown.
         */
        constructor(table) {
                super(table)
                /**
                 * - the function which draws the
                 * {@link TableauCycles} or {@link TableauPairCycles} object on the page
                 * @type {function}
                 */
                this.draw = table.draw;
                /**
                 * If true, the cycle animation
                 * takes place on the original tableau, otherwise,
                 * clones are created and shown.
                 * @type {boolean}
                 */
                this.inPlace = table.inPlace;
                /**
                 * If true, only special squares for
                 * unboxed cycles will be shown.  Current uses also have
                 * <code>inPlace == true</code>.
                 * @type {boolean}
                 */
                this.unboxedOnly = table.unboxedOnly;
                // this.type = $('input[name = "gridGroup"]:checked').val();
                // this.type = "D";
                /**
                 * the object fetched by {@link PageCycles#getDrawable}
                 * @type {Object}
                 */
                this.drawable = null;
                /**
                 * how long, in milliseconds, the movement
                 * of each Domino should take.
                 * @type {Number}
                 */
                this.animationDuration = parseFloat($("#speed").val()) * 1000;
        }

        /**
         * This function handles the onchange event for the dropdown
         * menu on the webpage which allows the user to change
         * {@link PageCycles#animationDuration}.
         * @param {Object} select - the dropdown menu on the webpage
         */
        changeSpeed(select) {
                this.animationDuration = parseFloat($(select).val()) * 1000;
                if (this.drawable) {
                        this.drawable.animationDuration = this.animationDuration;
                }
        }

        /**
         * @param {Object} parameterObject - the parameter object which is
         * used to get the object displayed
         * @override
         */
        displayInputAndOutput(parameterObject) {
                Page.displayText(parameterObject.getParameterString());
                let tableauPair = TableauPair.RobinsonSchenstedGrid(parameterObject, this.type);
                this.drawable = this.getDrawable(tableauPair, this.type,
                        this.animationDuration, this.inPlace, this.unboxedOnly);
                this.draw(this.drawable);
        }

        /**
         * This function handles the onclick event from the Clear Animations button
         * on the webpage, which is present when <code>this.inPlace == false</code>.
         * It removes the clones, while leaving the original object.
         */
        static clearAnimations() {
                this.clearItems('cycleAnimation');
        }
}
