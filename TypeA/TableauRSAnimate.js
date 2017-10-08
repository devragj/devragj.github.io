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
  * This file contains two classes, {@link TableauAAnimate} and
  * {@link TableauARendererAnimate}.<br>
  * The {@link TableauAAnimate} class's function is to execute one step of the
  * Robinson-Schensted algorithm in such a way that the Tiles are not moved,
  * but, instead, the new position of every {@link Tile} which would be moved
  * is stored in the {@link Tile}.
  * The {@link TableauARendererAnimate} class then renders the tableau and
  * creates an animation function for every {@link Tile} which is to be moved.
  * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
  * @license MIT license
  */

"use strict";

/**
 * This class contains static functions to prepare animation objects to be displayed
 * on a webpage.
 */
class TableauAAnimate {
        /**
         * This function takes a {@link TableauA} and a number.  It clones the tableau,
         * and then computes the Robinson-Schensted procedure of adding
         * the number to the cloned tableau.  However, instead of moving the Tiles,
         * it stores the new position for each Tile that would have been moved
         * in the Tile. It also updates the original tableau
         * using the Robinson-Schensted procedure.
         * @param {TableauA} tableau - the original tableau
         * @param {number} numberToAdd
         * @return {TableauA} the cloned tableau with the Robinson-Schensted
         * information stored in its Tiles.
         */
        static getRSAnimationTableau(tableau, numberToAdd)  {
                let tableauToAnimate = tableau.clone();
                let firstRowLength = tableauToAnimate.getRowLength(0);
                let newTile = new Tile({n: numberToAdd, x: firstRowLength / 2, y: -2});
                let tileGrid = tableauToAnimate.tileGrid;

                function getRowData(y, number) {
                        for (let x = 0; ; x++) {
                                let tile1 = tileGrid.get(x, y);
                                if (!tile1) {
                                        let rowPosition = {x:x, y:y};
                                        return {position: rowPosition};
                                }

                                if (tile1.n > number) {
                                        let rowPosition = {x:x, y:y};

                                        return {position: rowPosition, tile1: tile1};
                                }
                        }
                }

                let insertData = getRowData(0, numberToAdd);

                let position = insertData.position;
                newTile.newX = position.x;
                newTile.newY = position.y;
                let tile1 = insertData.tile1;
                // this.insert(newTile);

                while(tile1) {
                        let tileToAnimate = tileGrid.get(insertData.tile1.x, insertData.tile1.y);
                        insertData = getRowData(tile1.y + 1, tile1.n);
                        position = insertData.position;
                        tileToAnimate.newX = position.x;
                        tileToAnimate.newY = position.y;
                        //tileGrid.set(position.x, position.y, tile1);
                        tile1 = insertData.tile1;
                }

                tableauToAnimate.tileList.unshift(newTile);
                tableau.nextRobinsonSchensted(numberToAdd);
                return tableauToAnimate;
        }

         /**
          * This function calls {@link TableauAAnimate.getRSAnimationTableau} to get a
          * tableau with animation information in it.  It then passes this tableau to the
          * {@link TableauARendererAnimate} class.  The result will be used by the
          * {@link PageAnimate} class to display the animation.
          * @param {TableauA} tableau - the original tableau
          * @param {number} numberToAdd - the number to add to tableau
          * using the Robinson-Schensted procedure.
          * @param {number} animationDuration - how long, in milliseconds, the movement
          * of each Tile should take
          * @return {Object} This object contains a DOM object and an Array of animation
          * functions (returned by {@link TableauARendererAnimate#getDOMAndAnimation}),
          */
        static getAnimationData(tableau, numberToAdd, animationDuration)  {
                let tableauToAnimate = TableauAAnimate.getRSAnimationTableau(tableau, numberToAdd);
                return new TableauARendererAnimate(tableauToAnimate, animationDuration).getDOMAndAnimation();
        }
}

/**
 * This class's purpose is to take a TableauA with animation information
 * stored in it and turn it into a DOM representation of the tableau
 * and an Array of animation functions.
 * @extends TableauARendererDOM
 */
class TableauARendererAnimate extends TableauARendererDOM {
        /**
         * @param {TableauA} tableau - a tableau with animation informationm
         * stored in its Tiles
         * @param {number} animationDuration - how long, in milliseconds,
         * the movement of each Tile should take
         * @extends TableauARendererDOM
         */
        constructor(tableau, animationDuration) {
                super(tableau)
                /**
                 * {x: number, y: number}<br>
                 * The offset is set so that the tile to be added
                 * to the tableau can start above the tableau.
                 * @type {Object}
                 */
                this.offset = {x: 0, y: 2}
                /**
                 * how long, in milliseconds,
                 * the movement of each Tile should take
                 * @type {number}
                 */
                this.animationDuration = animationDuration;
        }

        /**
         * This is helper function for
         * {@link TableauARendererAnimate#getDOMAndAnimation}
         * which makes the DOM element for one tile in the tableau.
         * @param {Tile} tile - the tile to render
         * @return {Object} the rendered tile
         */
        makeTileElementOffset(tile) {
                let tileElement = document.createElement('div');
                tileElement.className = "tile";

                if (tile.highlight) {
                        tileElement.className += " tileHighlighted" + tile.highlight.toString();
                }

                let x = tile.x + this.offset.x;
                let y = tile.y + this.offset.y;

                tileElement.style.left = x * this.gridSize + "px";
                tileElement.style.top = y * this.gridSize + "px";

                let tileText = document.createElement('div');
                tileText.className = "tileText";
                tileText.innerHTML = tile.n;
                tileElement.appendChild(tileText);

                return tileElement;
        }

        /**
         * @return {Object} {wrapper: {@link Object}, animateList: {@link Array.<function>}}<br>
         * wrapper - the original tableau, rendered as a DOM object<br>
         * animateList - an Array of animation functions,
         * one for each Tile which will be moving.
         */
        getDOMAndAnimation() {
                let animateList = [];
                let animateTileList = [];
                let animateCount = 0;
                let animationDuration = this.animationDuration;
                let wrapper = document.createElement('div');
                wrapper.className = "tableauARenderAnimate";

                let tileList = this.tableau.tileList;
                for (let index = tileList.length - 1; index >= 0; index--) {
                        let tile = tileList[index];
                        if (tile.newX != undefined) {
                                animateTileList.push(tile);
                                continue;
                        }

                        let tileElement = this.makeTileElementOffset(tile);
                        wrapper.appendChild(tileElement);
                }

                for (let tile of animateTileList) {
                        let tileElement = this.makeTileElementOffset(tile);

                        let newX = tile.newX + this.offset.x;
                        let newY = tile.newY + this.offset.y;
                        let newLeft = newX * this.gridSize + "px";
                        let newTop = newY * this.gridSize + "px";
                        let animateFunction = function() {
                                $(tileElement).addClass('tileMoveRS');
                                $(tileElement)
                                .animate({ left: newLeft, top: newTop }, animationDuration, 'linear',
                                        function() {$(tileElement).removeClass('tileMoveRS');});
                        };

                        animateList.unshift(animateFunction);
                        wrapper.appendChild(tileElement);
                }

                let width = this.tableau.getRowLength(0) + 1;
                let height = this.tableau.getColumnLength(0) + 1;
                wrapper.style.width = (width + this.offset.x) * this.gridSize + "px";
                wrapper.style.height = (height + this.offset.y) * this.gridSize + "px";

                let gridHolder = document.createElement('div');
                gridHolder.className = "gridHolder";
                wrapper.appendChild(gridHolder);
                let gridElement = this.makeGridElement(width, height);
                gridHolder.appendChild(gridElement);

                return {wrapper, animateList};
        }

}
