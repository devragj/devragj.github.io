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
 * This file stores the classes needed to perform the Robinson-Schensted algorithm
 * (and its inverse) and to draw the results.<br>
 * The main class is the {@link TableauA} class.<br>
 * The {@link Tile} class stores the information about the contents of one square in a tableau.<br>
 * The {@link TileGrid} class is a helper class for the {@link TableauA} class.<br>
 * The {@link TableauAPair} class holds a pair of {@link TableauA}.<br>
 * The {@link ParameterRS} class handles the input to the Robinson-Schensted algorithm,
 * that is, a permutation.<br>
 * {@link TableauARendererDOM} and {@link TableauAPairRendererDOM} are the drawing classes.<br>
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * This is a helper class for the {@link TableauA} class.
 * It is one of the member variables of that class.
 */
class TileGrid {
        /**
         * The constructor populates a TileGrid from an Array of Tiles.
         * @param {Tile[]} tileList - an array of Tiles (which is often empty).
         */
        constructor(tileList) {
                /**
                 * This is a 2D jagged array with the same shape as the tableau
                 * of which it is a member.
                 * Each entry of the array stores a reference to the Tile
                 * in that position of the tableau.
                 * @type {Domino[][]}
                 */
                this.grid = [];
                /**
                 * This array stores the length of each row of the tableau.
                 * @type {number[]}
                 */
                this.rowLengths = [];
                /**
                 * This array stores the length of each column of the tableau.
                 * @type {number[]}
                 */
                this.columnLengths = [];
                tileList.forEach((tile) => { this.addTile(tile);});
        }

        /**
         * This function sets the grid location at position (x, y) to
         * the <code>tile</code>.
         * @param {number} x
         * @param {number} y
         * @param {Tile} tile
         */
        set(x, y, tile) {
                if (!this.columnLengths[x] || this.columnLengths[x] <= y) {
                        this.columnLengths[x] = y + 1;
                }

                if (!this.rowLengths[y] || this.rowLengths[y] <= x) {
                        this.rowLengths[y] = x + 1;
                }

                if (!this.grid[y]) {
                        this.grid[y] = [];
                }

                this.grid[y][x] = tile;
        }

        /**
         * This function gets the tile at grid location (x, y).
         * @param {number} x
         * @param {number} y
         * @return {Tile|undefined}
         */
        get(x, y) {
                if (!this.rowLengths[y]) {
                        return undefined;
                }

                return this.grid[y][x];
        }

        /**
        * This function gets the content the tile at grid location (x, y).
        * This content may be a number or a sign.
        * If there is no tile at this location,
        * the function returns undefined.
         * @param {number} x
         * @param {number} y
         * @return {number|string|undefined}
         */
        getContent(x, y) {
                let tile = this.get(x, y);
                if (tile) {
                        return tile.n;
                }

                return undefined;
        }

        /**
         * This function sets the grid location at the position
         * of a tile to that tile.
         * @param {Tile} tile
         */
        addTile(tile) {
                this.set(tile.x, tile.y, tile);
        }

        /**
         * This function removes a Tile from the grid
         * given that the tile is in a position at the edge of the tableau.
         * @param {Object} position - an object which holds the x and y coordinates
         * of the tile to be removed
         * @param {number} position.x
         * @param {number} position.y
         */
        removeExtremal(position) {
                if (position.x == 0) {
                        this.grid.pop();
                } else {
                        this.grid[position.y].pop();
                }

                this.rowLengths[position.y]--;
                this.columnLengths[position.x]--;
        }

        /**
         * @param {number} i - the zero-based index of the row
         * @return {number} the length of the ith row
         */
        getRowLength(i) {
                if (!this.rowLengths[i]) {
                        return 0;
                }

                return this.rowLengths[i];
        }

        /**
         * @param {number} j - the zero-based index of the column
         * @return {number} the length of the jth column
         */
        getColumnLength(j) {
                if (!this.columnLengths[j]) {
                        return 0;
                }

                return this.columnLengths[j];
        }
}

/**
 * This class stores the information for one tile of the tableau.
 */
class Tile {
        /**
         * @param {Object} table
         * @param {number} table.n - The number occupying the tile.
         * Though, in some uses, the tile
         * is occupied by a sign, not a number.
         * @param {number} table.x - The x-coordinate of the tile in the tableau.  Zero-based, zero on the left.
         * @param {number} table.y - The y-coordinate of the tile in the tableau.  Zero-based, zero on top.
         */
        constructor(table) {
                /**
                 * the content of the Tile
                 * @type {number|string}
                 */
                this.n = table.n;
                /**
                 * The x-coordinate of the location of the tile.
                 * in the tableau.
                 * Zero-based, zero on the left.
                 * @type {number}
                 */
                this.x = table.x;
                /**
                 * The y-coordinate of the location of the tile.
                 * in the tableau.
                 * Zero-based, zero on top.
                 * @type {number}
                 */
                this.y = table.y;
        }

        /**
         * makes a copy
         * @return {Tile}
         */
        clone() {
                return new Tile(this);
        }

        /**
         * @return {string}
         */
        toString() {
                let tileString = "Tile { n: " + this.n + ", x: " + this.x + ", y: " + this.y + " }";
                return tileString;
        }

        /**
         * makes a deep copy of an array of Tile
         * @param {Tile[]} tileList
         * @return {Tile[]}
         */
        static cloneList(tileList) {
                let newList = [];
                tileList.forEach((tile) => {newList.push(tile.clone())});
                return newList;
        }
}

/**
 * This class manages the tableau itself.  It stores the same information
 * in two member variables.  So, inserts and deletes have to update both.
 * In addition to the obvious methods for managing the tableau,
 * this class has methods to perform the Robinson-Schensted procedure and its inverse.
 * This class is called TableauA to distinguish it from the Tableau class.
 * This class handles tableaux of type A.  The Tableau class
 * (found in the file Tableau.js)
 * handles domino tableaux, that is, tableaux for types B, C, and D.
 */
class TableauA {
        /**
         * The constructor creates a TableauA from an Array of Tiles.<br>
         * @param {Tile[]} [tileList = []] - an array of Tiles (which is often empty).
         */
        constructor(tileList) {
                /**
                 * an array of references to the Tiles of the tableau.
                 * @type {Tile[]}
                 */
                this.tileList = tileList || [];
                /**
                 * see {@link TileGrid}
                 * @type {TileGrid}
                 */
                this.tileGrid = new TileGrid(this.tileList);
        }

        /**
         *  makes a deep copy
         *  @return {TableauA}
         */
        clone() {
                return new TableauA(Tile.cloneList(this.tileList));
        }

        /**
        *  This function uses the {@link TableauARendererDOM} class
       *  to draw the TableauA on a webpage.
         */
        draw() {
                document.body.appendChild(new TableauARendererDOM(this).renderDOM());
        }

        /**
         * This function adds a Tile to the TableauA
         * @param {Tile} tile - the Tile to add
         */
        insert(tile) {
                let inserted = false;
                for (let i = 0; i < this.tileList.length; i++) {
                        if (this.tileList[i].n > tile.n) {
                                this.tileList.splice(i, 0, tile);
                                inserted = true;
                                break;
                        }
                }

                if (!inserted) {
                        this.tileList.push(tile);
                }

                this.tileGrid.addTile(tile);
        }

        /**
         * This function adds a Tile to the TableauA. It has the same result as
         * the function {@link TableauA#insert}, but it uses a binary search to
         * find the place for the tile in {@link TableauA#tileList}.
         * @param {Tile} tile - the Tile to add
         */
        insertBinary(tile) {
                let tileList = this.tileList;
                let listLength = tileList.length;
                if (listLength == 0) {
                        tileList.push(tile);
                        this.tileGrid.addTile(tile);
                        return;
                }

                let number = tile.n;
                let index;
                let last = listLength - 1;
                let lastNumber = tileList[last].n;
                if (number > lastNumber) {
                        tileList.push(tile);
                        this.tileGrid.addTile(tile);
                        return;
                }

                let first = 0;
                let mid = Math.floor((first + last)/ 2);
                while(true) {
                        let midNumber = tileList[mid].n;
                        if (number < midNumber) {
                                if (mid == first) {
                                        index = mid;
                                        break;
                                }

                                let nextLowerNumber = tileList[mid - 1].n;
                                if (number > nextLowerNumber) {
                                        index = mid;
                                        break;
                                }

                                // hence number < nextLowerNumber
                                if (first == mid - 1) {
                                        index = first;
                                        break;
                                }

                                last = mid - 1;
                                mid = Math.floor((first + last) / 2);
                        } else { // midNumber < number
                                if (last == mid + 1) {
                                        index = last;
                                        break;
                                }

                                first = mid + 1;
                                mid = Math.floor((first + last) / 2);
                        }
                }

                tileList.splice(index, 0, tile);
                this.tileGrid.addTile(tile);
        }

        /**
         * This function adds a Tile to the TableauA, in a situation where the
         * tile can be added to the end of {@link TableauA#tileList}.
         * That is, either the tile is being added to a TableauA which contains
         * numbers, and the number in the new tile is larger than any numbers
         * already present in the TableauA, or, alternatively, the tableau's
         * tiles do not contain numbers.
         * @param {Tile} tile - the Tile to add
         */
        insertAtEnd(tile) {
                this.tileList.push(tile);
                this.tileGrid.addTile(tile);
        }

        /**
         * @param {number} i - the zero-based index of the row
         * @return {number} the length of the ith row
         */
        getRowLength(i) {
                return this.tileGrid.getRowLength(i);
        }

        /**
         * @param {number} j - the zero-based index of the column
         * @return {number} the length of the jth column
         */
        getColumnLength(j) {
                return this.tileGrid.getColumnLength(j);
        }

        /**
         * This function checks whether a square is at the edge of the TableauA.
         * @param {Object} position - this object stores the x and y coordinates
         * of the square
         * @param {number} position.x
         * @param {number} position.y
         */
        isExtremal(position) {
                let x = position.x;
                let y = position.y;
                let cond1 = this.getRowLength(y) == x + 1;
                if (!cond1) {
                        return false;
                }

                return this.getColumnLength(x) == y + 1;
        }

        /**
         * This function adds one number to the tableau,
         * using the Robinson-Schensted procedure.
         * @param {number} numberToAdd
         * @return {Object} {x: number, y: number},<br>
         * an object holding the x and y coordinates
         * of the change in the shape of the TableauA
         */
        nextRobinsonSchensted(numberToAdd) {
                let newTile = new Tile({n: numberToAdd});
                let tileGrid = this.tileGrid;
                let grid = tileGrid.grid;
                let position;
                let tile1;

                /**
                  * @description This function finds the position to insert
                  * a number into a row, and the tile which it replaces (if available)
                  * @param y - the index of the row
                  * @param number -  the number to insert
                  * @return an object which contains the x coordinate of the insertion
                  * position, and the tile which currently occupies that position.
                */
                function getRowData(y, number) {
                        for (let x = 0; ; x++) {
                                let tile1 = tileGrid.get(x, y);
                                if (!tile1) {
                                        let rowPosition = {x: x, y: y};
                                        return {position: rowPosition};
                                }

                                if (tile1.n > number) {
                                        let rowPosition = {x: x, y: y};

                                        return {position: rowPosition, tile1: tile1};
                                }
                        }
                }

                let insertData = getRowData(0, numberToAdd);

                position = insertData.position;
                tile1 = insertData.tile1;
                newTile.x = position.x;
                newTile.y = position.y;
                this.insert(newTile);

                /**
                  * This while loop goes row by row,
                  * calling getRowData(), and putting the tile from the previous row
                  * into its position in the next row below.
                  * It stops when a tile is placed in an empty position.
                */
                while(tile1) {
                        insertData = getRowData(tile1.y + 1, tile1.n);
                        position = insertData.position;
                        tile1.x = position.x;
                        tile1.y = position.y;
                        //tileGrid.set(position.x, position.y, tile1);
                        tileGrid.addTile(tile1);
                        tile1 = insertData.tile1;
                }

                return position;
        }

        /**
         * This function reduces the tableau by one square,
         * using the inverse Robinson-Schensted procedure.
         * @param {Object} inputPosition - an object holding the x and y coordinates
         * of the square to be removed from the tableau
         * @param {number} inputPosition.x
         * @param {number} inputPosition.y
         * @return {number} the number contained in the tile
         * which is removed from the top row
         */
        removeRobinsonSchensted(inputPosition) {
                if (!this.isExtremal(inputPosition)) {
                        throw new Error("Bad input to removeRobinsonSchensted");
                }

                let tileGrid = this.tileGrid;

                /**
                  * @description This function finds the position of a replaced tile
                  * in the row above.
                  * @param row - the row to be searched
                  * @param number - the number of the tile to be placed in the row
                  * @param startColumn - the current column index of the tile
                  * @return the x coordinate of the insertion position
                */
                function getInsertColumn(row, number, startColumn) {
                        for (let testColumn = startColumn + 1; ; ++testColumn) {
                                let testNumber = tileGrid.getContent(testColumn, row);
                                if (!testNumber || (testNumber > number)) {
                                        return testColumn - 1;
                                }
                        }
                }

                let tile = tileGrid.get(inputPosition.x, inputPosition.y);
                tileGrid.removeExtremal(inputPosition);
                let position = {x: inputPosition.x, y: inputPosition.y};

                /**
                  * This while loop goes row by row,
                  * calling getInsertColumn(), and putting the tile from the previous row
                  * into its position in the next row above.
                  * It stops when it reaches the top row.
                */
                while (true) {
                        if (position.y == 0) {
                                break;
                        }

                        let insertColumn = getInsertColumn(position.y - 1, tile.n, position.x);
                        let movingTile = tile;
                        position = {x: insertColumn, y: position.y - 1};
                        tile = tileGrid.get(position.x, position.y);

                        movingTile.x = position.x;
                        movingTile.y = position.y;
                        // tileGrid.set(position.x, position.y, movingTile);
                        tileGrid.addTile(movingTile);
                }

                // we need to remove the last tile from the tileList
                let index = this.tileList.indexOf(tile);
                this.tileList.splice(index, 1);
                let number = tile.n;
                return number;
        }

        /**
         * This function adds one number to the tableau,
         * using the Robinson-Schensted procedure.
         * It is the same as {@link TableauA#nextRobinsonSchensted},
         * except that it uses a binary search to find the position
         * to place a tile in a row, and it calls
         * {@link TableauA#insertBinary} to update {@link TableauA#tileList}
         * with the new Tile.
         * @param {number} numberToAdd
         * @return {Object} {x: number, y: number},<br>
         * an object holding the x and y coordinates
         * of the change in the shape of the TableauA
         */
        nextRobinsonSchenstedBinary(numberToAdd) {
                let newTile = new Tile({n: numberToAdd});
                let tileGrid = this.tileGrid;
                let position;
                let tile1;

                // binary search
                function getRowData(y, number, rowLength) {
                        if (rowLength == 0) {
                                let rowPosition = {x: 0, y: y};
                                return {position: rowPosition};
                        }

                        let positionX;
                        let last = rowLength - 1;
                        let lastNumber = tileGrid.getContent(last, y);
                        if (number > lastNumber) {
                                let rowPosition = {x: last + 1, y: y};
                                return {position: rowPosition};
                        }

                        let first = 0;
                        let mid = Math.floor((first + last) / 2);
                        while(true) {
                                let midNumber = tileGrid.getContent(mid, y);
                                if (number < midNumber) {
                                        if (mid == first) {
                                                positionX = mid;
                                                break;
                                        }

                                        let nextLowerNumber = tileGrid.getContent(mid - 1, y);
                                        if (number > nextLowerNumber) {
                                                positionX = mid;
                                                break;
                                        }

                                        // hence number < nextLowerNumber
                                        if (first == mid - 1) {
                                                positionX = first;
                                                break;
                                        }

                                        last = mid - 1;
                                        mid = Math.floor((first + last) / 2);
                                } else { // midNumber < number
                                        if (last == mid + 1) {
                                                positionX = last;
                                                break;
                                        }

                                        first = mid + 1;
                                        mid = Math.floor((first + last) / 2);
                                }
                        }

                        let rowPosition = {x: positionX, y: y};
                        return {position: rowPosition, tile1: tileGrid.get(positionX, y)};
                }

                let insertData = getRowData(0, numberToAdd, this.getRowLength(0));

                position = insertData.position;
                tile1 = insertData.tile1;
                newTile.x = position.x;
                newTile.y = position.y;
                this.insertBinary(newTile);

                while(tile1) {
                        insertData = getRowData(tile1.y + 1, tile1.n, this.getRowLength(tile1.y + 1));
                        position = insertData.position;
                        tile1.x = position.x;
                        tile1.y = position.y;
                        tileGrid.addTile(tile1);
                        tile1 = insertData.tile1;
                }

                return position;
        }

        /**
         * This function reduces the tableau by one square,
         * using the inverse Robinson-Schensted procedure.
         * It is the same as {@link TableauA#removeRobinsonSchensted},
         * except that it uses a binary search
         * to find the position to place a tile in a row.
         * Also, it uses a binary search instead of <code>indexOf</code>
         * to remove a Tile from {@link TableauA#tileList}.
         * @param {Object} inputPosition - an object holding the x and y coordinates
         * of the square to be removed from the tableau
         * @param {number} inputPosition.x
         * @param {number} inputPosition.y
         * @return {number} the number contained in the tile
         * which is removed from the top row
         */
        removeRobinsonSchenstedBinary(inputPosition) {
                if (!this.isExtremal(inputPosition)) {
                        throw new Error("Bad input to removeRobinsonSchensted");
                }

                let tileGrid = this.tileGrid;

                function getInsertColumn(row, number, startColumn, rowLength) {
                        let positionX;
                        let last = rowLength - 1;
                        let lastNumber = tileGrid.getContent(last, row);
                        if (number > lastNumber) {
                                return last;
                        }

                        // invariant: firstNumber < number < lastNumber
                        let first = startColumn;
                        let mid = Math.floor((first + last) / 2);
                        while(true) {
                                let midNumber = tileGrid.getContent(mid, row);
                                if (number > midNumber) {
                                        if (mid + 1 == last) {
                                                positionX = mid;
                                                break;
                                        }

                                        let nextHigherNumber = tileGrid.getContent(mid + 1, row);
                                        if (number < nextHigherNumber) {
                                                positionX = mid;
                                                break;
                                        }

                                        first = mid + 1;
                                        mid = Math.floor((first + last) / 2);
                                } else { // midNumber > number
                                        if (first == mid - 1) {
                                                positionX = first;
                                                break;
                                        }

                                        last = mid;
                                        mid = Math.floor((first + last) / 2);
                                        if (first == mid) {
                                                positionX = mid;
                                                break;
                                        }
                                }
                        }

                        return positionX;
                }

                let tile = tileGrid.get(inputPosition.x, inputPosition.y);
                tileGrid.removeExtremal(inputPosition);
                let position = {x: inputPosition.x, y: inputPosition.y};
                while (true) {
                        if (position.y == 0) {
                                break;
                        }

                        let insertColumn = getInsertColumn(position.y - 1, tile.n, position.x, this.getRowLength(position.y - 1));
                        let movingTile = tile;
                        position = {x: insertColumn, y: position.y - 1};
                        tile = tileGrid.get(position.x, position.y);

                        movingTile.x = position.x;
                        movingTile.y = position.y;
                        tileGrid.addTile(movingTile);
                }

                let tileList = this.tileList;
                let number = tile.n;
                let index;
                let last = tileList.length - 1;
                let first = 0;
                let mid = Math.floor((first + last)/ 2);
                while(true) {
                        let midNumber = tileList[mid].n;
                        if (number == midNumber) {
                                index = mid;
                                break;
                        }

                        if (number < midNumber) {
                                last = mid - 1;
                        } else { // midNumber < number
                                first = mid + 1;
                        }

                        mid = Math.floor((first + last) / 2);
                }

                this.tileList.splice(index, 1);
                return number;
        }
}

/**
 * This class handles the input to the Robinson-Schensted algorithm,
 * which is a permutation.
 * A permutation can also be represented as a string, and is for display purposes.
 * So, this class contains functions to go between the two representations
 * of the permutation.
 */
class ParameterRS {
        /**
         * @param {number[]|string} [input] - The input to this constructor can
         * either be an array of the type required for
         * {@link ParameterRS#parameter},
         * or it can be the string representation of the signed permutation.
         * If input is not given, the constructor returns the representation
         * of the empty permutation.
         */
        constructor(input) {
                if (Array.isArray(input)) {
                        /**
                         * This is an array which stores the permutation.
                         * Functionally, the array is 1-based, that is,
                         * parameter[0] = 0, basically just to discard that entry,
                         * and parameter[i] = j means that the permutation takes
                         * i to j.
                         * @type {Array.number}
                         */
                        this.parameter = input;
                } else if (typeof input == "string") {
                        this.parameter = ParameterRS.parse(input);
                } else {
                        this.parameter = [0];
                }
        }

        /**
         *  makes a deep copy
         *  @return {ParameterRS}
         */
        clone() {
                let param = [];
                this.parameter.forEach((item) => param.push(item));
                return new ParameterRS(param);
        }

        /**
         * This function generates a random permutation
         * and stores it in a ParameterRS object.
         * @param {number} n - the size of the permutation
         * @return {ParameterRS}
         */
        static generateParameter(n) {
                let chooseOne = function(array) {
                        let choiceIndex = Math.floor(Math.random() * array.length);
                        return array.splice(choiceIndex, 1)[0];
                }

                let numbers = [];
                for (let i = 1; i <= n; i++) { numbers.push(i); }

                let parameter = [];
                parameter[0] = 0;

                for (let index = 1; index <= n; index++) {
                        let num = chooseOne(numbers);
                        parameter[index] = num;
                }

                return new ParameterRS(parameter);
        }

        /**
         * This function gets the string representations
         * of the permutation.
         * @return {string} the string representation
         */
        getParameterString() {
                let parameter = this.parameter;
                let output = "";
                for (let index = 1; index < parameter.length; index++) {
                         output += parameter[index] + " ";
                }

                output = output.slice(0, -1);
                return output;
        }

        /**
         * This function takes the string representation
         * of a permutation and returns the {@link ParameterRS} object
         * associated to that permutation.
         * @param {string} parameterString - a string representing a permutation
         * @return {ParameterRS} a {@link ParameterRS} object representing
         * the same permutation
         * @throws "This permutation is no good." if there is a problem with the input string.
         * However, this version allows repeated integer entries, for example, to allow
         * semi-standard tableaux.
         */
        static parse(parameterString) {
                let data = parameterString.split(" ").filter(x => x);
                let parameter = [0];
                let dataOK = true;
                // sanity check
                for (let index = 0, length = data.length; index < length; ++index){
                        let number = parseInt(data[index]);
                        if (isNaN(number)) {
                                dataOK = false;
                                break;
                        }

                        parameter.push(number);
                }

                if (!dataOK) {
                        throw new Error("This string does not represent a valid parameter.");
                }

                return new ParameterRS(parameter);
        }
}

/**
  * Class to store a pair of {@link TableauA}.
*/
class TableauAPair {
        /**
         * @param {TableauA} [left] - the left tableau of the pair.
         * @param {TableauA} [right] - the right tableau of the pair.
         */
        constructor(left, right) {
                if (!left) {
                        /**
                         * the left tableau of the pair
                         * @type {TableauA}
                         */
                        this.left = new TableauA();
                        /**
                         * the right tableau of the pair
                         * @type {TableauA}
                         */
                        this.right = new TableauA();
                } else {
                        this.left = left;
                        this.right = right;
                }
        }

        /**
         * makes a deep copy
         * @return {TableauAPair}
         */
        clone() {
                let ret = new TableauAPair();
                ret.left = this.left.clone();
                ret.right = this.right.clone();
                return ret;
        }

        /**
         * This function uses the {@link TableauAPairRendererDOM} class
         * to draw the {@link TableauAPair} on a webpage.
         */
        draw() {
                document.body.appendChild(new TableauAPairRendererDOM(this).renderDOM());
        }

        /**
         * This function adds one number to the left tableau,
         * using {@link TableauA#nextRobinsonSchensted},
         * that is, using the Robinson-Schensted procedure.
         * It then adds a number to the right tableau to record
         * the shape change caused by adding the number to the left tableau.
         * @param {number} numberLeft - a positive integer
         * @param {number} numberRight - a positive integer
         */
        nextRobinsonSchensted(numberLeft, numberRight) {
                let position = this.left.nextRobinsonSchensted(numberLeft);
                let tileRight = new Tile({n:numberRight, x: position.x, y: position.y});
                this.right.insertAtEnd(tileRight);
        }

        /**
         * This static function performs the entire Robinson-Schensted algorithm.
         * That is, it takes as input a permutation and outputs a pair of tableaux.
         * @param {ParameterRS} parameterObject - the permutation wrapped in
         * a ParameterRS object.
         * @return {TableauAPair}
         */
        static RobinsonSchensted(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauAPair = new TableauAPair();
                for (let index = 1, length = parameter.length; index < length; ++index) {
                        myTableauAPair.nextRobinsonSchensted(parameter[index], index);
                }

                return myTableauAPair;
        }

        /**
         * This static function performs the Robinson-Schensted algorithm,
         * just as {@link TableauAPair.RobinsonSchensted} does.
         * In addition, it draws each step.
         * @param {ParameterRS} parameterObject - the permutation wrapped in a
         * ParameterRS object.
         * @return {TableauAPair}
         */
        static RobinsonSchenstedDrawSteps(parameterObject) {
                let parameter = parameterObject.parameter;
                let myTableauAPair = new TableauAPair();
                for (let index = 1, length = parameter.length; index < length; ++index) {
                        Page.displayText(parameter[index]);
                        myTableauAPair.nextRobinsonSchensted(parameter[index], index);
                        myTableauAPair.draw();
                }

                return myTableauAPair;
        }

        /**
         * This function performs the inverse of the Robinson-Schensted algorithm.
         * That is, it starts with a pair of tableau and returns a permutation.
         * @return {ParameterRS} the permutation wrapped in a ParameterRS object.
         */
        getParameter() {
                let size = this.right.tileList.length;
                let paramArray = [0];
                let tableau = this.left.clone();
                for (let number = size; number >= 1; --number) {
                        let rightTile = this.right.tileList[number - 1];
                        paramArray[number] = tableau.removeRobinsonSchensted(rightTile);
                }

                return new ParameterRS(paramArray);
        }
}

/**
 * Class for drawing a single {@link TableauA} on a webpage
 */
class TableauARendererDOM {
        /**
         * @param {TableauA} tableau - the tableau to draw
         */
        constructor(tableau) {
                /**
                 * the tableau to draw
                 * @type {TableauWithGrid|Tableau}
                 */
                this.tableau = tableau;
                /**
                 * This is the size of the side of the square
                 * alloted to each Tile when drawn, in pixels.
                 * The tableau is drawn with a background grid,
                 * so this is the size of a side of a square
                 * in the background grid.
                 * @type {Number}
                 */
                this.gridSize = 36;
        }

        /**
         * This is helper function for {@link TableauARendererDOM#renderDOM}
         * which makes the DOM element for one tile in the tableau.
         * @param {Tile} tile - the tile to render
         * @return {Object} the rendered tile
         */
        makeTileElement(tile) {
                let tileElement = document.createElement('div');
                tileElement.className = "tile";

                if (tile.highlight) {
                        tileElement.className += " tileHighlighted" + tile.highlight.toString();
                }

                let x = tile.x;
                let y = tile.y;

                tileElement.style.left = x * this.gridSize + "px";
                tileElement.style.top = y * this.gridSize + "px";

                let tileText = document.createElement('div');
                tileText.className = "tileText";
                tileText.innerHTML = tile.n;
                tileElement.appendChild(tileText);

                return tileElement;
        }

        /**
         * This is helper function for {@link TableauARendererDOM#renderDOM}
         *  which makes and fills the DOM element for the background grid.
         * @param {number} width - the width of the grid, in number of squares
         * @param {number} height - the height of the grid, in number of squares
         * @return {Object} the DOM element, filled with grid cells
         */
        makeGridElement(width, height) {
                let gridElement = document.createElement('div');
                gridElement.className = "tableauAGrid";
                gridElement.style.width = width * this.gridSize + "px";
                gridElement.style.height = height * this.gridSize + "px";

                for(let i = 0; i < height; i += 1) {
                        for(let j = 0; j < width; j += 1) {
                                let gridCell = document.createElement('div');
                                gridCell.className = "tableauAGridCell";
                                gridCell.style.left = j * this.gridSize + "px";
                                gridCell.style.top  = i * this.gridSize + "px";

                                gridElement.appendChild(gridCell);
                        }
                }

                return gridElement;
        }

        /**
         * This function creates the DOM element for the {@link TableauA}.
         * @return {Object} the rendered tableau
         */
        renderDOM() {
                let wrapper = document.createElement('div');
                wrapper.className = "tableauARender";

                for (let tile of this.tableau.tileList) {
                        let tileElement = this.makeTileElement(tile);
                        wrapper.appendChild(tileElement);
                }

                let width = this.tableau.getRowLength(0);
                let height = this.tableau.getColumnLength(0);
                wrapper.style.width = width * this.gridSize + "px";
                wrapper.style.height = height * this.gridSize + "px";

                let gridElement = this.makeGridElement(width, height);
                wrapper.appendChild(gridElement);

                return wrapper;
        }
}

/**
 * Class for drawing a {@link TableauAPair} on a webpage
 */
class TableauAPairRendererDOM {
        /**
         * @param {TableauAPair} tableauPair - the pair to draw
         */
        constructor(tableauPair) {
                /**
                 * the tableau pair to render
                 * @type {TableauAPair}
                 */
                this.tableauPair = tableauPair;
        }

        /**
         * This function creates a DOM element to render a {@link TableauAPair} of
         * tableaux side-by side.  It uses the {@link TableauARendererDOM}
         * class for each tableau in the pair, and wraps the results in a DOM element.
         * @return {Object} the rendered tableau pair
         */
        renderDOM() {
                let leftRenderer = new TableauARendererDOM(this.tableauPair.left);
                let rightRenderer = new TableauARendererDOM(this.tableauPair.right);
                let wrapperLeft = leftRenderer.renderDOM();
                let wrapperRight = rightRenderer.renderDOM();

                wrapperLeft.className += " tableauARenderLeft";
                wrapperRight.className += " tableauARenderRight";

                let wrapper = document.createElement('div');
                wrapper.className = "tableauAPairRender";

                wrapper.appendChild(wrapperLeft);
                wrapper.appendChild(wrapperRight);

                return wrapper;
        }
}
