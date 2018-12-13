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
 * This file stores classes needed to create animations of extended cycles.<br>
 * The main class is the {@link TableauPairCycles} class,
 * which extends {@link TableauPairGrid}.<br>
 * There are also two drawing classes, {@link TableauPairCyclesRendererDOM} and
 * {@link TableauPairRendererAnimateCycle}.<br>
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016 Christian Johnson
 */

"use strict";

/**
 * This class extends {@link TableauPairGrid}.  It adds methods
 * needed to create animations of extended cycles.
 * @extends {TableauPairGrid}
 */
class TableauPairCycles extends TableauPairGrid {
        /**
         * @param {Object} table
         * The first three inputs to the constructor are used to construct a TableauPairGrid.
         * @param {string} table.type - B, C, or D
         * @param {Tableau} table.left - the left tableau of the pair
         * @param {Tableau} table.right - the right tableau of the pair
         * @param {number} table.animationDuration - how long, in milliseconds, the movement
         * of each Domino should take.
         * @param {boolean} [table.inPlace] - If true, the change takes place on the
         * original tableau pair, otherwise, clones are created and shown.
         * @param {boolean} [table.unboxedOnly] - If true, only special squares for
         * unboxed cycles will be shown.  Current uses also have inPlace == true.
         */
        constructor(table) {
                super(table);
                this.left = new TableauCycles({type: this.left.type, tableau: this.left,
                        animationDuration: table.animationDuration, inplace: table.inPlace, unboxedOnly: table.unboxedOnly});
                this.right = new TableauCycles({type: this.right.type, tableau: this.right,
                        animationDuration: table.animationDuration, inplace: table.inPlace, unboxedOnly: table.unboxedOnly});
                /**
                 * how long, in milliseconds, the movement
                 * of each Domino should take.
                 * @type {number}
                 */
                this.animationDuration = table.animationDuration;
                /**
                 * If true, the change takes place on the
                 * original tableau pair, otherwise, clones are created and shown.
                 * @type {boolean}
                 */
                this.inPlace = table.inPlace;
                /**
                 * If true, only special squares for
                 * unboxed cycles will be shown.  Current uses also have inPlace == true.
                 * @type {boolean}
                 */
                this.unboxedOnly = table.unboxedOnly;
                /**
                 * Each tableau will be drawn with its corners and holes,
                 * so this drawing may be wider than the original tableau.  This
                 * member is computed in the {@link TableauPairCyclesRendererDOM}
                 * class and used by the {@link TableauPairRendererAnimateCycle}
                 * class.
                 * @type {Number}
                 */
                this.widthToDraw = 0;
                /**
                 * Each tableau will be drawn with its corners and holes,
                 * so this drawing may be taller than the original tableau.  This
                 * member is computed in the {@link TableauPairCyclesRendererDOM}
                 * class and used by the {@link TableauPairRendererAnimateCycle}
                 * class.
                 * @type {Number}
                 */
                this.heightToDraw = 0;
        }

        /**
         *  makes a deep copy
         *  @return {TableauPairCycles}
         */
        clone() {
                let newTableau = new TableauPairCycles({type: this.left.type, left:
                        this.left.clone(), right: this.right.clone(), animationDuration: this.animationDuration, inPlace:
                        this.inPlace, unboxedOnly: this.unboxedOnly});
                newTableau.widthToDraw = this.widthToDraw;
                newTableau.heightToDraw = this.heightToDraw;
                return newTableau;
        }

        /**
         * This function is the click handler for clicking on
         * the back square of a cycle in the left tableau.
         * @param {Square} backSquare - the back square of the cycle
         * @param {string[]} highlightPair - the highlights to use for the
         * left and right tableau
         */
        drawAnimateMoveOpenExtendedCycleLeft(backSquare, highlightPair) {
                let tableauPair = this;
                let animateCycleInfo = this.getTableauPairToAnimateMoveOpenExtendedCycleLeft(backSquare);
                animateCycleInfo.highlightPair = highlightPair;
                animateCycleInfo.leftFirst = true;
                let animationData = new TableauPairRendererAnimateCycle(animateCycleInfo).getDOMAndAnimation();
                let length = this.displayAnimation(animationData, this.animationDuration);

                if (this.inPlace) {
                        setTimeout(function() {
                                tableauPair.moveOpenExtendedCycleLeft(backSquare);
                                Page.clearItems('tableauRender');
                                tableauPair.drawWithSpecialSquares();
                        }, (length + 1) * this.animationDuration);
                }

        }

        /**
         * This function is the click handler for clicking on
         * the back square of a cycle in the right tableau.
         * @param {Square} backSquare - the back square of the cycle
         * @param {string[]} highlightPair - the highlights to use for the
         * left and right tableau
         */
        drawAnimateMoveOpenExtendedCycleRight(backSquare, highlightPair) {
                let tableauPair = this;
                let animateCycleInfo = this.getTableauPairToAnimateMoveOpenExtendedCycleRight(backSquare);
                animateCycleInfo.highlightPair = highlightPair;
                animateCycleInfo.leftFirst = false;
                let animationData = new TableauPairRendererAnimateCycle(animateCycleInfo).getDOMAndAnimation();
                let length = this.displayAnimation(animationData, this.animationDuration);

                if (this.inPlace) {
                        setTimeout(function() {
                                tableauPair.moveOpenExtendedCycleRight(backSquare);
                                Page.clearItems('tableauRender');
                                tableauPair.drawWithSpecialSquares();
                        }, (length + 1) * this.animationDuration);
                }

        }

        /**
         * This function is the click handler for clicking on
         * the forward square of a cycle in the left tableau.
         * @param {Square} forwardSquare - the forward square of the cycle
         * @param {string[]} highlightPair - the highlights to use for the
         * left and right tableau
         */
        drawAnimateMoveOpenExtendedCycleToSquareLeft(forwardSquare, highlightPair) {
                let tableauPair = this;
                let animateCycleInfo = this.getTableauPairToAnimateMoveOpenExtendedCycleToSquareLeft(forwardSquare);
                animateCycleInfo.highlightPair = highlightPair;
                animateCycleInfo.leftFirst = true;
                let animationData = new TableauPairRendererAnimateCycle(animateCycleInfo).getDOMAndAnimation();
                let length = this.displayAnimation(animationData, this.animationDuration);

                if (this.inPlace) {
                        setTimeout(function() {
                                tableauPair.moveOpenExtendedCycleToSquareLeft(forwardSquare);
                                Page.clearItems('tableauRender');
                                tableauPair.drawWithSpecialSquares();
                        }, (length + 1) * this.animationDuration);
                }

        }

        /**
         * This function is the click handler for clicking on
         * the forward square of a cycle in the right tableau.
         * @param {Square} forwardSquare - the forward square of the cycle
         * @param {string[]} highlightPair - the highlights to use for the
         * left and right tableau
         */
        drawAnimateMoveOpenExtendedCycleToSquareRight(forwardSquare, highlightPair) {
                let tableauPair = this;
                let animateCycleInfo = this.getTableauPairToAnimateMoveOpenExtendedCycleToSquareRight(forwardSquare);
                animateCycleInfo.highlightPair = highlightPair;
                animateCycleInfo.leftFirst = false;
                let animationData = new TableauPairRendererAnimateCycle(animateCycleInfo).getDOMAndAnimation();
                let length = this.displayAnimation(animationData, this.animationDuration);

                if (this.inPlace) {
                        setTimeout(function() {
                                tableauPair.moveOpenExtendedCycleToSquareRight(forwardSquare);
                                Page.clearItems('tableauRender');
                                tableauPair.drawWithSpecialSquares();
                        }, (length + 1) * this.animationDuration);
                }

        }

        /**
         * This is a helper method for
         * {@link TableauPairCycles#drawAnimateMoveOpenExtendedCycleLeft} and
         * the other three similar methods.
         * @param {Object} animationData - this object is returned by
         * {@link TableauPairRendererAnimateCycle#getDOMAndAnimation}
         * @return {number} the length of the Array of
         * animation functions
         */
        displayAnimation(animationData) {
                let animationDuration = this.animationDuration;
                let { wrapper, animateFunctionList } = animationData;
                if (this.inPlace) {
                        Page.clearItems('tableauPairRender');
                }

                document.body.appendChild(wrapper);
                let length = animateFunctionList.length;
                for (let index = 0; index < length; ++index) {
                        setTimeout(animateFunctionList[index], (index + 1) * animationDuration);
                }

                return length;
        }

        /**
         * This function optionally clones the tableau pair, and then computes the
         * procedure of moving through an extended cycle specified by the back square
         * of one of its cyles in the left tableau,
         * on the tableau (cloned or original).  However, instead of moving the Dominos,
         * it stores the information of how the Domino would move (slide or rotate)
         * in the Domino, for each Domino that would have been moved.
         * @param {Square} backSquare - the back square of the extended cycle
         * @return {Object} { tableauPairToAnimate :{@link TableauPairCycles},
         * movedDominosLeft: {@link Array.<Array.<Domino>>},
         * movedDominosRight: {@link Array.<Array.<Domino>>}}<br>
         * <code>tableauPairToAnimate</code> stores the original or cloned tableau pair,
         * with animation information in it.<br>
         * <code>movedDominosLeft</code> contains one array of Dominos for each cycle
         * in the left tableau which is part of the extended cycle.<br>
         * <code>movedDominosRight</code> contains one array of Dominos for each cycle
         * in the right tableau which is part of the extended cycle.
         */
        getTableauPairToAnimateMoveOpenExtendedCycleLeft(backSquare) {
                let tableauPairToAnimate = this.clone();
                let currentBackSquare = backSquare.clone();
                let movedDominosLeft = [];
                let movedDominosRight = [];
                while (true) {
                        let moveDataLeft =
                                tableauPairToAnimate.left.getTableauToAnimateMoveOpenCycle(currentBackSquare, true);
                        movedDominosLeft.push(moveDataLeft.movedDominos);
                        tableauPairToAnimate.left = moveDataLeft.tableauToAnimate;
                        let moveDataRight =
                                tableauPairToAnimate.right.getTableauToAnimateMoveOpenCycleToSquare(moveDataLeft.forwardSquare, true);
                        movedDominosRight.push(moveDataRight.movedDominos);
                        tableauPairToAnimate.right = moveDataRight.tableauToAnimate;
                        let newBackSquare = moveDataRight.backSquare;
                        if (newBackSquare.equals(backSquare)) {
                                break;
                        }

                        currentBackSquare = newBackSquare;
                }

                return { tableauPairToAnimate, movedDominosLeft, movedDominosRight };
        }

        /**
         * This function optionally clones the tableau pair, and then computes the
         * procedure of moving through an extended cycle specified by the back square
         * of one of its cyles in the right tableau,
         * on the tableau (cloned or original).  However, instead of moving the Dominos,
         * it stores the information of how the Domino would move (slide or rotate)
         * in the Domino, for each Domino that would have been moved.
         * @param {Square} backSquare - the back square of the extended cycle
         * @return {Object} { tableauPairToAnimate :{@link TableauPairCycles},
         * movedDominosLeft: {@link Array.<Array.<Domino>>},
         * movedDominosRight: {@link Array.<Array.<Domino>>}}<br>
         * <code>tableauPairToAnimate</code> stores the original or cloned tableau pair,
         * with animation information in it.<br>
         * <code>movedDominosLeft</code> contains one array of Dominos for each cycle
         * in the left tableau which is part of the extended cycle.<br>
         * <code>movedDominosRight</code> contains one array of Dominos for each cycle
         * in the right tableau which is part of the extended cycle.
         */
        getTableauPairToAnimateMoveOpenExtendedCycleRight(backSquare) {
                let tableauPairToAnimate = this.clone();
                let currentBackSquare = backSquare.clone();
                let movedDominosLeft = [];
                let movedDominosRight = [];
                while (true) {
                        let moveDataRight =
                                tableauPairToAnimate.right.getTableauToAnimateMoveOpenCycle(currentBackSquare, true);
                        movedDominosRight.push(moveDataRight.movedDominos);
                        tableauPairToAnimate.right = moveDataRight.tableauToAnimate;
                        let moveDataLeft =
                                tableauPairToAnimate.left.getTableauToAnimateMoveOpenCycleToSquare(moveDataRight.forwardSquare, true);
                        movedDominosLeft.push(moveDataLeft.movedDominos);
                        tableauPairToAnimate.left = moveDataLeft.tableauToAnimate;
                        let newBackSquare = moveDataLeft.backSquare;
                        if (newBackSquare.equals(backSquare)) {
                                break;
                        }

                        currentBackSquare = newBackSquare;
                }

                return { tableauPairToAnimate, movedDominosLeft, movedDominosRight };
        }

        /**
         * This function optionally clones the tableau pair, and then computes the
         * procedure of moving through an extended cycle specified by the forward square
         * of one of its cyles in the left tableau,
         * on the tableau (cloned or original).  However, instead of moving the Dominos,
         * it stores the information of how the Domino would move (slide or rotate)
         * in the Domino, for each Domino that would have been moved.
         * @param {Square} forwardSquare - the forward square of the extended cycle
         * @return {Object} { tableauPairToAnimate :{@link TableauPairCycles},
         * movedDominosLeft: {@link Array.<Array.<Domino>>},
         * movedDominosRight: {@link Array.<Array.<Domino>>}}<br>
         * <code>tableauPairToAnimate</code> stores the original or cloned tableau pair,
         * with animation information in it.<br>
         * <code>movedDominosLeft</code> contains one array of Dominos for each cycle
         * in the left tableau which is part of the extended cycle.<br>
         * <code>movedDominosRight</code> contains one array of Dominos for each cycle
         * in the right tableau which is part of the extended cycle.
         */
        getTableauPairToAnimateMoveOpenExtendedCycleToSquareLeft(forwardSquare) {
                let tableauPairToAnimate = this.clone();
                let currentForwardSquare = forwardSquare.clone();
                let movedDominosLeft = [];
                let movedDominosRight = [];
                while (true) {
                        let moveDataLeft =
                                tableauPairToAnimate.left.getTableauToAnimateMoveOpenCycleToSquare(currentForwardSquare, true);
                        movedDominosLeft.push(moveDataLeft.movedDominos);
                        tableauPairToAnimate.left = moveDataLeft.tableauToAnimate;
                        let moveDataRight =
                                tableauPairToAnimate.right.getTableauToAnimateMoveOpenCycle(moveDataLeft.backSquare, true);
                        movedDominosRight.push(moveDataRight.movedDominos);
                        tableauPairToAnimate.right = moveDataRight.tableauToAnimate;
                        let newForwardSquare = moveDataRight.forwardSquare;
                        if (newForwardSquare.equals(forwardSquare)) {
                                break;
                        }

                        currentForwardSquare = newForwardSquare;
                }

                return { tableauPairToAnimate, movedDominosLeft, movedDominosRight };
        }

        /**
         * This function optionally clones the tableau pair, and then computes the
         * procedure of moving through an extended cycle specified by the forward square
         * of one of its cyles in the right tableau,
         * on the tableau (cloned or original).  However, instead of moving the Dominos,
         * it stores the information of how the Domino would move (slide or rotate)
         * in the Domino, for each Domino that would have been moved.
         * @param {Square} forwardSquare - the forward square of the extended cycle
         * @return {Object} { tableauPairToAnimate :{@link TableauPairCycles},
         * movedDominosLeft: {@link Array.<Array.<Domino>>},
         * movedDominosRight: {@link Array.<Array.<Domino>>}}<br>
         * <code>tableauPairToAnimate</code> stores the original or cloned tableau pair,
         * with animation information in it.<br>
         * <code>movedDominosLeft</code> contains one array of Dominos for each cycle
         * in the left tableau which is part of the extended cycle.<br>
         * <code>movedDominosRight</code> contains one array of Dominos for each cycle
         * in the right tableau which is part of the extended cycle.
         */
        getTableauPairToAnimateMoveOpenExtendedCycleToSquareRight(forwardSquare) {
                let tableauPairToAnimate = this.clone();
                let currentForwardSquare = forwardSquare.clone();
                let movedDominosLeft = [];
                let movedDominosRight = [];
                while (true) {
                        let moveDataRight =
                                tableauPairToAnimate.right.getTableauToAnimateMoveOpenCycleToSquare(currentForwardSquare, true);
                        movedDominosRight.push(moveDataRight.movedDominos);
                        tableauPairToAnimate.right = moveDataRight.tableauToAnimate;
                        let moveDataLeft =
                                tableauPairToAnimate.left.getTableauToAnimateMoveOpenCycle(moveDataRight.backSquare, true);
                        movedDominosLeft.push(moveDataLeft.movedDominos);
                        tableauPairToAnimate.left = moveDataLeft.tableauToAnimate;
                        let newForwardSquare = moveDataLeft.forwardSquare;
                        if (newForwardSquare.equals(forwardSquare)) {
                                break;
                        }

                        currentForwardSquare = newForwardSquare;
                }

                return { tableauPairToAnimate, movedDominosLeft, movedDominosRight };
        }

        /**
         * This method uses the {@link TableauPairCyclesRendererDOM}
         * class to draw the tableau pair
         * with their corners and holes highlighted.  In addition, each such
         * special square has a click handler attached, which, when clicked, will
         * draw the animation of the extended cycle corresponding to that square.
         */
        drawWithSpecialSquares() {
                document.body.appendChild(new TableauPairCyclesRendererDOM({tableauPair: this}).renderDOM());
        }

        /**
         * This mwethod alters the {@link TableauPairCycles}, by changing both its
         * left and right tableaux into their associated special tableaux.
         */
        makeSpecial() {
                this.left.makeSpecial();
                this.right.makeSpecial();
        }

        /**
         * This method clones the {@link TableauPairCycles},
         * and then makes the new {@link TableauPairCycles} special.
         * @return {TableauPairCycles} The special {@link TableauPairCycles}
         * associated to this {@link TableauPairCycles}.
         */
        getSpecialTableau() {
                let newTableauPair = this.clone();
                newTableauPair.makeSpecial();
                return newTableauPair;
        }
}

/**
 * Class for drawing a {@link TableauPairCycles} on a webpage.
 * @extends TableauPairRendererDOM
 */
class TableauPairCyclesRendererDOM extends TableauPairRendererDOM {
        /**
         * @param {Object} table
         * @param {TableauPairCycles} table.tableauPair
         * @param {boolean} [table.noClick] Used for pages without animatiom.
         */
        constructor(table) {
                super(table);
                /**
                 * the size of the side of the square
                 * alloted to each square of a Domino, in pixels
                 * @type {Number}
                 */
                this.gridSize = 30;
                /**
                 * Since true for this class, the 2x2 grid will be drawn will
                 * full opacity
                 * @type {Boolean}
                 */
                this.hasGrid = true;
                /**
                 * the x and y coordinates of the top-left corner
                 * of each tableau in relation to the 2x2 grid
                 * @type {Object}
                 */
                this.offset = TableauWithGrid.getOffset(this.tableauPair.left.type);
                /**
                 * If true, the special squares are not clickable.
                 * @type {boolean}
                 */
                this.noClick = table.noClick;
        }

        /**
         * @param {Object} leftWrapper - DOM object representing the left tableau
         * which we are adding the special squares to
         * @param {Object} rightWrapper - DOM object representing the right tableau
         * which we are adding the special squares to
         * @param {TableauPairCycles} tableauPair
         * @param {Object} offset
         * @param {number} gridSize
         * @param {number} initialWidth
         * @param {number} initialHeight
         * @param {boolean} noClick
         * @return {Object} { width, height }, the calculated width and height
         * with the special squares added
         */
        static addSpecialSquares(leftWrapper, rightWrapper, tableauPair, offset, gridSize, initialWidth, initialHeight, noClick) {
                let height = initialHeight;
                let width = initialWidth;
                let unboxedOnly = tableauPair.unboxedOnly;
                let squareList = tableauPair.left.getCornersAndHoles(unboxedOnly);
                for (let square of squareList) {
                // older firefox
                // for (let index = 0, length = squareList.length; index < length; ++index) {
                //         let square = squareList[index];
                        let squareElementLeft = document.createElement('div');
                        squareElementLeft.className = "square";

                        let squareElementRight = document.createElement('div');
                        squareElementRight.className = "square";

                        if (square.type[0] == "F") {
                                squareElementLeft.className += " " + HIGHLIGHT_BACK;
                                if (!noClick) {
                                        $(squareElementLeft).click( function() {
                                                tableauPair.drawAnimateMoveOpenExtendedCycleLeft(square.clone(), [HIGHLIGHT_F, HIGHLIGHT_E])
                                        });
                                }
                                squareElementRight.className += " " + HIGHLIGHT_BACK;
                                if (!noClick) {
                                        $(squareElementRight).click( function() {
                                                tableauPair.drawAnimateMoveOpenExtendedCycleRight(square.clone(), [HIGHLIGHT_E, HIGHLIGHT_F])
                                        });
                                }

                        } else {
                                squareElementLeft.className += " " + HIGHLIGHT_FORWARD;
                                if (!noClick) {
                                        $(squareElementLeft).click( function() {
                                                tableauPair.drawAnimateMoveOpenExtendedCycleToSquareLeft(square.clone(), [HIGHLIGHT_E, HIGHLIGHT_F])
                                        });
                                }
                                squareElementRight.className += " " + HIGHLIGHT_FORWARD;
                                if (!noClick) {
                                        $(squareElementRight).click( function() {
                                                tableauPair.drawAnimateMoveOpenExtendedCycleToSquareRight(square.clone(), [HIGHLIGHT_F, HIGHLIGHT_E])
                                        });
                                }
                        }

                        let x = square.x + offset.x;
                        let y = square.y + offset.y;

                        squareElementLeft.style.left = x * gridSize + "px";
                        squareElementLeft.style.top = y * gridSize + "px";
                        squareElementRight.style.left = x * gridSize + "px";
                        squareElementRight.style.top = y * gridSize + "px";

                        let curRight = x + 1;
                        if (width < curRight) { width = curRight; }
                        let curBottom = y + 1;
                        if (height < curBottom) { height = curBottom; }

                        leftWrapper.appendChild(squareElementLeft);
                        rightWrapper.appendChild(squareElementRight);
                }

                return { width, height };
        }

        /**
         * This function creates the DOM element for the {@link TableauPairCycles}.
         * @return {Object} the rendered tableau pair
         * @override
         */
        renderDOM() {
                let leftWrapper = document.createElement('div');
                leftWrapper.className = "tableauRender";

                let leftGridElement = document.createElement('div');
                leftWrapper.appendChild(leftGridElement);

                let rightWrapper = document.createElement('div');
                rightWrapper.className = "tableauRender";

                let rightGridElement = document.createElement('div');
                rightWrapper.appendChild(rightGridElement);

                leftWrapper.className += " tableauRenderLeft";
                rightWrapper.className += " tableauRenderRight";

                let wrapper = document.createElement('div');
                wrapper.className = "tableauPairRender floater";

                wrapper.appendChild(leftWrapper);
                wrapper.appendChild(rightWrapper);

                let width = this.tableauPair.left.getRowLength(0) + this.offset.x;
                let height = this.tableauPair.left.getColumnLength(0) +  this.offset.y;
                for (let domino of this.tableauPair.left.dominoList) {
                        let dominoElement = TableauRendererDOM.makeDominoElement(domino, this.offset, this.gridSize).dominoElement;
                        leftWrapper.appendChild(dominoElement);
                }

                for (let domino of this.tableauPair.right.dominoList) {
                        let dominoElement = TableauRendererDOM.makeDominoElement(domino, this.offset, this.gridSize).dominoElement;
                        rightWrapper.appendChild(dominoElement);
                }

                let newDimensions = TableauPairCyclesRendererDOM.addSpecialSquares(leftWrapper,
                        rightWrapper, this.tableauPair,  this.offset, this.gridSize, width, height, this.noClick);
                width = newDimensions.width;
                height = newDimensions.height;
                width = width % 2 == 0? width: ++width;
                height = height % 2 == 0? height: ++height;

                this.tableauPair.widthToDraw = width;
                this.tableauPair.heightToDraw = height;
                leftWrapper.style.width = width * this.gridSize + "px";
                leftWrapper.style.height = height * this.gridSize + "px";
                rightWrapper.style.width = width * this.gridSize + "px";
                rightWrapper.style.height = height * this.gridSize + "px";

                TableauRendererDOM.fillGridElement(leftGridElement, width, height, this.gridSize, this.hasGrid);
                TableauRendererDOM.fillGridElement(rightGridElement, width, height, this.gridSize, this.hasGrid);

                return wrapper;
        }
}

/**
 *@extends TableauPairRendererDOM
 */
class TableauPairRendererAnimateCycle extends TableauPairRendererDOM {
        /**
         * @param {Object} table
         * @param {TableauPairCycles} table.tableauPairToAnimate - tableau pair
         * with animation information stored in some of its Dominos
         * @param {Domino[][]} table.movedDominosLeft - an Array of Arrays
         * of the Dominos in the cycles of the left tableau
         * @param {Domino[][]} table.movedDominosRight - an Array of Arrays
         * of the Dominos in the cycles of the right tableau
         * @param {string} table.highlightPair - the class names of the CSS classes
         * to add to the rendered dominos in the cycles of the left and right tableaux
         * @param {boolean} table.leftFirst - if true, the animation starts on the left
         */
        constructor(table) {
                super({tableauPair: table.tableauPairToAnimate});
                /**
                 * an Array of Arrays
                 * of the Dominos in the cycles of the left tableau
                 * @type {Domino[][]}
                 */
                this.movedDominosLeft = table.movedDominosLeft;
                /**
                 * an Array of Arrays
                 * of the Dominos in the cycles of the right tableau
                 * @type {Domino[][]}
                 */
                this.movedDominosRight = table.movedDominosRight;
                /**
                 * the class name of the CSS classes
                 * to add to the rendered dominos in the cycles of the left tableaux
                 * @type {string}
                 */
                this.highlightLeft = table.highlightPair[0];
                /**
                 * the class name of the CSS classes
                 * to add to the rendered dominos in the cycles of the right tableaux
                 * @type {string}
                 */
                this.highlightRight = table.highlightPair[1];
                /**
                 * how long, in milliseconds, the movement
                 * of each Domino should take
                 * @type {number}
                 */
                this.animationDuration = table.tableauPairToAnimate.left.animationDuration;
                /**
                 * if true, the animation starts on the left
                 * @type {boolean}
                 */
                this.leftFirst = table.leftFirst;
                /**
                 * the width of the grid, in number of squares
                 * @type {number}
                 */
                this.widthToDraw = table.tableauPairToAnimate.widthToDraw;
                /**
                 * the height of the grid, in number of squares
                 * @type {number}
                 */
                this.heightToDraw = table.tableauPairToAnimate.heightToDraw;
                /**
                 * the size of the side of the square
                 * alloted to each square of a Domino, in pixels
                 * @type {Number}
                 */
                this.gridSize = 30;
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
                this.offset = TableauWithGrid.getOffset(this.tableauPair.left.type);
        }

         /**
          * @return {Object} {wrapper: {@link Object}, animateList: {@link Array.<function>}}<br>
          * the DOM object and an Array of animation functions
          */
        getDOMAndAnimation() {
                let animationDuration = this.animationDuration;
                let type = this.tableauPair.left.type;
                let leftWrapper = document.createElement('div');
                leftWrapper.className = "tableauRender";

                let leftGridElement = document.createElement('div');
                leftWrapper.appendChild(leftGridElement);

                let leftDominoHolder = document.createElement('div');
                leftDominoHolder.className = "dominoHolder";
                leftWrapper.appendChild(leftDominoHolder);

                let rightWrapper = document.createElement('div');
                rightWrapper.className = "tableauRender";

                let rightGridElement = document.createElement('div');
                rightWrapper.appendChild(rightGridElement);

                let rightDominoHolder = document.createElement('div');
                rightDominoHolder.className = "dominoHolder";
                rightWrapper.appendChild(rightDominoHolder);

                leftWrapper.className += " tableauRenderLeft";
                rightWrapper.className += " tableauRenderRight";

                let wrapper = document.createElement('div');
                wrapper.className = "tableauPairRender floater";
                wrapper.className += " cycleAnimation";

                wrapper.appendChild(leftWrapper);
                wrapper.appendChild(rightWrapper);

                for (let domino of this.tableauPair.left.dominoList) {
                        if (domino.newX != undefined || domino.newY != undefined || domino.rotate != undefined  || (domino.zero && domino.marked)) {
                                continue;
                        }

                        let dominoElement = TableauRendererDOM.makeDominoElement(domino, this.offset, this.gridSize).dominoElement;
                        leftDominoHolder.appendChild(dominoElement);
                }

                for (let domino of this.tableauPair.right.dominoList) {
                        if (domino.newX != undefined || domino.newY != undefined || domino.rotate != undefined  || (domino.zero && domino.marked)) {
                                continue;
                        }

                        let dominoElement = TableauRendererDOM.makeDominoElement(domino, this.offset, this.gridSize).dominoElement;
                        rightDominoHolder.appendChild(dominoElement);
                }

                let animateFunctionList = [];
                let length = this.movedDominosLeft.length;
                for (let index = 0; index < length; ++index) {
                        let leftList =
                                TableauRendererAnimateCycle.makeAnimateFunctionList(this.tableauPair.left,
                                        this.movedDominosLeft[index], leftDominoHolder, type, this.offset,
                                        this.gridSize, this.highlightLeft);
                        let rightList =
                                TableauRendererAnimateCycle.makeAnimateFunctionList(this.tableauPair.right,
                                        this.movedDominosRight[index], rightDominoHolder, type, this.offset,
                                        this.gridSize, this.highlightRight);
                        if (this.leftFirst) {
                                animateFunctionList = animateFunctionList.concat(leftList);
                                animateFunctionList = animateFunctionList.concat(function() {});
                                animateFunctionList = animateFunctionList.concat(rightList);
                                animateFunctionList = animateFunctionList.concat(function() {});
                        } else {
                                animateFunctionList = animateFunctionList.concat(rightList);
                                animateFunctionList = animateFunctionList.concat(function() {});
                                animateFunctionList = animateFunctionList.concat(leftList);
                                animateFunctionList = animateFunctionList.concat(function() {});
                        }

                }

                let width = this.widthToDraw;
                let height = this.heightToDraw;
                TableauPairCyclesRendererDOM.addSpecialSquares(leftDominoHolder,
                        rightDominoHolder, this.tableauPair,  this.offset,
                        this.gridSize, width, height, true);

                leftWrapper.style.width = width * this.gridSize + "px";
                leftWrapper.style.height = height * this.gridSize + "px";
                rightWrapper.style.width = width * this.gridSize + "px";
                rightWrapper.style.height = height * this.gridSize + "px";

                TableauRendererDOM.fillGridElement(leftGridElement, width, height, this.gridSize, this.hasGrid);
                TableauRendererDOM.fillGridElement(rightGridElement, width, height, this.gridSize, this.hasGrid);

                return {wrapper, animateFunctionList};
        }

}
