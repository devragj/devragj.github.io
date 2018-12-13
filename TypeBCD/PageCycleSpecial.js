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
 * Initializes the {@link PageCycles} object for the webpage CyclesAnimateSpecial.html
 * @copyright 2016-2018 Devra Garfinkle Johnson, 2016 Christian Johnson
 */

"use strict";

/**
 * The configuration object for the webpage CyclesAnimateSpecial.html.
 */

 let pageCycleSpecial = null;
 $(function() {
         pageCycleSpecial = new PageCycles({
                 clearList: ['comment', 'tableauRender'],
                 parse: ParameterDominoRS.parse,
                 generateParameter: ParameterDominoRS.generateParameter,
                 getDrawable: function(tableauPair, type, animationDuration, inPlace, unboxedOnly) {
                         return new TableauCycles({type,
                                 tableau: tableauPair.left, animationDuration, inPlace, unboxedOnly});
                 },
                 draw: function(tableau) {tableau.drawWithSpecialSquares();},
                 inPlace: true,
                 unboxedOnly: true,
                 type: true
                 });
 });
