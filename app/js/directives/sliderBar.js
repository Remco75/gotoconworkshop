'use strict';

/**
 * @ngdoc directive
 * @name ingGlobal.directive:ing-slider-bar
 * @restrict E
 * @scope
 * @requires ingGlobal.directive:ing-slider
 *
 * @param {Array=} segments An array of labels to show at each segment.
 *
 * @description
 * The slider bar is a representation of the slider's value. It is "filled" within a range
 * the bounds of which represent the current values of the contained handles. If only one
 * handle is present, it is filled from the lowest value up to the value of that handle.
 *
 * The slider is divided into segments, ranges between two steps, that can be labeled. This
 * can be done by passing an array to the bar using the `segments` attribute. Take care that
 * the array length is equal to the desired number of segments.
 *
 * Currently, vertical slider bars are not yet supported.
 *
 * @example
 <example module="ingGlobal">
    <file name="ing-slider-bar-basic.html">
        <div ng-controller="Ctrl">
            <div class="row">
                <div class="col-md-4 col-md-offset-1 l-p-2">
                    <ing-slider min="{{min}}" max="{{max}}" step="{{step}}">
                        <ing-slider-bar>
                            <ing-slider-handle ng-model="slider.value" aria-controls="sliderValue"></ing-slider-handle>
                        </ing-slider-bar>
                    </ing-slider>
                </div>
            </div>
            <div class="row">
                <p id="sliderValue">Model value: {{slider.value}}</p>
            </div>
        </div>
    </file>
    <file name="slider-bar-basic-example-controller.js">
        function Ctrl($scope) {
            $scope.slider = {
                value: 0.0
            };
            $scope.step = 0.5;
            $scope.min = 0.0;
            $scope.max = 2.5;
            $scope.segments = [
                'First',
                'Second',
                'Third',
                'Fourth',
                'Fifth'
            ];
        }
    </file>
 </example>
 */
angular.module('gotoconSliderApp').directive('ingSliderBar', [function () {
    return {
        require: '^ingSlider',
        restrict: 'E',
        scope: {
            segments: '='
        },
        transclude: true,
        link: function(scope, element, attrs, ingSlider){
            var handles = ingSlider.getHandles();
            
            scope.getLowerBoundPercentage = function(){
                if(handles.length !== 2){
                    // If there aren't two handles, assume one handle - i.e. the slider range
                    // starts at zero.
                    return 0;
                }

                var percentage = ((handles[0].handleValue - ingSlider.getMin()) * 100) /
                                  (ingSlider.getMax() - ingSlider.getMin());
                // The lower bound percentage is bounded by 0% and 100%
                return Math.max(Math.min(percentage, 100), 0);
            };

            scope.getHigherBoundPercentage = function(){
                // If there are two handles, the higher bound is set by the second one.
                // Otherwise it's set by the only one.
                var handle = handles[0];
                if(handles.length === 2){
                    handle = handles[1];
                }

                var percentage = ((handle.handleValue - ingSlider.getMin()) * 100) /
                                  (ingSlider.getMax() - ingSlider.getMin());
                // The filled percentage is bounded by 0% and 100%
                return Math.max(Math.min(percentage, 100), 0);
            };
            
            scope.getSegments = function(){
                if(angular.isUndefined(scope.segments)){
                    return new Array((ingSlider.getMax() - ingSlider.getMin()) / ingSlider.getStep());
                }
                return scope.segments;
            };
        },
        templateUrl: 'views/partials/sliderBar.html'
    };
}]);
