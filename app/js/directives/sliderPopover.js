'use strict';

/**
 * @ngdoc directive
 * @name ingGlobal.directive:ing-slider-popover
 * @restrict E
 * @scope
 * @requires ingGlobal.directive:ing-slider
 * @requires ingGlobal.directive:ing-slider-handle
 *
 * @description
 * A popover to attach to a slider's handle to display information associated with that handle.
 * It will move along with the handle when it is dragged.
 *
 * The popover should be nested inside the handle it should be attached to. The contents of
 * this element will be shown inside the popover.
 *
 * Currently, vertical sliders are not supported.
 *

 */
angular.module('ingGlobal').directive('ingSliderPopover', ['$timeout', function ($timeout) {
    return {
        require: ['^ngModel', '^ingSlider'],
        restrict: 'E',
        transclude: true,
        scope: {},
        link: function(scope, element, attrs, controllers){
            var ngModelCtrl = controllers[0];
            var ingSlider = controllers[1];
            // Hardcoded until The Guide finds a way of automatically positioning
            // the popover correctly
            scope.handleHeight = 40;
            scope.arrowHeight = 12;
            
            scope.$watch(
                function(){
                    return ngModelCtrl.$modelValue;
                },
                function(){
                    // Calculate the width of the popover after the DOM has been updated
                    // (and thus it has the correct width)
                    $timeout(function(){
                        scope.popoverWidth = element.children().get(0).getBoundingClientRect().width;
                    });
                }
            );

            scope.getOffset = function(){
                // The filled percentage is bounded by 0% and 100%
                return Math.max(
                    Math.min(
                        // A value of min is 0%, a value of max is 100% - what is getValue()?
                        ((ngModelCtrl.$modelValue - ingSlider.getMin()) * 100) / (ingSlider.getMax() - ingSlider.getMin()),
                        100
                    ),
                    0
                );
            };
            
            // Returns <0 when the popover, centered above the handle,
            // would flow over the left boundary, >0 if it would flow
            // over the slider's right boundary, and 0 if it just fits.
            var popoverOutsideBoundaries = function(){
                var stepPercentage = ingSlider.getStep() * 100 / (ingSlider.getMax() - ingSlider.getMin());
                var stepWidth = ingSlider.getWidth() * stepPercentage / 100;

                var steps = (ngModelCtrl.$modelValue - ingSlider.getMin())/ingSlider.getStep();
                var maxSteps = (ingSlider.getMax() - ingSlider.getMin())/ingSlider.getStep();
                if(steps * stepWidth < (scope.popoverWidth / 2)){
                    return - 1;
                }
                if((maxSteps - steps) * stepWidth < (scope.popoverWidth / 2)){
                    return 1;
                }
                return 0;
            };
            
            scope.getArrowPosition = function(){
                var isOutsideBoundaries = popoverOutsideBoundaries();
                if(isOutsideBoundaries < 0){
                    if(scope.popoverWidth < 115){
                        // Small popovers look weird if the arrow is too far to the left
                        return 20;
                    }
                    return 10;
                }
                if(isOutsideBoundaries > 0){
                    if(scope.popoverWidth < 115){
                        // Small popovers look weird if the arrow is too far to the right
                        return 80;
                    }
                    return 90;
                }
                return 50;
            };
            
            // How much does the popover need to be shifted on the X-axis to be centered above the handle?
            scope.getTranslation = function(){
                var isOutsideBoundaries = popoverOutsideBoundaries();
                if(isOutsideBoundaries < 0){
                    return -(scope.popoverWidth * 0.1);
                }
                if(isOutsideBoundaries > 0){
                    return -(scope.popoverWidth * 0.9);
                }
                return -scope.popoverWidth / 2;
            };
        },
        template: '<div class="slider-value overlay overlay-padding h-no-wrap"' +
                       'ng-style="{bottom: handleHeight + arrowHeight + \'px\',' +
                                  'left: getTranslation() + \'px\'}"' +
                       'role="presentation">' +
             // The trailing space on the next line is important: it separates class names
           '<div class="arrow-sm overlay-content panel panel-sm panel-shadow-a ' +
                       'h-bg-a panel-bordered l-mb-0 l-pt-05 l-pb-05">' +
               '<div class="arrow arrow-bordered arrow-down"' +
                    'ng-class="\'arrow-h-\' + getArrowPosition()">' +
               '</div>' +
               '<div ng-transclude></div>' +
           '</div>' +
        '</div>'
    };
}]);
