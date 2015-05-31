'use strict';

/**
 * @ngdoc directive
 * @name ingGlobal.directive:ing-slider-handle
 * @restrict E
 * @scope
 * @requires ingGlobal.directive:ing-slider
 * @requires ingGlobal.directive:ing-slider-bar
 *
 * @param {number} ngModel Reference to scope variable containing the handle's value. This should not be undefined. Note: this should be an object property (e.g. `range.lowerBound`) instead of a single value (e.g. `lowerBound`), as otherwise Angular will not be able to update the model.
 *
 * @description
 * A handle allows the user to choose a value in the slider's range. The user can click and drag the handle
 * over the slider bar to alter the value. Moreover, the handle responds to keyboard input when focused,
 * allowing the user to increment the slider by one step by pressing the "Up" or "Right" keys,
 * decrement it by pressing either the "Down" or "Left" key, and set the model to its maximum
 * or minimum value by pressing "End" or "Home", respectively.
 *
 * DOM-wise, the handle is nested inside the slider bar that it should be locked onto. When two handles
 * are added to a single slider bar, the handles represent the lower and higher bound of a user-specifiable
 * range. Both handles have their own models representing the range boundaries.
 *
 * Moving the handle vertically is not yet supported.
 *
 * Note: the model specified in the `ng-model` attribute should be an object property (in other words:
 * there should be a dot in its name, e.g. `range.lowerBound` instead of `lowerBound`). Otherwise,
 * modifications of the value in the handle's do not propagate to the actual model in your own scope.
 * For more info, see https://egghead.io/lessons/angularjs-the-dot
 *
 * Furthermore, the value of the model should _always_ be set. After all, if it is undefined,
 * where should the handle be positioned? In practice, you will probably want to set it to the minimum
 * value. However, the slider does not set this value automatically to avoid tinkering with your model
 * without being asked to.
 *
 * @example
 <example module="ingGlobal">
    <file name="ing-slider-handle-basic.html">
        <div ng-controller="Ctrl">
            <div class="row">
                <h2>One handle (pick a value)</h2>
                <div class="col-md-4 col-md-offset-1 l-p-2">
                    <ing-slider min="{{min}}" max="{{max}}" step="{{step}}">
                        <ing-slider-bar>
                            <ing-slider-handle ng-model="slider1.value" aria-controls="slider1Value"></ing-slider-handle>
                        </ing-slider-bar>
                    </ing-slider>
                </div>
            </div>
            <div class="row">
                <p id="slider1Value">Model value: {{slider1.value}}</p>
            </div>
            <div class="row">
                <h2>Two handles (select a range)</h2>
                <div class="col-md-4 col-md-offset-1 l-p-2">
                    <ing-slider min="{{min}}" max="{{max}}" step="{{step}}">
                        <ing-slider-bar>
                            <ing-slider-handle ng-model="slider2.lowerBound" id="slider2LowerBound"
                                               aria-controls="slider2HigherBound slider2LowerBoundValue">
                            </ing-slider-handle>
                            <ing-slider-handle ng-model="slider2.higherBound" id="slider2HigherBound"
                                               aria-controls="slider2LowerBound slider2HigherBoundValue"></ing-slider-handle>
                        </ing-slider-bar>
                    </ing-slider>
                </div>
            </div>
            <div class="row">
                <p id="slider2LowerBoundValue">Lower bound: {{slider2.lowerBound}}</p>
                <p id="slider2HigherBoundValue">Higher bound: {{slider2.higherBound}}</p>
            </div>
        </div>
    </file>
    <file name="slider-handle-basic-example-controller.js">
        function Ctrl($scope) {
            $scope.step = 0.5;
            $scope.min = 0.0;
            $scope.max = 2.5;
            $scope.slider1 = {
                value: $scope.min
            };
            $scope.slider2 = {
                lowerBound: $scope.min,
                higherBound: $scope.max
            };
        }
    </file>
 </example>
 */
angular.module('gotoconSliderApp').directive('ingSliderHandle', function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {},
        require: ['ngModel', '^ingSlider'],
        link: function(scope, element, attrs, controllers){
            var ngModelCtrl = controllers[0];
            var ingSlider = controllers[1];
            
            // Hardcoded until The Guide finds a way of automatically positioning the handle correctly
            scope.handleWidth = 20;
            
            scope.handleId = ingSlider.addHandle(scope);
            
            scope.isLowerBound = function(){
                return scope.handleId === 0;
            };
            var getOtherHandle = function(){
                var handles = ingSlider.getHandles();
                if(handles.length !== 2){
                    return;
                }
                return handles[(scope.handleId + 1) % 2];
            };
            scope.isOnlyHandle = function(){
                return !getOtherHandle();
            };

            scope.getBoundHandleClass = function(){
                if(scope.isOnlyHandle()){
                    return;
                }
                if(scope.isLowerBound()){
                    return 'slider-handle-min';
                }
                return 'slider-handle-max';
            };
            
            // If there are two handles, the higher handle should be at the right of the range.
            scope.getBoundHandleStyle = function(){
                if(!scope.isOnlyHandle() && !scope.isLowerBound()){
                    return {
                        '-ms-transform': 'translateX(' + scope.handleWidth + 'px)',
                        transform: 'translateX(' + scope.handleWidth + 'px)'
                    };
                }
                return {};
            };

            scope.getBoundButtonClass = function(){
                if(scope.isOnlyHandle()){
                    return;
                }
                if(scope.isLowerBound()){
                    return 'btn-rounded-left';
                }
                return 'btn-rounded-right';
            };

            scope.getMaxValue = function(){
                if(scope.isOnlyHandle() || !scope.isLowerBound()){
                    return ingSlider.getMax();
                }
                return getOtherHandle().handleValue;
            };
            scope.getMinValue = function(){
                if(scope.isOnlyHandle() || scope.isLowerBound()){
                    return ingSlider.getMin();
                }
                return getOtherHandle().handleValue;
            };
            
            scope.orientation = ingSlider.getOrientation();
            scope.$watch(
                function(){
                    return ingSlider.getOrientation();
                }, function(newOrientation){
                    scope.orientation = newOrientation;
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

            ngModelCtrl.$parsers.push(function(value) {
                if (ngModelCtrl.$isEmpty(value)){
                    return null;
                }
                return parseFloat(value);
            });

            ngModelCtrl.$parsers.push(function(value){
                // The new value is bounded by the slider's bounds and the other handle
                value = Math.max(Math.min(value, scope.getMaxValue()), scope.getMinValue());
                // Snap to actual step values
                var remainder = value % ingSlider.getStep();
                value = value - remainder;
                if(remainder > (ingSlider.getStep() / 2)){
                    value = value + ingSlider.getStep();
                }
                return value;
            });

            ngModelCtrl.$formatters.push(function(value) {
                if (!ngModelCtrl.$isEmpty(value)) {
                    value = value.toString();
                }
                return value;
            });

            var minValidator = function(modelValue) {
                return ngModelCtrl.$isEmpty(modelValue) ||
                       angular.isUndefined(scope.getMinValue()) ||
                       modelValue >= scope.getMinValue();
            };
            var maxValidator = function(modelValue) {
                return ngModelCtrl.$isEmpty(modelValue) ||
                       angular.isUndefined(scope.getMaxValue()) ||
                       modelValue <= scope.getMaxValue();
            };

            if(angular.isDefined(ngModelCtrl.$validators)){
                // Angular 1.3:
                ngModelCtrl.$validators.min = minValidator;
                ngModelCtrl.$validators.max = maxValidator;
            } else {
                // Angular <1.3
                ngModelCtrl.$formatters.push(function(modelValue){
                    ngModelCtrl.$setValidity('min', minValidator(modelValue));
                    if(minValidator(modelValue)){
                        return modelValue;
                    }
                    return undefined;
                });
                ngModelCtrl.$formatters.push(function(modelValue){
                    ngModelCtrl.$setValidity('max', maxValidator(modelValue));
                    if(maxValidator(modelValue)){
                        return modelValue;
                    }
                    return undefined;
                });
            }
            
            ngModelCtrl.$render = function(){
                scope.handleValue = ngModelCtrl.$modelValue;
            };
          
            var startValue;
            var snapValue = function(xOffset){
                // Increment the startValue with (the percentage the slider has moved * the maximum value)
                ngModelCtrl.$setViewValue(startValue + (xOffset / ingSlider.getWidth()) * (ingSlider.getMax() - ingSlider.getMin()), 'handleDrag');
                ngModelCtrl.$render();
            };

            scope.startDrag = function(){
                startValue = ngModelCtrl.$modelValue;
            };

            scope.drag = function(offset){
                scope.$apply(function(){
                    snapValue(offset.x);
                });
            };

            scope.handleKeypress = function($event){
                // Up and right: increment the value
                if(38 === $event.keyCode || 39 === $event.keyCode){
                    ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue + ingSlider.getStep());
                    ngModelCtrl.$render();
                    $event.preventDefault();
                }
                // Left and down: decrement the value
                if(37 === $event.keyCode || 40 === $event.keyCode){
                    ngModelCtrl.$setViewValue(ngModelCtrl.$modelValue - ingSlider.getStep());
                    ngModelCtrl.$render();
                    $event.preventDefault();
                }
                // End: set value to max
                if(35 === $event.keyCode){
                    ngModelCtrl.$setViewValue(ingSlider.getMax());
                    ngModelCtrl.$render();
                    $event.preventDefault();
                }
                // Home: set value to min
                if(36 === $event.keyCode){
                    ngModelCtrl.$setViewValue(ingSlider.getMin());
                    ngModelCtrl.$render();
                    $event.preventDefault();
                }
            };

            if(attrs.ariaControls){
                scope.ariaControls = attrs.ariaControls;
                element.removeAttr('aria-controls');
            }
        },
        // We need the style `-ms-touch-action: none` to allow pointer events to not be intercepted by IE
        // See http://msdn.microsoft.com/en-us/library/ie/jj583807%28v=vs.85%29.aspx#configure_touch_behaviors
        template: '<div tabindex="0" ng-keypress="handleKeypress($event)"' +
                       'ing-draggable override="true" on-drag-begin="startDrag" on-drag="drag"' +
                       'class="ing-slider-handle slider-slide"' +
                       'ng-style="{left: getOffset() + \'%\'}"' +
                       'role="slider" aria-valuemin="{{getMinValue()}}" aria-valuemax="{{getMaxValue()}}"' +
                       'aria-valuenow="{{handleValue}}" aria-orientation="{{orientation}}" aria-controls="{{ariaControls}}">' +
           '<div class="slider-handle" ng-class="getBoundHandleClass()" ng-style="getBoundHandleStyle()">' +
               '<div class="btn btn-b btn-lg btn-rounded btn-block" ng-class="getBoundButtonClass()">' +
                   '<i aria-hidden="true" class="icon icon-arrow-a-left icon-sm l-rt-n2"' +
                      'ng-if="isOnlyHandle() || isLowerBound()"></i>' +
                   '<i aria-hidden="true" class="icon icon-arrow-a-right icon-sm l-rt-n2 l-ml-n05"' +
                      'ng-if="isOnlyHandle() || !isLowerBound()"></i>' +
               '</div>' +
           '</div>' +
           '<div ng-transclude></div>' +
        '</div>'
    };
});
