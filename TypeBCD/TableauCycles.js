/**
 MIT License

 Copyright (c) 2016-2018 Devra Garfinkle Johnson
 Copyright (c) 2016-2018 Christian Johnson

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
 * This file stores classes needed to create animations of cycles.<br>
 * The main class is the {@link TableauCycles} class, which extends
 * {@link TableauWithGrid}.<br>
 * There are also two drawing classes, {@link TableauCyclesRendererDOM} and
 * {@link TableauRendererAnimateCycle}.<br>
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016-2018 Christian Johnson
 */

"use strict";

const HIGHLIGHT_E = 'dominoHighlighted4';
const HIGHLIGHT_F = 'dominoHighlighted2';
const HIGHLIGHT_FORWARD = 'squareHighlighted2';
const HIGHLIGHT_BACK = 'squareHighlighted1';


/**
 * This class extends {@link TableauWithGrid}.  It adds methods
 * needed to create animations of cycles.
 * @extends {TableauWithGrid}
 */
class TableauCycles extends TableauWithGrid {
        /**
         * @param {Object} table
         * The first two inputs to the constructor are used to construct a TableauWithGrid.
         * @param {string} table.type - B, C, or D
         * @param {Object} [table.tableau] - a Tableau to be copied.
         * @param {Object} [table.dominoList] - an Array of Dominos.
         * @param {number} table.animationDuration - how long, in milliseconds, the movement
         * of each Domino should take.
         * @param {boolean} [table.inPlace] - If true, the change takes place on the
         * original tableau, otherwise, clones are created and shown.
         * @param {boolean} [table.unboxedOnly] - If true, only special squares for
         * unboxed cycles will be shown.
         */
        constructor(table) {
                super(table);
                /**
                 * how long, in milliseconds, the movement
                 * of each Domino should take.
                 * @type {number}
                 */
                this.animationDuration = table.animationDuration;
                /**
                 * If true, the change takes place on the
                 * original tableau, otherwise, clones are created and shown.
                 * @type {boolean}
                 */
                this.inPlace = table.inPlace;
                /**
                 * If true, only special squares for
                 * unboxed cycles will be shown.
                 */
                this.unboxedOnly = table.unboxedOnly;
                /**
                 * Each tableau will be drawn with its corners and holes,
                 * so this drawing may be wider than the original tableau.  This
                 * member is computed in the {@link TableauCyclesRendererDOM}
                 * class and used by the {@link TableauRendererAnimateCycle}
                 * class.
                 * @type {Number}
                 */
                this.widthToDraw = 0;
                /**
                 * Each tableau will be drawn with its corners and holes,
                 * so this drawing may be taller than the original tableau.  This
                 * member is computed in the {@link TableauCyclesRendererDOM}
                 * class and used by the {@link TableauRendererAnimateCycle}
                 * class.
                 * @type {Number}
                 */
                this.heightToDraw = 0;
        }

        /**
         *  makes a deep copy
         *  @return {TableauCycles}
         */
        clone() {
                let newTableau = new TableauCycles({type: this.type,
                        dominoList: Domino.cloneList(this.dominoList), animationDuration: this.animationDuration, inPlace: this.inPlace, unboxedOnly: this.unboxedOnly});
                newTableau.widthToDraw = this.widthToDraw;
                newTableau.heightToDraw = this.heightToDraw;
                return newTableau;
        }

        /**
         * This function is the click handler for clicking on
         * the back square of a cycle.
         * @param {Square} backSquare - the back square of the cycle
         * @param {string} highlight - the name of the CSS class
         * to attach to the DOM representations of the dominos in the cycle
         */
        drawAnimateMoveOpenCycle(backSquare, highlight) {
                let tableau = this;
                let animateCycleInfo = this.getTableauToAnimateMoveOpenCycle(backSquare);
                animateCycleInfo.highlight = highlight;
                let animationData = new TableauRendererAnimateCycle(animateCycleInfo).getDOMAndAnimation();
                let length = this.displayAnimation(animationData);

                if (this.inPlace) {
                        setTimeout(function() {
                                tableau.moveOpenCycle(backSquare);
                                Page.clearItems('tableauRender');
                                tableau.drawWithSpecialSquares();
                        }, (length + 1) * this.animationDuration);
                }

        }

        /**
         * This function is the click handler for clicking on
         * the forward square of a cycle.
         * @param {Square} forwardSquare - the forward square of the cycle
         * @param {string} highlight - the name of the CSS class
         * to attach to the DOM representations of the dominos in the cycle
         */
        drawAnimateMoveOpenCycleToSquare(forwardSquare, highlight) {
                let tableau = this;
                let animateCycleInfo = this.getTableauToAnimateMoveOpenCycleToSquare(forwardSquare);
                animateCycleInfo.highlight = highlight;
                let animationData = new TableauRendererAnimateCycle(animateCycleInfo).getDOMAndAnimation();
                let length = this.displayAnimation(animationData);
                if (this.inPlace) {
                        setTimeout(function() {
                                tableau.moveOpenCycleToSquare(forwardSquare);
                                Page.clearItems('tableauRender');
                                tableau.drawWithSpecialSquares();
                        }, (length + 1) * this.animationDuration);
                }
        }

        /**
         * This is a helper method for
         * {@link TableauCycles#drawAnimateMoveOpenCycle} and
         * {@link TableauCycles#drawAnimateMoveOpenCycleToSquare}.
         * @param {Object} animationData - this object is returned by
         * {@link TableauRendererAnimateCycle#getDOMAndAnimation}
         * @return {number} the length of the Array of
         * animation functions
         */
        displayAnimation(animationData) {
                let animationDuration = this.animationDuration;
                let { wrapper, animateFunctionList } = animationData;
                if (this.inPlace) {
                        Page.clearItems('tableauRender');
                }

                document.body.appendChild(wrapper);
                let length = animateFunctionList.length;
                for (let index = 0; index < length; ++index) {
                        setTimeout(animateFunctionList[index], (index + 1) * animationDuration);
                }

                return length;
        }

        /**
         * This function optionally clones the tableau, and then computes the
         * procedure of moving through a cycle specified by its back square
         * on the tableau (cloned or original).  However, instead of moving the Dominos,
         * it stores the information of how the Domino would move (slide or rotate)
         * in the Domino, for each Domino that would have been moved.
         * @param {Square} backSquare - the back square of the cycle
         * @param {boolean} noClone - if true, operate on the original tableau,
         * otherwise, make a clone, operate on it, and return the clone
         * @return {Object} {tableauToAnimate: {@link TableauCycles},
         * movedDominos: {@link Array<Domino>}, forwardSquare: {@link Square}}<br>
         * The returned object stores the original or cloned tableau,
         * with animation information in it,
         * an Array of the Dominos in the cycle, and the forward square of the cycle.
         */
        getTableauToAnimateMoveOpenCycle(backSquare, noClone) {
                let tableauToAnimate;
                if (noClone) {
                        tableauToAnimate = this;
                } else {
                        tableauToAnimate = this.clone();
                }

                let movedDominos = [];

                let dominoGrid = tableauToAnimate.dominoGrid;
                let square = backSquare.clone();//{x: backSquare.x, y: backSquare.y};
                let boxed = this.getGridSubPosition(square) == "W";
                if (square.x == 0 && square.y == 0) {
                        boxed = true;
                        let zeroDomino = Domino.makeZero();
                        movedDominos.push(zeroDomino);
                }

                let domino = dominoGrid.get(square.x, square.y);
                do {
                        let fixedSquare = this.getFixedSquare(domino);
                        let x = fixedSquare.x;
                        let y = fixedSquare.y;
                        let gridSubPosition = this.getGridSubPosition(fixedSquare);
                        if ( (boxed && gridSubPosition == "Y") || (!boxed && gridSubPosition == "Z") ) {
                                let comp = y == 0 ? null : dominoGrid.get(x + 1, y - 1);
                                if (y == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x + 1;
                                        square.y = y;
                                        let nextDomino = dominoGrid.get(square.x, square.y);
                                        if (domino.horizontal) {
                                                domino.newX = x;
                                        } else {
                                                domino.rotate = "top";
                                        }

                                        movedDominos.push(domino);
                                        if (!nextDomino) break;
                                        domino = nextDomino;
                                } else {
                                        square.x = x;
                                        square.y = y - 1;
                                        let nextDomino = dominoGrid.get(square.x, square.y);
                                        if (!domino.horizontal) {
                                                domino.newY = y - 1;
                                        } else {
                                                domino.rotate = "right";
                                        }

                                        movedDominos.push(domino);
                                        domino = nextDomino;
                                        if (domino.zero) {
                                                domino.marked = true;
                                                movedDominos.push(domino);
                                                break;
                                        }
                                }
                        } else {
                                let comp = x == 0 ? null : dominoGrid.get(x - 1, y + 1);
                                if (x == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x;
                                        square.y = y + 1;
                                        let nextDomino = dominoGrid.get(square.x, square.y);
                                        if (!domino.horizontal) {
                                                domino.newY = y;
                                        } else {
                                                domino.rotate = "left";
                                        }

                                        movedDominos.push(domino);
                                        if (!nextDomino) break;
                                        domino = nextDomino;
                                } else {
                                        square.x = x - 1;
                                        square.y = y;
                                        let nextDomino = dominoGrid.get(square.x, square.y);
                                        if (domino.horizontal) {
                                                domino.newX = x - 1;
                                        } else {
                                                domino.rotate = "bottom";
                                        }

                                        movedDominos.push(domino);
                                        domino = nextDomino;
                                        if (domino.zero) {
                                                movedDominos.push(domino);
                                                domino.marked = true;
                                                break;
                                        }
                                }
                        }
                } while (true);

                let forwardSquare = square;
                return {tableauToAnimate, movedDominos, forwardSquare};
        }

        /**
         * This function optionally clones the tableau, and then computes the
         * procedure of moving through a cycle specified by its forward square
         * on the tableau (cloned or original).  However, instead of moving the Dominos,
         * it stores the information of how the Domino would move (slide or rotate)
         * in the Domino, for each Domino that would have been moved.
         * @param {Square} forwardSquare - the forward square of the cycle.
         * @param {boolean} noClone - if true, operate on the original tableau,
         * otherwise, make a clone, operate on it, and return the clone
         * @return {Object} {tableauToAnimate: {@link TableauCycles},
         * movedDominos: {@link Array<Domino>}, backSquare: {@link Square}}<br>
         * The returned object stores the original or cloned tableau,
         * with animation information in it,
         * an Array of the Dominos in the cycle, and the back square of the cycle.
         */
        getTableauToAnimateMoveOpenCycleToSquare(forwardSquare, noClone) {
                let tableauToAnimate;
                if (noClone) {
                        tableauToAnimate = this;
                } else {
                        tableauToAnimate = this.clone();
                }

                let movedDominos = [];
                let dominoGrid = tableauToAnimate.dominoGrid;
                let square = forwardSquare.clone();//{x: forwardSquare.x, y: forwardSquare.y};
                let boxed = this.getGridSubPosition(square) == "X";
                if (square.x == 0 && square.y == 0) {
                        boxed = true;
                        let zeroDomino = dominoGrid.get(0, 0);
                        zeroDomino.marked = true;
                        movedDominos.push(zeroDomino);
                }

                let domino;
                do {
                        let x = square.x;
                        let y = square.y;
                        let gridSubPosition = this.getGridSubPosition(square);
                        if ((boxed && gridSubPosition == "X") || (!boxed && gridSubPosition == "W" ) ) {
                                let choice1 = y == 0 ? null : dominoGrid.get(x, y - 1);
                                let choice2 = x == 0 ? null : dominoGrid.get(x - 1, y);
                                if (!choice1 && !choice2) {
                                        // case x ==0 && y == 0
                                        let zeroDomino = Domino.makeZero();
                                        movedDominos.push(zeroDomino);
                                        break;
                                } else if (!choice2 || (choice1 && (choice1.n > choice2.n))) {  //for later, case x or y equals 0
                                        domino = choice1;
                                        square = this.getVariableSquare(domino);
                                        if (!domino.horizontal) {
                                                domino.newY = y - 1;
                                        } else {
                                                domino.rotate = "left";
                                        }

                                        movedDominos.push(domino);
                                } else {
                                        domino = choice2;
                                        square = this.getVariableSquare(domino);
                                        if (domino.horizontal) {
                                                domino.newX = x - 1;
                                        } else {
                                                domino.rotate = "top";
                                        }

                                        movedDominos.push(domino);
                                }
                        } else {
                                let choice1 = dominoGrid.get(x, y + 1);
                                let choice2 = dominoGrid.get(x + 1, y);
                                if (!choice1 && !choice2) {
                                        break;
                                } else if (!choice2 || (choice1 && (choice1.n < choice2.n))) {
                                        domino = choice1;
                                        square = this.getVariableSquare(domino);
                                        if (!domino.horizontal) {
                                                domino.newY = y;
                                        } else {
                                                domino.rotate = "right";
                                        }

                                        movedDominos.push(domino);
                                } else {
                                        domino = choice2;
                                        square = this.getVariableSquare(domino);
                                        if (domino.horizontal) {
                                                domino.newX = x;
                                        } else {
                                                domino.rotate = "bottom";
                                        }

                                        movedDominos.push(domino);
                                }
                        }
                } while (true);

                let backSquare = square;
                return {tableauToAnimate, movedDominos, backSquare};
        }

        /**
         * This method finds the corners and holes of the {@link TableauWithGrid}.
         * @param {boolean} [unboxedOnly] - if true, only get the unboxed
         * corners and holes
         * @return {Square[]} the list of corners and holes
         */
        getCornersAndHoles(unboxedOnly) {
                let squareList = [];
                let c0 = this.getColumnLength(0);
                let currentRowLength = this.getRowLength(0);
                let square;
                let boxedOK = !unboxedOnly;
                if (this.type == "C" && boxedOK) {
                        square = new Square({x: 0, y: 0});
                        square.type = "FH";
                        squareList.push(square)
                } else if (this.type == "B" && boxedOK) {
                        square = new Square({x: 0, y: 0});
                        square.type = "EC";
                        squareList.push(square)
                }

                let x = currentRowLength - 1;
                let gridSubPosition = this.getGridSubPosition({x: x, y: 0});
                if (gridSubPosition == "Y" && boxedOK) {
                        // empty corner
                        square = new Square({x: x + 1, y: 0});
                        square.type = "EC";
                        squareList.push(square);
                } else if (gridSubPosition == "Z") {
                        // empty hole
                        square = new Square({x: x + 1, y: 0});
                        square.type = "EH";
                        squareList.push(square);
                }

                for (let y = 0; y <= c0; y++) {
                        let nextRowLength = this.getRowLength(y + 1);
                        if (nextRowLength < currentRowLength) {
                                // check for filled corner or filled hole
                                let x = currentRowLength - 1;
                                let gridSubPosition = this.getGridSubPosition({x: x, y: y});
                                if (gridSubPosition == "X") {
                                        // filled corner
                                        square = new Square({x: x, y: y});
                                        square.type = "FC";
                                        squareList.push(square);
                                } else if (gridSubPosition == "W" && boxedOK) {
                                        // filled hole
                                        square = new Square({x: x, y: y});
                                        square.type = "FH";
                                        squareList.push(square);
                                }

                                // check for empty corner or hole
                                let x_next = nextRowLength;
                                let gsp_next = this.getGridSubPosition({x: x_next, y: y + 1});
                                if (gsp_next == "X" && boxedOK) {
                                        // empty corner
                                        square = new Square({x: x_next, y: y + 1});
                                        square.type = "EC";
                                        squareList.push(square);
                                } else if (gsp_next == "W") {
                                        // empty hole
                                        square = new Square({x: x_next, y: y + 1});
                                        square.type = "EH";
                                        squareList.push(square);
                                }
                        }

                        currentRowLength = nextRowLength;
                }

                return squareList;
        }

        /**
         * This is a helper method for {@link TableauCycles#getCycleArray}.
         * This function gets the forward square of an open cycle
         * specified by its back square,
         * and an array of the dominos in the open cycle.
         * In addition, it marks the dominos in the cycle.
         * @param {Square} backSquare - the back square of the cycle
         * @return {Object} {forwardSquare: {@link Square}, cycleDominos: {@link Array.<Domino>}}<br>
         * forwardSquare - the forward square of the cycle <br>
         * cycleDominos - an array of the Dominos in the cycle
         */
        getForwardSquareAndCycle(backSquare) {
                let cycleDominos = [];
                function addDominoToCycleList(domino) {
                        domino.mark = true;
                        cycleDominos.push(domino);
                }

                let dominoGrid = this.dominoGrid;
                let square = backSquare.clone();
                let boxed = this.getGridSubPosition(square) == "W";
                if (square.x == 0 && square.y ==0 ) {
                        boxed = true;
                }

                let domino = dominoGrid.get(square.x, square.y);

                do {
                        let fixedSquare = this.getFixedSquare(domino);
                        let x = fixedSquare.x;
                        let y = fixedSquare.y;
                        let gridSubPosition = this.getGridSubPosition(fixedSquare);
                        if ( (boxed && gridSubPosition == "Y") || (!boxed && gridSubPosition == "Z") ) {
                                let comp = y == 0 ? null : dominoGrid.get(x + 1, y - 1);
                                if (y == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x + 1;
                                        square.y = y;
                                        let nextDomino = dominoGrid.get(square.x, square.y);

                                        addDominoToCycleList(domino);
                                        if (!nextDomino) {
                                                break;
                                        }

                                        domino = nextDomino;
                                } else {
                                        square.x = x;
                                        square.y = y - 1;
                                        let nextDomino = dominoGrid.get(square.x, square.y);

                                        addDominoToCycleList(domino);
                                        domino = nextDomino;
                                        if (domino.zero) {
                                                addDominoToCycleList(domino);
                                                // bZero = true;
                                                break;
                                        }
                                }
                        } else {
                                let comp = x == 0 ? null : dominoGrid.get(x - 1, y + 1);
                                if (x == 0 || (comp && (comp.n < domino.n))) {
                                        square.x = x;
                                        square.y = y + 1;
                                        let nextDomino = dominoGrid.get(square.x, square.y);

                                        addDominoToCycleList(domino);
                                        if (!nextDomino) {
                                                break;
                                        }

                                        domino = nextDomino;
                                } else {
                                        square.x = x - 1;
                                        square.y = y;
                                        let nextDomino = dominoGrid.get(square.x, square.y);

                                        addDominoToCycleList(domino);
                                        domino = nextDomino;
                                        if (domino.zero) {
                                                addDominoToCycleList(domino);
                                                break;
                                        }
                                }
                        }
                } while (true);

                let forwardSquare = square;
                return {forwardSquare, cycleDominos};
        }

        /**
         * @return {Array.<Object>} There is one object in the returned array for
         * each open cycle in the {@link TableauWithGrid}.<br>
         * The objects are of the form<br>
         * {backSquare: {@link Square}, forwardSquare: {@link Square},
         *  cycleDominos: {@link Array.<Domino>}}.<br>
         * backSquare - the back square of the cycle <br>
         * forwardSquare - the forward square of the cycle <br>
         * cycleDominos - an array of the Dominos in the cycle
         */
        getCycleArray() {
                let cycleArray = [];
                let cornersAndHoles = this.getCornersAndHoles();
                for (let specialSquare of cornersAndHoles) {
                        if (specialSquare.type[0] == "F") {
                                let {forwardSquare, cycleDominos} =
                                        this.getForwardSquareAndCycle(specialSquare);
                                let backSquare = specialSquare;
                                cycleArray.push({backSquare, forwardSquare, cycleDominos});
                         }
                }

                return cycleArray;
        }

        /**
         * This method uses the {@link TableauCyclesRendererDOM} class
         * to draw the tableau with its corners and holes highlighted.
         * In addition, each such special square has an click handler attached,
         * so that the square, when clicked, will draw the animation of the cycle
         * corresponding to that square.
         */
        drawWithSpecialSquares() {
                document.body.appendChild(new TableauCyclesRendererDOM({tableau: this}).renderDOM());
        }

        /**
         * This method uses the {@link TableauHoverCyclesRendererDOM} class
         * to draw the tableau with its corners and holes highlighted.
         * In addition, each such special square has a hover handler attached.
         * When the mouse enters the square, the dominos of its cycle are
         * highlighted.  When the mouse leaves the square,
         * the highlighting is removed.
         */
        drawWithSpecialSquaresHover() {
                document.body.appendChild(new TableauHoverCyclesRendererDOM({tableau: this}).renderDOM());
        }

        /**
         * This mwethod alters the {@link TableauCycles}, by moving it through
         * all its open unboxed cycles.
         * This changes the {@link TableauCycles} into its associated special tableau.
         */
        makeSpecial() {
                let squareList = this.getCornersAndHoles(true);
                for (const square of squareList) {
                        if (square.type == "FC") {
                                this.moveOpenCycle(square);
                        }
                }
        }

        /**
         * This method clones the {@link TableauCycles},
         * and then makes the new {@link TableauCycles} special.
         * @return {TableauCycles} The special {@link TableauCycles}
         * associated to this {@link TableauCycles}.
         */
        getSpecialTableau() {
                let newTableau = this.clone();
                newTableau.makeSpecial();
                return newTableau;
        }
}

/**
 * Class for drawing a {@link TableauCycles} on a webpage.
 * @extends TableauRendererDOM
 */
class TableauCyclesRendererDOM extends TableauRendererDOM {
        /**
         * @param {Object} table
         * @param {TableauCycles} table.tableau
         * @param {boolean} [table.noClick] Used for pages without animatiom.
         */
        constructor(table) {
                super(table);
                /**
                 * Since true for this class, the 2x2 grid will be drawn will
                 * full opacity
                 * @type {Boolean}
                 */
                this.hasGrid = true;
                /**
                 * the x and y coordinates of the top-left corner
                 * of the tableau in relation to the 2x2 grid
                 * @type {Object}
                 */
                this.offset = TableauWithGrid.getOffset(this.tableau.type);
                /**
                 * If true, the special squares are not clickable.
                 * @type {boolean}
                 */
                this.noClick = table.noClick;
        }

        /**
         * @param {Object} wrapper - DOM object representing the tableau
         * which we are adding the special squares to
         * @param {TableauCycles} tableau
         * @param {Object} offset
         * @param {number} gridSize
         * @param {number} initialWidth
         * @param {number} initialHeight
         * @param {boolean} noClick
         * @return {Object} { width, height }, the calculated width and height
         * with the special squares added
         */
        static addSpecialSquares(wrapper, tableau, offset, gridSize, initialWidth, initialHeight, noClick) {
                let height = initialHeight;
                let width = initialWidth;
                let unboxedOnly = tableau.unboxedOnly;
                let squareList = tableau.getCornersAndHoles(unboxedOnly);
                for (let square of squareList) {
                // older firefox
                // for (let index = 0, length = squareList.length; index < length; ++index) {
                //         let square = squareList[index];
                        let squareElement = document.createElement('div');
                        squareElement.className = "square";

                        if (square.type[0] == "F") {
                                squareElement.className += " " + HIGHLIGHT_BACK;
                                if (!noClick) {
                                        $(squareElement).click( function() {
                                                tableau.drawAnimateMoveOpenCycle(square.clone(), HIGHLIGHT_F);
                                        });
                                }
                        } else {
                                squareElement.className += " " + HIGHLIGHT_FORWARD;
                                if (!noClick) {
                                        $(squareElement).click( function() {
                                                tableau.drawAnimateMoveOpenCycleToSquare(square.clone(), HIGHLIGHT_E);
                                        });
                                }
                        }

                        let x = square.x + offset.x;
                        let y = square.y + offset.y;

                        squareElement.style.left = x * gridSize + "px";
                        squareElement.style.top = y * gridSize + "px";

                        let curRight = x + 1;
                        if (width < curRight) { width = curRight; }
                        let curBottom = y + 1;
                        if (height < curBottom) { height = curBottom; }

                        wrapper.appendChild(squareElement);
                }

                return { width, height };
        }

        /**
         * This function creates the DOM element for the {@link TableauCycles}.
         * @return {Object} the rendered tableau
         * @override
         */
        renderDOM() {
                let wrapper = document.createElement('div');
                wrapper.className = "tableauRender floater";

                let gridElement = document.createElement('div');
                wrapper.appendChild(gridElement);

                let width = this.tableau.getRowLength(0) + this.offset.x;
                let height = this.tableau.getColumnLength(0) +  this.offset.y;
                for (let domino of this.tableau.dominoList) {
                        let dominoElement = this.makeDominoElement(domino).dominoElement;
                        wrapper.appendChild(dominoElement);
                }

                let newDimensions = TableauCyclesRendererDOM.addSpecialSquares(wrapper,
                        this.tableau,  this.offset, this.gridSize, width, height, this.noClick);
                width = newDimensions.width;
                height = newDimensions.height;
                width = width % 2 == 0? width: ++width;
                height = height % 2 == 0? height: ++height;
                this.tableau.widthToDraw = width;
                this.tableau.heightToDraw = height;
                wrapper.style.width = width * this.gridSize + "px";
                wrapper.style.height = height * this.gridSize + "px";

                this.fillGridElement(gridElement, width, height);

                return wrapper;
        }
}

/**
 *@extends TableauRendererDOM
 */
class TableauRendererAnimateCycle extends TableauRendererDOM {
        /**
         * @param {Object} table
         * @param {TableauCycles} table.tableauToAnimate - tableau with animation
         * information stored in some of its Dominos
         * @param {Domino[]} table.movedDominos - an Array of the Dominos in the cycle
         * @param {string} table.highlight - the class name of the CSS class
         * to add to the rendered dominos in the cycle
         */
        constructor(table) {
                super({tableau: table.tableauToAnimate});
                /**
                 * an Array of the Dominos in the cycle
                 * @type {Domino[]}
                 */
                this.animateDominoList = table.movedDominos;
                /**
                 * the class name of the CSS class
                 * to add to the rendered dominos in the cycle
                 * @type {string}
                 */
                this.highlight = table.highlight;
                /**
                 * Since true for this class, the 2x2 grid will be drawn will
                 * full opacity
                 * @type {Boolean}
                 */
                this.hasGrid = true;
                /**
                 * the x and y coordinates of the top-left corner
                 * of the tableau in relation to the 2x2 grid
                 * @type {Object}
                 */
                this.offset = TableauWithGrid.getOffset(this.tableau.type);
        }

        /**
         * helper function for
         * {@link TableauRendererAnimateCycle.makeAnimateFunctionList}
         * @param {TableauCycles} tableau
         * @param {Domino} domino
         * @param {Object} dominoElement - the rendered DOM element for this domino
         * @param {Object} dominoText - the rendered text element contained in
         * dominoElement
         * @param {Object} offset
         * @param {number} gridSize
         * @param {string} highlight
         * @return {function} the function to animate this domino
         */
        static makeAnimateFunctionForDominoInCycle(tableau, domino, dominoElement, dominoText, offset, gridSize, highlight) {
                const CENTER_L = "12.5px";
                const CENTER_M = "12.5px";
                const CENTER_H = "42.5px";
                const CENTER_TEXT = "50%"
                const ANGLE = 90;

                function resetHorizontal(elem) {
                        elem.removeClass('dominoHorizontal')
                            .addClass('dominoVertical')
                            .removeClass("dominoMoveCycle")
                            .css("transform","");
                }

                function resetVertical(elem) {
                        elem.removeClass('dominoVertical')
                            .addClass('dominoHorizontal')
                            .removeClass("dominoMoveCycle")
                            .css("transform","");
                }

                function resetRight(elem) {
                        elem.css( 'left', '+=30px' )
                            .css( 'top', '-=30px' );
                }

                function resetBottom(elem) {
                        elem.css( 'left', '-=30px' )
                            .css( 'top', '+=30px' );
                }

                function resetText(elem) {
                        elem.css("transform","");
                }

                let animationDuration = tableau.animationDuration;
                // let highlight = tableau.highlight;
                let type = tableau.type;
                let animateFunction;
                if (domino.zero && type == "C") {
                        $(dominoElement).css("display", "none");
                        animateFunction = function() {
                                $(dominoElement).addClass(highlight).addClass("dominoMoveCycle");
                                $(dominoElement).fadeIn(animationDuration, 'linear');};
                } else if (domino.zero && type == "B") {
                        animateFunction = function() {
                                $(dominoElement).addClass(highlight).addClass("dominoMoveCycle");
                                $(dominoElement).fadeOut(animationDuration, 'linear');};
                } else if (domino.rotate) {
                        let centerX;
                        let centerY;
                        let angle;
                        let callback;
                        switch (domino.rotate) {
                                case "top":
                                        centerX = CENTER_M;
                                        centerY = CENTER_L;
                                        angle = -ANGLE;
                                        callback = function() { resetVertical($(dominoElement)); }
                                        break;
                                case "bottom":
                                        centerX = CENTER_M;
                                        centerY = CENTER_H;
                                        angle = -ANGLE;
                                        callback = function() { resetVertical($(dominoElement)); resetBottom($(dominoElement));}
                                        break;
                                case "left":
                                        centerX = CENTER_L;
                                        centerY = CENTER_M;
                                        angle = ANGLE;
                                        callback = function() { resetHorizontal($(dominoElement)); }
                                        break;
                                case "right":
                                        centerX = CENTER_H;
                                        centerY = CENTER_M;
                                        angle = ANGLE;
                                        callback = function() { resetHorizontal($(dominoElement)); resetRight($(dominoElement));}
                                        break;
                        }

                        animateFunction = function() {
                                $(dominoElement).addClass(highlight).addClass("dominoMoveCycle");
                                $(dominoElement).rotate({duration: animationDuration, angle:0, animateTo: angle, center: [centerX, centerY]
                                        // ,
                                        // callback: callback
                                });
                                $(dominoText).rotate({duration: animationDuration, angle:0, animateTo: -angle, center: [CENTER_TEXT, CENTER_TEXT]
                                        // ,
                                        // callback: function() { resetText($(dominoText)); }
                                });
                        };

                } else if (domino.newX != undefined) {
                        let newX = domino.newX + offset.x;
                        let newLeft = newX * gridSize + "px";
                        animateFunction = function() {
                                $(dominoElement).addClass(highlight).addClass("dominoMoveCycle");
                                $(dominoElement)
                                .animate({ left: newLeft}, animationDuration, 'linear');

                        };
                } else { // domino.newY != undefined
                        let newY = domino.newY + offset.y;
                        let newTop = newY * gridSize + "px";
                        animateFunction = function() {
                                $(dominoElement).addClass(highlight).addClass("dominoMoveCycle");
                                $(dominoElement)
                                .animate({ top: newTop }, animationDuration, 'linear');
                        };
                }

                return animateFunction;
        }

        /**
         * helper function for {@link TableauRendererAnimateCycle#getDOMAndAnimation}
         * @param {TableauCycles} tableau
         * @param {Domino[]} animateDominoList
         * @param {Object} dominoHolder
         * @param {string} type
         * @param {Object} offset
         * @param {number} gridSize
         * @param {string} highlight
         * @return {function[]}
         */
        static makeAnimateFunctionList(tableau, animateDominoList, dominoHolder, type, offset, gridSize, highlight) {
                let animationDuration = tableau.animationDuration;
                let animateFunctionList = [];
                let zeroAtFront;
                let zeroAtEnd;
                if (animateDominoList[0].zero) {
                        zeroAtFront = true;
                } else if (animateDominoList[animateDominoList.length - 1].zero) {
                        zeroAtEnd = true;
                }

                let zeroInList = zeroAtFront || zeroAtEnd;

                animateDominoList.reverse();
                for (let domino of animateDominoList) {
                        let { dominoElement, dominoText} = TableauRendererDOM.makeDominoElement(domino, offset, gridSize);

                        let animateFunction =
                                TableauRendererAnimateCycle.makeAnimateFunctionForDominoInCycle(tableau, domino, dominoElement, dominoText, offset, gridSize, highlight);
                        animateFunctionList.push(animateFunction);
                        dominoHolder.appendChild(dominoElement);
                }

                let animateFunction;
                if (zeroInList && type == "C") {
                        let newTop = gridSize + "px";
                        let newLeft = gridSize + "px";
                        animateFunction = function() {
                                $(dominoHolder)
                                .animate({ top: newTop, left: newLeft }, animationDuration, 'linear');
                        };
                } else if (zeroInList && type == "B") {
                        let newTop = -gridSize + "px";
                        let newLeft = -gridSize + "px";
                        animateFunction = function() {
                                $(dominoHolder)
                                .animate({ top: newTop, left: newLeft }, animationDuration, 'linear');
                        };
                }

                if (zeroAtFront) {
                        animateFunctionList.push(animateFunction);
                }

                animateFunctionList.reverse();
                if (zeroAtEnd) {
                        animateFunctionList.push(animateFunction);
                }

                return animateFunctionList;
        }

        /**
         * @return {Object}
         * {wrapper: {@link Object}, animateFunctionList: {@link Array.<function>}},<br>
         * the DOM object and an Array of animation functions
         */
        getDOMAndAnimation() {
                let animationDuration = this.tableau.animationDuration;
                let type = this.tableau.type;
                let wrapper = document.createElement('div');
                wrapper.className = "tableauRender floater";
                wrapper.className += " cycleAnimation";

                let gridElement = document.createElement('div');
                wrapper.appendChild(gridElement);

                let dominoHolder = document.createElement('div');
                dominoHolder.className = "dominoHolder";
                wrapper.appendChild(dominoHolder);

                for (let domino of this.tableau.dominoList) {
                        if (domino.newX != undefined || domino.newY != undefined || domino.rotate != undefined  || (domino.zero && domino.marked)) {
                                continue;
                        }

                        let dominoElement = this.makeDominoElement(domino).dominoElement;
                        dominoHolder.appendChild(dominoElement);
                }

                let animateFunctionList =
                        TableauRendererAnimateCycle.makeAnimateFunctionList(this.tableau,
                        this.animateDominoList, dominoHolder, type, this.offset,
                        this.gridSize, this.highlight);


                let width = this.tableau.widthToDraw;
                let height = this.tableau.heightToDraw;
                // If animating in place, all special squares are shown
                // even while the animation is running.
                // But, they are not clickable while the animation is running.
                if (this.tableau.inPlace) {
                        TableauCyclesRendererDOM.addSpecialSquares(dominoHolder,
                                this.tableau,  this.offset, this.gridSize, width, height, true);
                }

                wrapper.style.width = width * this.gridSize + "px";
                wrapper.style.height = height * this.gridSize + "px";

                this.fillGridElement(gridElement, width, height);
                return {wrapper, animateFunctionList};
        }
}

class TableauHoverCyclesRendererDOM extends TableauRendererDOM {
        /**
         * @param {Object} table
         * @param {TableauCycles} table.tableau
         */
        constructor(table) {
                super(table);
        }

        /**
         * @param {Object} wrapper - DOM object representing the tableau
         * which we are adding the special squares to
         * @param {number} initialWidth
         * @param {number} initialHeight
         * @return {Object} { width: number, height: number }, the calculated
         * width and height with the special squares added
         */
        addSpecialSquares(wrapper, initialWidth, initialHeight) {
                let height = initialHeight;
                let width = initialWidth;
                let tableau = this.tableau;
                let offset = this.offset;
                let gridSize = this.gridSize;
                let cycleArray = tableau.getCycleArray();

                /**
                 * @param {Object[]} dominoElementList
                 * @param {string} className
                 */
                function addHighlightToDominos(dominoElementList, className) {
                        dominoElementList.forEach((dominoElement) => {
                                $(dominoElement).addClass(className);
                        });
                }

                /**
                 * @param {Object[]} dominoElementList
                 * @param {string} className
                 */
                function removeHighlightFromDominos(dominoElementList, className) {
                        dominoElementList.forEach((dominoElement) => {
                                $(dominoElement).removeClass(className);
                        });
                }

                function makeSquareElement(square, dominoElementList, className) {
                        let squareElement = document.createElement('div');
                        squareElement.className = "square " + className;
                        $(squareElement).hover(
                                function() {
                                        addHighlightToDominos(dominoElementList, className);
                                }, function() {
                                        removeHighlightFromDominos(dominoElementList, className);
                                });

                        let x = square.x + offset.x;
                        let y = square.y + offset.y;

                        squareElement.style.left = x * gridSize + "px";
                        squareElement.style.top = y * gridSize + "px";

                        let curRight = x + 1;
                        if (width < curRight) { width = curRight; }
                        let curBottom = y + 1;
                        if (height < curBottom) { height = curBottom; }

                        wrapper.appendChild(squareElement);
                }

                for (let index = 0; index < cycleArray.length; index++) {
                        let {backSquare, forwardSquare, cycleDominos} = cycleArray[index];

                        let cycleDominoElements = [];
                        for (let domino of cycleDominos) {
                                let dominoElement = this.makeDominoElement(domino).dominoElement;
                                wrapper.appendChild(dominoElement);
                                cycleDominoElements.push(dominoElement);
                        }

                        makeSquareElement(backSquare, cycleDominoElements, HIGHLIGHT_BACK);
                        makeSquareElement(forwardSquare, cycleDominoElements, HIGHLIGHT_FORWARD);

                }

                return { width, height };
        }

        /**
         * @override
         * @return {Object} wrapper, the rendered DOM object
         */
        renderDOM() {
                let wrapper = document.createElement('div');
                wrapper.className = "tableauRender floater";

                let gridElement = document.createElement('div');
                wrapper.appendChild(gridElement);

                let width = this.tableau.getRowLength(0) + this.offset.x;
                let height = this.tableau.getColumnLength(0) +  this.offset.y;

                let newDimensions = this.addSpecialSquares(wrapper, width, height);
                for (let domino of this.tableau.dominoList) {
                        if (!domino.mark) {
                                let dominoElement = this.makeDominoElement(domino).dominoElement;
                                wrapper.appendChild(dominoElement);
                        }
                }

                width = newDimensions.width;
                height = newDimensions.height;
                width = width % 2 == 0? width: ++width;
                height = height % 2 == 0? height: ++height;
                this.tableau.widthToDraw = width;
                this.tableau.heightToDraw = height;
                wrapper.style.width = width * this.gridSize + "px";
                wrapper.style.height = height * this.gridSize + "px";

                this.fillGridElement(gridElement, width, height);

                return wrapper;
        }

}
