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
 * This file contains two classes, {@link TableauAnimate} and
 * {@link TableauRendererAnimate}.<br>
 * The {@link TableauAnimate} class's function is to execute one step of the
 * Domino Robinson-Schensted algorithm in such a way that the Dominos are not moved,
 * but, instead, the new position of every {@link Domino} which would be moved
 * is stored in the {@link Domino}.
 * The {@link TableauRendererAnimate} class then renders the tableau and
 * creates an animation function for every {@link Domino} which is to be moved.
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016 Christian Johnson
 */

"use strict";

/**
 * This class contains static functions to prepare animation objects to be displayed
 * on a webpage.
 */
class TableauAnimate {
        /**
         * This function takes a {@link Tableau} and a number.  It clones the tableau,
         * and then computes the Domino Robinson-Schensted procedure of adding
         * the number to the cloned tableau.  However, instead of moving the Dominos,
         * it stores the new position for each Domino that would have been moved
         * in the Domino. It also updates the original tableau using the Domino
         * Robinson-Schensted procedure.
         * @param {Tableau} tableau - the original tableau
         * @param {number} rsNumber - the (signed) number to add
         * @return {Tableau} the cloned tableau with the Domino
         * Robinson-Schensted information stored in its Dominos.
         */
        static getRSAnimationTableau(tableau, rsNumber) {
                let tableauToAnimate = tableau.clone();
                let m = rsNumber > 0 ? rsNumber: -rsNumber;
                let newDomino;
                if (rsNumber > 0) {
                        let firstRowLength = tableauToAnimate.getRowLength(0);
                        newDomino = new Domino({n: m, x: firstRowLength / 2, y: -2, horizontal: true});
                } else { // rsNumber < 0
                        let firstColumnLength = tableauToAnimate.getColumnLength(0);
                        newDomino = new Domino({n: m, x: -2, y: firstColumnLength / 2, horizontal: false});
                }

                let dominoGrid = tableauToAnimate.dominoGrid;

                function getRowData(y, number) {
                        for (let x = 0; ; x++) {
                                let domino1 = dominoGrid.get(x, y);
                                if (!domino1) {
                                        let rowPosition = {x:x, y:y, horizontal: true};
                                        return {position: rowPosition};
                                }

                                if (domino1.n > number) {
                                        let rowPosition = {x:x, y:y, horizontal: true};
                                        let domino2;
                                        if (domino1.horizontal) {
                                                domino2 = domino1;
                                        } else {
                                                domino2 = dominoGrid.get(x + 1, y);
                                        }

                                        return {position: rowPosition, domino1: domino1, domino2: domino2};
                                }
                        }
                }

                function getColumnData(x, number) {
                        for (let y = 0; ; y++) {
                                let domino1 = dominoGrid.get(x, y);
                                if (!domino1) {
                                        let columnPosition = {x:x, y:y, horizontal: false};
                                        return {position: columnPosition};
                                }

                                if (domino1.n > number) {
                                        let columnPosition = {x:x, y:y, horizontal: false};
                                        let domino2;
                                        if (!domino1.horizontal) {
                                                domino2 = domino1;
                                        } else {
                                                domino2 = dominoGrid.get(x, y + 1);
                                        }

                                        return {position: columnPosition, domino1: domino1, domino2: domino2};
                                }
                        }
                }

                let insertData;
                if (rsNumber > 0) {
                        insertData = getRowData(0, m);
                } else { // rsNumber < 0
                        insertData = getColumnData(0, m);
                }

                let position = insertData.position;
                newDomino.newX = position.x;
                newDomino.newY = position.y;
                // this.insert(newDomino);
                let domino1 = insertData.domino1;
                let domino2 = insertData.domino2;

                while(domino1) {
                        let dominoToAnimate = dominoGrid.get(domino1.x, domino1.y);
                        if (position.horizontal) {
                                if (domino1.horizontal) {
                                        insertData = getRowData(domino1.y + 1, domino1.n);
                                        position = insertData.position;
                                        dominoToAnimate.newX = position.x;
                                        dominoToAnimate.newY = position.y;
                                        domino1 = insertData.domino1;
                                        domino2 = insertData.domino2;
                                } else { // position.horizontal, !domino1.horizontal
                                        let nextDomino = dominoGrid.get(position.x + 1, position.y + 1);
                                        dominoToAnimate.rotate = true;
                                        position.x += 1;
                                        position.horizontal = false;
                                        domino1 = domino2;
                                        domino2 = nextDomino;
                                }
                        } else { // !position.horizontal
                                if (!domino1.horizontal) {
                                        insertData = getColumnData(domino1.x + 1, domino1.n);
                                        position = insertData.position;
                                        dominoToAnimate.newX = position.x;
                                        dominoToAnimate.newY = position.y;
                                        domino1 = insertData.domino1;
                                        domino2 = insertData.domino2;
                                } else { // !position.horizontal, domino1.horizontal
                                        let nextDomino = dominoGrid.get(position.x + 1, position.y + 1);
                                        dominoToAnimate.rotate = true;
                                        position.y += 1;
                                        position.horizontal = true;
                                        domino1 = domino2;
                                        domino2 = nextDomino;
                                }
                        }
                }

                tableauToAnimate.dominoList.unshift(newDomino);
                tableau.nextRobinsonSchensted(rsNumber);
                return tableauToAnimate;
        }

        /**
         * This function calls {@link TableauAnimate.getRSAnimationTableau} to get a tableau
         * with animation information in it.  It then passes this tableau to the
         * {@link TableauRendererAnimate} class.  The result will be used by the
         * {@link PageAnimate} class to display the animation.
         * @param {Tableau} tableau - the original tableau
         * @param {number} rsNumber - the (signed) number to add to tableau
         * using the Domino Robinson-Schensted procedure.
         * @param {number} animationDuration - how long, in milliseconds, the movement
         * of each Domino should take
         * @return {Object} This object contains a DOM object and an Array of animation
         * functions (returned by {@link TableauRendererAnimate#getDOMAndAnimation}),
         */
        static getAnimationData(tableau, rsNumber, animationDuration)  {
                let tableauToAnimate = TableauAnimate.getRSAnimationTableau(tableau, rsNumber);
                return new TableauRendererAnimate({tableau: tableauToAnimate, animationDuration}).getDOMAndAnimation();
        }
}

/**
 * This class's purpose is to take a Tableau with animation information
 * stored in it and turn it into a DOM representation of the tableau
 * and an Array of animation functions.
 */
class TableauRendererAnimate extends TableauRendererDOM {
        /**
         * @param {Object} table
         * @param {Tableau} table.tableau - a tableau with animation informationm
         * stored in its Dominos
         * @param {number} table.animationDuration - how long, in milliseconds,
         * the movement of each Domino should take
         * @extends TableauRendererDOM
         */
        constructor(table) {
                super(table);
                /**
                 * {x: number, y: number}<br>
                 * The offset is set so that the domino to be added to the tableau
                 * can start above or to the left of the tableau.
                 * @type {Object}
                 */
                this.offset = {x: 2, y: 2};
                /**
                 * how long, in milliseconds,
                 * the movement of each Domino should take
                 * @type {number}
                 */
                this.animationDuration = table.animationDuration;
        }

        /**
         * @return {Object} {wrapper: {@link Object}, animateList: {@link Array.<function>}}<br>
         * wrapper - the original tableau, rendered as a DOM object<br>
         * animateList - an Array of animation functions,
         * one for each Domino which will be moving.
         */
        getDOMAndAnimation() {
                let animateList = [];
                let animateDominoList = [];
                let animateCount = 0;
                let animationDuration = this.animationDuration;
                let wrapper = document.createElement('div');
                wrapper.className = "tableauRenderAnimate";

                let gridHolder = document.createElement('div');
                gridHolder.className = "gridHolder";
                let gridElement = document.createElement('div');
                gridHolder.appendChild(gridElement);
                wrapper.appendChild(gridHolder);

                let dominoList = this.tableau.dominoList;
                for (let index = dominoList.length - 1; index >= 0; index--) {
                        let domino = dominoList[index];
                        if (domino.newX != undefined || domino.rotate != undefined) {
                                animateDominoList.push(domino);
                                continue;
                        }

                        let dominoElement = this.makeDominoElement(domino).dominoElement;
                        wrapper.appendChild(dominoElement);
                }

                function resetHorizontal(elem) {
                        elem.removeClass('dominoRotateRS')
                            .removeClass('dominoHorizontal')
                            .addClass('dominoVertical')
                            .css( 'left', '+=30px' )
                            .css("transform","");
                }


                function resetVertical(elem) {
                        elem.removeClass('dominoRotateRS')
                            .removeClass('dominoVertical')
                            .addClass('dominoHorizontal')
                            .css( 'top', '+=30px' )
                            .css("transform","");
                }

                function resetText(elem) {
                        elem.css("transform","");
                }

                for (let domino of animateDominoList) {
                        let { dominoElement, dominoText} = this.makeDominoElement(domino);
                        let animateFunction;
                        if (domino.rotate) {
                                if (domino.horizontal) {
                                        animateFunction = function() {
                                                $(dominoElement).addClass('dominoRotateRS');
                                                $(dominoElement).rotate({duration: animationDuration, angle:0, animateTo:-90, center: ["75%", "50%"],
                                                        callback: function() { resetHorizontal($(dominoElement)); }});
                                                $(dominoText).rotate({duration: animationDuration, angle:0, animateTo:90, center: ["50%", "50%"],
                                                        callback: function() { resetText($(dominoText)); }});
                                        };
                                } else { // !domino.horizontal
                                        animateFunction = function() {
                                                $(dominoElement).addClass('dominoRotateRS');
                                                $(dominoElement).rotate({duration: animationDuration, angle:0, animateTo:90, center: ["50%", "75%"],
                                                        callback: function() { resetVertical($(dominoElement)); }});
                                                $(dominoText).rotate({duration: animationDuration, angle:0, animateTo:-90, center: ["50%", "50%"],
                                                        callback: function() { resetText($(dominoText)); }});
                                        };
                                }
                        } else {
                                let newX = domino.newX + this.offset.x;
                                let newY = domino.newY + this.offset.y;
                                let newLeft = newX * this.gridSize + "px";
                                let newTop = newY * this.gridSize + "px";
                                animateFunction = function() {
                                        $(dominoElement).addClass('dominoMoveRS');
                                        $(dominoElement)
                                        .animate({ left: newLeft, top: newTop }, animationDuration, 'linear',
                                                function() {$(dominoElement).removeClass('dominoMoveRS');});
                                };
                        }

                        animateList.unshift(animateFunction);
                        wrapper.appendChild(dominoElement);
                }

                let width = this.tableau.getRowLength(0) + 2;
                let height = this.tableau.getColumnLength(0) + 2;
                width = width % 2 == 0? width: ++width;
                height = height % 2 == 0? height: ++height;
                wrapper.style.width = (width + this.offset.x) * this.gridSize + "px";
                wrapper.style.height = (height + this.offset.y) * this.gridSize + "px";

                this.fillGridElement(gridElement, width, height);

                return {wrapper, animateList};
        }
}
