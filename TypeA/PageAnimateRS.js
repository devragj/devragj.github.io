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
 * Initializes the {@link PageAnimate} object for the webpage RobinsonSchenstedAnimate.html.
 * @copyright 2016-2017 Devra Garfinkle Johnson, 2016 Christian Johnson
 * @license MIT license
 */

"use strict";

/**
 * The configuration object for the webpage RobinsonSchenstedAnimate.html
 */

let pageAnimateRS = null;
$(function() {
        pageAnimateRS = new PageAnimate({
                clearList: ['comment', 'tableauAPairRender', 'tableauARender','tableauAGrid'],
                parse: ParameterRS.parse,
                generateParameter: ParameterRS.generateParameter,
                animationClassName: 'tableauARenderAnimate',
                getTableau: function() {return new TableauA();},
                getAnimationData: TableauAAnimate.getAnimationData
                });
});
