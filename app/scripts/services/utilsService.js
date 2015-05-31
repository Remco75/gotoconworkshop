'use strict';

/**
 * @ngdoc function
 * @name ingGlobal.service:utilsService
 *
 * @description
 * This service contains utility functions
 *
 * @example
 <example module="exampleApp">
 <file name="index.html">
 <div ng-controller="exampleCtrl">
    <div>Random number: <span ng-bind="randomNumber"/></div>
    <div ng-if="isOldNativeAndroid">This is an old native Android browser</div>
 </div>
 </file>
 <file name="scripts.js">
 var exampleApp = angular.module("exampleApp", ['ingGlobal']);

 exampleApp.controller('exampleCtrl', function($scope, utilsService) {
    var emptyValue = '';
    $scope.isEmpty = utilsService.isEmpty(emptyValue);
    $scope.isOldNativeAndroid = utilsService.isOldAndroidBrowser();
    $scope.randomNumber = utilsService.createRandomId();

 });
 </file>
 </example>
 **/

/*global jQuery*/
angular.module('gotoconSliderApp').service('utilsService', ['expressions', '$window', function (expressions, $window) {

    // General Util Functions
    var fn = {};

    fn.isEmpty = function (value) {
        return typeof value === 'undefined' || value === '' || value === null || value !== value;
    };

    fn.parseAmount = function (value) {
        if (typeof value === 'string') {
            return parseFloat(value
                .removeSpaces()
                .replace(expressions.containsDot, '')
                .replace(expressions.containsComma, '.') +
                '');
        }
        return value;
    };

    /**
     * Creates a random identifier (integer consisting of 5 characters).
     * @returns {number}
     */
    fn.createRandomId = function () {
        return Math.floor((Math.random() * 100000) + 1);
    };


    /**
     * Chunk an array into an array of arrays of length |len|
     * @param arr
     * @param len
     * @returns {{Array}} array of arrays.
     */
    fn.chunk = function(arr, len) {
        var chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    };


    /** Viewport. */

    /**
     * Constructs viewport object, indicating for each direction(top, left, right, bottom) where it's located
     * relative to the document.
     * @returns {object}
     */
    fn.getViewportRelativeToDocument = function () {
        var viewport = {
            top: angular.element(document).scrollTop(),
            left: angular.element(document).scrollLeft(),
            right: angular.element(document).scrollLeft() + fn.getViewportWidth(),
            bottom: angular.element(document).scrollTop() + fn.getViewportHeight()
        };
        return viewport;
    };

    /**
     * Gets the viewport height.
     * @returns {number}
     */
    fn.getViewportHeight = function () {
        return document.compatMode === 'CSS1Compat' ? jQuery(window).height() : window.document.body.clientHeight;
    };

    /**
     * Gets the viewport width.
     * @returns {number}
     */
    fn.getViewportWidth = function () {
        return document.compatMode === 'CSS1Compat' ? jQuery(window).width() : window.document.body.clientWidth;
    };

    /**
     * Constructs space Object (for a certain DOM element) with booleans indicating for each direction whether space available in viewport
     * @param {element} displayElem DOM element that needs to be measured against viewport dimensions
     * @param {element} relativeElem DOM element that displayElem needs to be positioned relative to
     * @returns {object}
     */
    fn.getSpaceInViewport = function (displayElem, relativeElem) {
        var viewport = fn.getViewportRelativeToDocument();

        // Wrap elements inside jQuery Object
        displayElem = angular.element(displayElem);
        relativeElem = angular.element(relativeElem);

        var space = {
            top: (viewport.top + displayElem.height()) <= relativeElem.offset().top,
            left: (viewport.left + displayElem.width()) <= relativeElem.offset().left,
            right: (viewport.right - displayElem.width()) >= (relativeElem.offset().left + relativeElem.width()),
            bottom: (viewport.bottom - displayElem.height()) >= (relativeElem.offset().top + relativeElem.height())
        };

        return space;
    };

    /**
     * Indicates if nospace in viewport left.
     * @param {object} space Object (for a certain DOM element) with booleans indicating for each direction whether space is available in viewport
     * @returns {boolean} True if no space at all in viewport
     */
    fn.isNoSpaceInViewport = function (space) {
        return (space.top === false && space.left === false && space.right === false && space.bottom === false);
    };

    /**
     * Indicates if there is space left in all directions of the viewport.
     * @param {object} space Object (for a certain DOM element) with booleans indicating for each direction whether space is available in viewport
     * @returns {boolean} True if space in all directions
     */
    fn.isSpaceInViewportAllDirections = function (space) {
        return (space.top === true && space.left === true && space.right === true && space.bottom === true);
    };

    /** Indicates if the browser is the old stock Android Browser.
     * This old stock Android browser was replaced by Chrome in Android 4.4.
     * The old stock Android browser has some bugs. With this function you can detect this browser.
     * Some of the bugs are:
     * - css overflow-y prevents a normal click behaviour on <label>.
     * - animation of css visibility property does not properly work
     *
     * @returns {boolean} True if browser is old stock Android Browser
     */
     fn.isOldAndroidBrowser = function (){
         /* A full list of all old Android webkit useragents can be found here:
          * http://myip.ms/browse/comp_browseragents/1/browserID/871/browserID_A/1
          *
          * The Android user agent contains the words Android and AppleWebKit with a version number directly after AppleWebKit.
          * When this version number is <537 we have the old Android browser.
          * When the Chrome browser is used, the version will be >=537.
          * See also: http://stackoverflow.com/questions/14403766/how-to-detect-the-stock-android-browser
          */

        // Get a part of the userAgent that contains both Android and AppleWebkit/AppleWebKit and also return version number of AppleWebKit
        var androidUserAgentPlusWebkitVersion = $window.navigator.userAgent.match(/Android.*AppleWeb[Kk]?it\/([\d.]+).*/);
        return (angular.isDefined(androidUserAgentPlusWebkitVersion) && androidUserAgentPlusWebkitVersion!==null && androidUserAgentPlusWebkitVersion[1]<537);
    };


    fn.addValidator = function (ngModelController, validator) {
        ngModelController.$parsers.push(function() {
            var value = ngModelController.$viewValue;
            return validator(value) ? value : undefined;
        });

        ngModelController.$formatters.push(function(value) {
            validator(ngModelController.$modelValue);
            return value;
        });
    };

    /** Indicates if the browser has CORS support for authentication
     * IE9 e.g. has limited CORS support, and does not pass this test. More information below
     * http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
     *
     * @returns {boolean} True if browser supports CORS with authentication
     */

    fn.isCorsAuthCapable =  function () {
        return ("withCredentials" in new XMLHttpRequest());
    };

    /* Return function object */
    return fn;
}]);
