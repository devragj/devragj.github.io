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
 * This file contains the {@link PageAnimate} class, which extends
 * the {@link Page} class.
 * It is used by the pages RobinsonSchenstedAnimate.html and
 * DominoRobinsonSchenstedAnimate.html
 * The {@link Page} class has methods which handle user input to these pages,
 * but the output for these pages differs significantly from that
 * which the {@link Page} class is designed to handle.  Thus the extension.
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * Helper class for animating the Robinson-Schensted algorithm and the
 * Domino Robinson-Schensted algorithm.
 * @extends Page
 */
class PageAnimate extends Page {
        /**
         * @param table
         * @param {Array} table.clearList - A list of the class names of the DOM
         * objects on the page which need to be removed when the user requests new output.
         * @param {function} table.parse - The function which parses a string
         * representation of the parameter input which has been supplied by the user.
         * @param {function} table.generateParameter - The function which generates a
         * random parameter based on the input supplied by the user.
         * @param {string} table.animationClassName - The CSS class name of the animation
         * object to be cleared between steps of the animation.
         * @param {function} table.getTableau - The function which obtains the
         * empty tableau to start the animation.
         * @param {function} table.getAnimationData - The function which gets the
         * data necessary to put the animation on the page.
         */
        constructor(table) {
                super(table);
                /**
                 * The function which obtains the
                 * empty tableau to start the animation.
                 * @type {function}
                 */
                this.getTableau = table.getTableau;
                /**
                 * The function which gets the
                 * data necessary to put the animation on the page.
                 * @type {function}
                 */
                this.getAnimationData = table.getAnimationData;
                /**
                 * The CSS class name of the animation object
                 * to be cleared between steps of the animation.
                 * @type {string}
                 */
                this.animationClassName = table.animationClassName;
                this.clearList.push(this.animationClassName);
                /**
                 * How long, in milliseconds, the movement
                 * of each Domino should take.
                 * @type {number}
                 */
                this.animationDuration = parseFloat($("#speed").val()) * 1000;
                /**
                 * The index in the permutation array of the number
                 * being added at the current step of the animation.
                 * @type {number}
                 */
                this.currentIndex = 0;
                /**
                 * The last index in the permutation array.
                 * @type {number}
                 */
                this.lastIndex = 0;
                /**
                 * The permutation arrray.
                 * @type {number[]}
                 */
                this.permutation = null;
                /**
                 * This holds the underlying tableau at each stage of the animation.
                 * @type {Object}
                 */
                this.tableau = null;
        }

        /**
         * This function handles the onchange event for the dropdown
         * menu on the webpage which allows the user to change.
         * {@link PageAnimate#animationDuration}.
         * @param {Object} select - The dropdown menu on the webpage.
         */
        changeSpeed(select) {
                this.animationDuration = parseFloat($(select).val()) * 1000;
        }

        /**
         * This function handles the onclick event from the button
         * which is used to start the animation when the user is requesting
         * randomly-generated input to the algorithm. It gets the random parameter
         * and performs the animated first step of the algorithm.
         */
        startRandomAnimation() {
                this.clearPrevious();
                try {
                        let n = this.getN();
                        let parameterObject = this.generateParameter(n);
                        this.startAnimation(parameterObject);
                } catch (e) {

                }
        }

        /**
         * This function handles the onclick event from the button
         * which is used to start the animation when the user supplies
         * a permutation string as input to the algorithm. It
         * performs the animated first step of the algorithm.
         */
        startParameterAnimation() {
                this.clearPrevious();
                try {
                        let parameterObject = this.getParameterFromBox();
                        this.startAnimation(parameterObject);
                } catch (e) {

                }
        }

        /**
         * This function initializes the animation and performs the first step.
         * @param {Object} parameterObject - the parameter object which is the input
         * to the algorithm.
         */
        startAnimation(parameterObject) {
                Page.displayText(parameterObject.getParameterString());
                Page.displayText("-------------");
                this.tableau = this.getTableau();
                this.permutation = parameterObject.parameter;
                this.currentIndex = 0;
                this.lastIndex = this.permutation.length - 1;
                this.runStep();
        }

        /**
         * This function handles the onclick event from the Next Step buttons
         * on the webpage.
         */
        nextStep() {
                this.runStep();
        }

        /**
         * This function displays one step of the animation,
         * and updates the member variables appropriately.
         */
        runStep() {
                this.currentIndex++;
                if (this.currentIndex > this.lastIndex) {
                        alert("This animation is done.");
                        return;
                }

                Page.clearItems(this.animationClassName);
                let numberToAdd = this.permutation[this.currentIndex];
                let { wrapper, animateList } = this.getAnimationData(this.tableau, numberToAdd, this.animationDuration);
                document.body.appendChild(wrapper);
                for (let index = 0, length = animateList.length; index < length; ++index) {
                        setTimeout(animateList[index], (index + 1) * this.animationDuration);
                }
        }

        /**
         * This is the event handler for the keyup event in the nbox.
         * This function replaces Page.randomKey for this type of animation.
         * When the Enter key is pressed, this clicks either the startRandomButton
         * or the nextRandomButton, depending on what stage in the animation you are at.
         * @param  {Object} event - DOM event object
         * @override
         */
        animationRandomKey(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        if (this.tableau === null || this.currentIndex > this.lastIndex) {
                                document.getElementById("startRandomButton").click();
                        } else {
                                document.getElementById("nextRandomButton").click();
                        }

                }
        }

        /**
         * This is the event handler for the keyup event in the parmeterBox.
         * This function replaces Page.parameterKey for this type of animation.
         * When the Enter key is pressed, this clicks either the startParameterButton
         * or the nextParameterButton, depending on what stage in the animation you are at.
         * @param  {Object} event - DOM event object
         */
        animationParameterKey(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        if (this.tableau === null || this.currentIndex > this.lastIndex) {
                                document.getElementById("startParameterButton").click();
                        } else {
                                document.getElementById("nextParameterButton").click();
                        }

                }
        }
}
