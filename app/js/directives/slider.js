'use strict';

/**
 * @ngdoc directive
 * @name ingGlobal.directive:ing-slider
 * @restrict E
 * @scope
 *
 * @param {number}   min                        The lowest value the user should be able to choose.
 * @param {number}   max                        The highest value the user should be able to choose.
 * @param {number}   step                       The amount with which the model is incremented when the handle is moved a single step.
 * @param {string=}  [orientation='horizontal'] Either 'horizontal' or 'vertical'. At the moment, only horizontal sliders are supported.
 * @param {boolean=} [inverse=false]            Set to true for an inverted slider, useful for dark and coloured backgrounds.
 *
 * @description
 * A slider is a space efficient form control element that provides a user a means of input within a predefined range.
 * It provides the user with a cue of possible values, and a means to roughly pick a desired value.
 * This directive is merely the container that allows the setting of the slider's properties (e.g. range and step size).
 * Functionality can be added by nesting related directives: this should include at least {@link ingGlobal.directive:ing-slider-bar a slider bar} and {@link ingGlobal.directive:ing-slider-handle a handle}
 * that allows the user to actually choose a value. When the slider includes two handles, the user can use them
 * to specify a range, whereby the handles represent the range's lower and higher bounds.
 *
 * Note: the slider can be controlled using touch. This is implemented using Angular's ngTouch module.
 * Thus, it only works when your app includes it (e.g. `angular.module('myModule', ['ingGlobal', 'ngTouch'])`).
 *
 * Currently, only a horizontal slider is supported. Eventually, it should also support vertical sliders
 * and adding labels to certain steps.
 *
 */
angular.module('gotoconSliderApp').directive('ingSlider', [function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            min: '@',
            max: '@',
            step: '@',
            inverse: '='
        },
        controller: ['$scope', '$element', function($scope, $element){
            var handles = [];
            
            // Returns the handle's index in the array
            this.addHandle = function(handle){
                return handles.push(handle) - 1;
            };
            this.getHandles = function(){
                return handles;
            };
            
            this.getMax = function(){
                return parseFloat($scope.max);
            };
            this.getMin = function(){
                return parseFloat($scope.min);
            };
            this.getStep = function(){
                return parseFloat($scope.step);
            };
            
            this.getWidth = function(){
                // Return the width of the wrapper contained within the directive --
                // the directive itself does not get a bounding rectangle.
                return $element.children().get(0).getBoundingClientRect().width;
            };
            
            this.getOrientation = function(){
                if(angular.isDefined($scope.horizontalOrientation) && $scope.horizontalOrientation === false){
                    return 'vertical';
                }
                return 'horizontal';
            };
        }],
        require: 'ingSlider',
        link: {
            pre: function(scope, element, attrs){
                // TODO: Support vertical sliders
                scope.horizontalOrientation = true;
                if(angular.isDefined(attrs.orientation) && attrs.orientation === 'vertical'){
                    scope.horizontalOrientation = false;
                }
            }
        },
        template: '<div class="slider slider-default"' +
                       'ng-class="{\'slider-horizontal\': horizontalOrientation,' +
                                  '\'slider-vertical\': !horizontalOrientation,' +
                                  '\'slider-inverse\': inverse}"' +
                       'ng-transclude></div>'
    };
}]);
