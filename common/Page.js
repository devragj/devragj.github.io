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
 * This file contains the {@link Page} class.
 * The {@link Page} class has methods to handle user input to the page,
 * and to generate the output.
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * The Page class is responsible for processing the user input to the webpage,
 * and for calling methods to supply the desired output.
 * This class is used by all the algorithm pages.
 * In many cases, differences between the pages can be handled
 * by the inputs to the constructor, which are mostly function objects.
 * In some cases, we need to extend the Page class.<br><br>
 * In most of the pages, there are two ways to obtain the input parameter
 * (randomly-generated and explicit), and two ways to display the output
 * (all at once or step by step).
 * Thus four functions are needed to execute these procedures,
 * and these are input to the constructor.
 */
class Page {
        /**
         * @param {Object} table
         * @param {string[]} table.clearList - a list of the class names of the DOM
         * objects on the page which need to be removed when the user requests new output.
         * @param {function} table.parse - the function which parses a string
         * representation of the parameter input which has been supplied by the user.
         * @param {function} table.generateParameter - the function which generates a
         * random parameter based on the input supplied by the user.
         * @param {function} [table.getDrawable] - in a basic page, the function which,
         * when given a parameter object, returns the output to be drawn on the page.
         * @param {function} [table.drawSteps] - in a basic page, the function
         * which draws the output in steps.
         * @param {boolean} [table.pairs] - if true, the textbox for pairs is present on
         * the page, so its input needs to be processed.
         * @param {string} [table.type] - one of B, C, or D
         */
        constructor(table) {
                /**
                 * a list of the class names of the DOM
                 * objects on the page which need to be
                 * removed when the user requests new output.
                 * @type {string[]}
                 */
                this.clearList = table.clearList;
                /**
                 * the function which parses a string representation
                 * of the parameter input which has been supplied by the user.
                 * @type {function}
                 */
                this.parse = table.parse;
                /**
                 * the function which generates a
                 * random parameter based on the input supplied by the user.
                 * @type {function}
                 */
                this.generateParameter = table.generateParameter;
                /**
                 * in a basic page, the function which,
                 * when given a parameter object,
                 * returns the output to be drawn on the page.
                 * @type {function}
                 */
                this.getDrawable = table.getDrawable;
                /**
                 * in a basic page, the function
                 * which draws the output in steps.
                 * @type {function}
                 */
                this.drawSteps = table.drawSteps;
                /**
                 * if true, the textbox for pairs is present on
                 * the page, so its input needs to be processed.
                 * @type {boolean}
                 */
                this.pairs = table.pairs;

                // this.type = table.type;
                if (table.type) {
                        /**
                         * One of B, C, or D. This member is used on pages where the
                         * user can select the type of tableau to be displayed.
                         * @type {string}
                         */
                        this.type = $('input[name = "gridGroup"]:checked').val();
                }
        }

        /**
         * This function gets the input from a textbox which expects
         * an integer, parses, and checks the input
         * @param {string} boxName - the id of the textbox
         * @param {number} cutoff - the minimum allowed value of the integer
         * @param {string} errorMessage - message to be shown in an alert box
         * if the entry is not proper
         * @param {boolean} [emptyOK] - if true, the box can be empty
         * @return {number|undefined}  the value obtained from the textbox
         *  or undefined if the box is empty and this is permitted
         * @throws {Error}  if the entry fails
         */
        getIntegerFromBox(boxName, cutoff, errorMessage, emptyOK) {
                let entry = document.getElementById(boxName).value.trim();
                if (entry == '' && emptyOK) {
                        return undefined;
                }

                let number = parseInt(entry);
                if (isNaN(number) || number < cutoff) {
                        alert(errorMessage);
                        throw new Error("Bad entry in " + boxName);
                }

                return number;
        }

        /**
         * This function calls {@link Page#getIntegerFromBox} to obtain the
         * value from the textbox with id 'nbox'
         */
        getN() {
                let message = "Please enter a positive integer in the n box.";
                return this.getIntegerFromBox('nbox', 1, message);
        }

        /**
         * This function calls {@link Page#getIntegerFromBox} to obtain the
         * value from the box with id 'pbox'.
         * This box may not be present on the page.
         * When present, its use is optional.
         */
        getPairs() {
                let message = "Please enter a non-negative integer in the pairs box.";
                return this.getIntegerFromBox('pbox', 0, message, true);
        }

        /**
         * This function gets a user-entered parameter
         * and returns a parmeter object, using the configuration variable
         * {@link Page#parse}.  It has a try-catch block in case the
         * parse function does error checking.
         * @param {string} errorMessage - the message to use to alert
         * the user of a defect in the parameter string.
         * @throws {Error} This function throws an error if it catches an error
         * thrown by {@link Page#parse}.
         */
        getParameterFromBox() {
                let errorMessage = "Please check your entry."
                let entry = document.getElementById('parameterBox').value.trim();
                try {
                        let parameterObject = this.parse(entry);
                        return parameterObject;
                } catch (e) {
                        alert(errorMessage);
                        throw new Error("Bad input to getParameterFromBox.");
                }
        }

        /**
         * This function is triggered when the user clicks the Run button which
         * generates a random parameter.
         */
        runInput() {
                this.clearPrevious();
                try {
                        let n = this.getN();
                        let pairs;
                        if (this.pairs) {
                                pairs = this.getPairs();
                        }

                        let parameterObject = this.generateParameter(n, pairs);
                        this.displayInputAndOutput(parameterObject);
                } catch (e) {

                }
        }

        /**
         * This function is triggered when the user clicks the Run Steps button which
         * generates a random parameter.
         */
        runSteps() {
                this.clearPrevious();
                try {
                        let n = this.getN();
                        let pairs;
                        if (this.pairs) {
                                pairs = this.getPairs();
                        }

                        let parameterObject = this.generateParameter(n, pairs);
                        this.displayInputAndOutputSteps(parameterObject);
                } catch (e) {

                }
        }

        /**
         * This function is triggered when the user clicks the Run button which
         * operates on a parameter string entered by the user. It calls
         * {@link Page#getParameterFromBox} to obtain the user input required,
         * and then calls {@link Page#displayInputAndOutput} to do the rest of the work.
         * This function has a try-catch block, however the catch block is currently
         * empty, as the work of alerting the user to errors is done by the
         * function which obtains the user input.
         */
        runParameter() {
                this.clearPrevious();
                try {
                        let parameterObject = this.getParameterFromBox();
                        this.displayInputAndOutput(parameterObject);
                } catch (e) {

                }

        }

        /**
         * This function is triggered when the user clicks the Run Steps button which
         * operates on a parameter string entered by the user. It calls
         * {@link Page#getParameterFromBox} to obtain the user input required,
         * and then calls {@link Page#displayInputAndOutputSteps} to do the rest of the work.
         * This function has a try-catch block, however the catch block is currently
         * empty, as the work of alerting the user to errors is done by the
         * function which obtains the user input.
         */
        runParameterSteps() {
                this.clearPrevious();
                try {
                        let parameterObject = this.getParameterFromBox();
                        this.displayInputAndOutputSteps(parameterObject);
                } catch (e) {

                }
        }

        /**
         * This function displays the output of the algorithm on the page.
         * @param {Object} parameterObject - the parameter object which is the input
         * to the algorithm.
         */
        displayInputAndOutput(parameterObject) {
                Page.displayText(parameterObject.getParameterString());
                let drawable = this.getDrawable(parameterObject, this.type);
                drawable.draw();
        }

        /**
         * This function displays the steps of the algorithm on the page.
         * @param {Object} parameterObject - the parameter object which is the input
         * to the algorithm.
         */
        displayInputAndOutputSteps(parameterObject) {
                Page.displayText(parameterObject.getParameterString());
                Page.displayText("-------------");
                this.drawSteps(parameterObject, this.type);
        }

        /**
         * This is the event handler for the keyup event in the nbox or pbox.
         * When the Enter key is pressed, this clicks the runRandomButton.
         * @param  {Object} event - DOM event object
         */
        static randomKey(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        document.getElementById("runRandomButton").click();
                }
        }

        /**
         * This is the event handler for the keyup event in the parameterBox.
         * When the Enter key is pressed, this clicks the runParameterButton.
         * @param  {Object} event - DOM event object
         */
        static parameterKey(event) {
                event.preventDefault();
                if (event.keyCode == 13) {
                        document.getElementById("runParameterButton").click();
                }
        }

        /**
         * This function displays a line of text on the page.
         * It is usually used to display the string representation
         * of the input to the algorithm.
         * @param {string} text - the text to display
         */
        static displayText(text) {
                let wrapper = document.createElement('div');
                wrapper.className = "comment";
                let content = document.createTextNode(text);
                wrapper.appendChild(content);
                document.body.appendChild(wrapper);
        }

        /**
         * This function removes all items on the page which have the given CSS class.
         * @param {string} className - the name of the CSS class to remove.
         */
        static clearItems(className) {
                let itemList = document.getElementsByClassName(className);
                for (let index = itemList.length - 1; index >= 0; --index) {
                        let item = itemList[index];
                        item.parentNode.removeChild(item);
                }
        }

        /**
         * This function removes all output from the page.
         */
        clearPrevious() {
                this.clearList.forEach((type) => Page.clearItems(type));
        }

        /**
         * This function responds to the user input of selecting a radio button
         * to set the type of a tableau or tableaux to be shown.
         * @param {Object} radio - the selected radio button
         */
        setType(radio) {
                // this.type = radio.value;
                this.type = $(radio).val();
        }

        /**
         * This function can be used in the console to test the algorithm
         * for the page and its inverse.  It displays the parameter and its
         * output on the page, and logs the result of the test.
         * @param {number} n - the size of the randomly-generated parameter to test.
         */
        testAlgorithm(n) {
                let parameterObject = this.generateParameter(n);
                let parameterString = parameterObject.getParameterString();
                Page.displayText(parameterString);
                let drawable = this.getDrawable(parameterObject);
                drawable.draw();
                let paramObj2 = drawable.getParameter();
                let paramString2 = paramObj2.getParameterString();
                Page.displayText(paramString2);
                console.log(parameterString == paramString2);
        }

        /**
         * This function can be used in the console to test the algorithm
         * for the page and its inverse.  This version is used for larger size input.
         * There is no display on the page.  Other than that, it is the same as
         * the previous function.
         * @param {number} n - the size of the randomly-generated parameter to test.
         */
        testAlgorithmNoDraw(n) {
                let parameterObject = this.generateParameter(n);
                let parameterString = parameterObject.getParameterString();
                let drawable = this.getDrawable(parameterObject);
                let paramObj2 = drawable.getParameter();
                let paramString2 = paramObj2.getParameterString();
                console.log(parameterString == paramString2);
        }
}
