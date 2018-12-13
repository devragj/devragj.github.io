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
 * This file contains the {@link PageSpecial} class, which extends
 * the {@link Page} class.
 * It is used by the page
 * DominoRobinsonSchenstedSpecial.html
 * The {@link Page} class has methods which handle user input to these pages,
 * but the output for this page differs significantly from that
 * which the {@link Page} class is designed to handle.  Thus the extension.
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * @extends Page
 */
class PageSpecial extends Page {
        /**
         * @param table
         * @param {Array} table.clearList - a list of the class names of the DOM
         * objects on the page which need to be removed when the user requests new output.
         * @param {function} table.parse - the function which parses a string
         * representation of the parameter input which has been supplied by the user.
         * @param {function} table.generateParameter - the function which generates a
         * random parameter based on the input supplied by the user.
         */
        constructor(table) {
                super(table);
        }

        displayInputAndOutput(parameterObject) {
                Page.displayText(parameterObject.getParameterString());
                let tableauPair = TableauPair.RobinsonSchenstedGrid(parameterObject, this.type);
                let drawable = new TableauPairCycles({type: this.type, left: tableauPair.left, right:
                        tableauPair.right, unboxedOnly: true})
                document.body.appendChild(new TableauPairCyclesRendererDOM({tableauPair: drawable, noClick: true}).renderDOM());
                drawable.makeSpecial();
                let left = new TableauWithGrid({type: this.type, tableau: drawable.left});
                let right = new TableauWithGrid({type: this.type, tableau: drawable.right});
                tableauPair = new TableauPairGrid({type: this.type, left, right});
                let wrapper = document.createElement('div');
                wrapper.style.float = "left";
                // wrapper.style.clear = "both";
                wrapper.appendChild(new TableauPairRendererDOM({tableauPair}).renderDOM());
                document.body.appendChild(wrapper);
        }
}

let pageSpecial = null;
$(function() {
        pageSpecial =  new PageSpecial({
                clearList: ['comment', 'tableauPairRender'],
                parse: ParameterDominoRS.parse,
                generateParameter: ParameterDominoRS.generateParameter,
                type: true,
                });
});
