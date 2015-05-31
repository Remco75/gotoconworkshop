'use strict';

/**
 * @ngdoc directive
 * @name ingGlobal.directive:ing-draggable
 * @restrict A
 *
 * @param {string=} override - If this attribute is present, the draggable will not handle repositioning for you.
 * @param {function=} on-drag-begin - A function can be passed to this attribute that will be fired when the user starts dragging the element (e.g. after a mousedown event). The current coordinates are passed as an argument in the form `{x: <xCoordPx>, y: <yCoordPx>}`.
 * @param {function=} on-drag - A function can be passed to this attribute that will be fired when the user drags the element (e.g. after a mousemove event). The offset in pixels relative to the starting position is passed as an argument in the form `{x: <xOffsetPx>, y: <yOffsetPx>}`.
 * @param {function=} on-drag-end - A function can be passed to this attribute that will be fired when the user stops dragging the element (e.g. after a mouseup event). The offset in pixels relative to the starting position is passed as an argument in the form `{x: <xOffsetPx>, y: <yOffsetPx>}`.
 *
 * @description
 * This directive allows the developer to detect when the user drags an element on the screen.
 * It supports dragging  using the mouse or touch, although the latter needs the module ngTouch to be
 * present and included (e.g. `angular.module('myModule', ['ingGlobal', 'ngTouch'])`).
 *
 * This directive can be used in two ways. The first option is to let the directive handle the
 * positioning of the element. There is a caveat though: the draggable is repositioned by
 * setting [the `position` property](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
 * to `relative` and then setting its `top` and `left` values.
 *
 * If this is not what you want, the other option is to handle the repositioning yourself.
 * To enable this, simply add the `override` attribute and provide your own event handlers
 * that handle the repositioning of your element in response to a drag action by the user
 * to one or more of the `on-drag-begin`, `on-drag` and `on-drag-end` attributes.
 * Usually, you will only need the offset provided to the `on-drag` handler and use that to
 * reposition the element to make it follow the movement of the user while dragging.
 *
 * @example
 <example module="ingGlobal">
    <file name="draggable.html">
        <div ng-controller="Ctrl">
            <span ing-draggable id="draggable" on-drag-begin="startDrag" on-drag="drag" on-drag-end="stopDrag"
                  class="h-cursor-pointer panel panel-bordered h-bg-a">Drag me! ({{offset.x}}, {{offset.y}})</span>
        </div>
    </file>
    <file name="draggable-controller.js">
        function Ctrl($scope) {
            $scope.offset = {x: 0, y: 0};

            $scope.startDrag = function(coordinates){
                console.log('Started dragging');
            };
            $scope.drag = function(offset){
                $scope.$apply(function(){
                    $scope.offset = offset;
                });
            };
            $scope.stopDrag = function(offset){
                console.log('Stopped dragging');
            };
        }
    </file>
 </example>
 */
angular.module('gotoconSliderApp').directive('ingDraggable', ['$document', '$window', '$injector', function ($document, $window, $injector) {
    return {
        restrict: 'A',
        controller: 'ingDraggableCtrl',
        link: function (scope, element, attrs, controller) {
            // This property is needed to prevent the browser from intercepting
            // the event handling. See
            // http://msdn.microsoft.com/en-us/library/ie/jj583807%28v=vs.85%29.aspx#control_default_touch
            element.css('-ms-touch-action', 'none');
            element.css('touch-action', 'none');
            
            if(angular.isUndefined(attrs.override)) {
                if(element.css('position') === 'static'){
                    element.css({position:'relative' })
                }
                // Initialise the position to no offset.
                // (Which is what auto should be doing as well, but
                // by setting it to a number we can make offset calculations.)
                if(element.css('top') === 'auto'){
                    element.css('top', 0);
                }
                if(element.css('left') === 'auto'){
                    element.css('left', 0);
                }
            }

            // Note: although ngTouch (see $swipe below) is _supposed_ to also handle mousemove
            // events, this is not working as expected right now. This probably has to do with
            // http://www.ng-newsletter.com/posts/angular-on-mobile.html#comment-1091275169
            // Therefore, we still add regular mousemove, mousedown and mouseup event listeners.
            var onPointermove = function(event){
                if($window.PointerEvent || $window.MSPointerEvent) {
                    // (Our version of) jQuery does not yet standardise MSPointerEvents,
                    // so just access the event object directly (which should have pageX and pageY)
                    // instead of jQuery's normalised one.
                    event = event.originalEvent;
                }
                event.preventDefault();

                controller.drag({
                    x: event.pageX,
                    y: event.pageY
                });
            };

            var onPointerup = function(event){
                if($window.PointerEvent || $window.MSPointerEvent) {
                    // (Our version of) jQuery does not yet standardise MSPointerEvents,
                    // so just access the event object directly (which should have pageX and pageY)
                    // instead of jQuery's normalised one.
                    event = event.originalEvent;
                }
                event.preventDefault();

                if($window.PointerEvent) {
                    $document.off('pointermove', onPointermove);
                    $document.off('pointerup', onPointerup);
                } else if ($window.MSPointerEvent) {
                    $document.off('MSPointerMove', onPointermove);
                    $document.off('MSPointerUp', onPointerup);
                } else {
                    $document.off('mousemove', onPointermove);
                    $document.off('mouseup', onPointerup);
                }

                controller.stopDrag({
                    x: event.pageX,
                    y: event.pageY
                });
            };

            var onPointerdown = function(event){
                if($window.PointerEvent || $window.MSPointerEvent) {
                    // (Our version of) jQuery does not yet standardise MSPointerEvents,
                    // so just access the event object directly (which should have pageX and pageY)
                    // instead of jQuery's normalised one.
                    event = event.originalEvent;
                }

                event.preventDefault();
                
                controller.startDrag({
                    x: event.pageX,
                    y: event.pageY
                });

                if($window.PointerEvent) {
                    // Pointer events are the only way of capturing touch input in IE 11
                    // See http://msdn.microsoft.com/en-us/library/ie/dn304886%28v=vs.85%29.aspx
                    $document.on('pointermove', onPointermove);
                    $document.on('pointerup', onPointerup);
                } else if ($window.MSPointerEvent) {
                    // MS Pointer events are the only way of capturing touch input in IE 10
                    // See http://msdn.microsoft.com/en-us/library/ie/hh673557%28v=vs.85%29.aspx
                    $document.on('MSPointerMove', onPointermove);
                    $document.on('MSPointerUp', onPointerup);
                } else {
                    // For browsers with separate touch and mouse events, implement mouse support as well
                    // (Touch support is done below using $swipe)
                    $document.on('mousemove', onPointermove);
                    $document.on('mouseup', onPointerup);
                }
            };

            if($window.PointerEvent) {
                element.bind('pointerdown', onPointerdown);
            } else if ($window.MSPointerEvent) {
                element.bind('MSPointerDown', onPointerdown);
            } else {
                element.bind('mousedown', onPointerdown);
            }

            // Only add swipe listeners when it is available --
            // this prevents errors when the implementer has not loaded the ngTouch module.
            if($injector.has('$swipe')){
                var $swipe = $injector.get('$swipe');
                $swipe.bind(element, {
                    start: controller.startDrag,
                    move: controller.drag
                });
            }
        }
    };
}]);

angular.module('gotoconSliderApp')
.controller('ingDraggableCtrl', ['$scope', '$element', '$attrs', '$parse', 'utilsService', function($scope, $element, $attrs, $parse, utilsService){
    var startCoordinates, startPosition;

    this.startDrag = function(coordinates){
        startCoordinates = coordinates;
        if(!utilsService.isEmpty($attrs.onDragBegin)){
            $parse($attrs.onDragBegin)($scope)(coordinates);
        }
        if(angular.isUndefined($attrs.override)) {
            startPosition = {
                // We're assuming that these are either 0,
                // or a pixel value set by this directive.
                // (After all, the user should've overriden it otherwise.)
                top: parseInt($element.css('top').replace('px', '')),
                left: parseInt($element.css('left').replace('px', ''))
            };
        }
    };

    this.drag = function(coordinates){
        var offset = {
            x: coordinates.x - startCoordinates.x,
            y: coordinates.y - startCoordinates.y
        };
        if(!utilsService.isEmpty($attrs.onDrag)){
            $parse($attrs.onDrag)($scope)(offset);
        }
        if(angular.isUndefined($attrs.override)) {
            $element.css({
                top: (startPosition.top + offset.y) + 'px',
                left:  (startPosition.left + offset.x) + 'px'
            });
        }
    };

    this.stopDrag = function(coordinates){
        var offset = {
            x: coordinates.x - startCoordinates.x,
            y: coordinates.y - startCoordinates.y
        };
        if(!utilsService.isEmpty($attrs.onDragEnd)){
            $parse($attrs.onDragEnd)($scope)(offset);
        }
    };
}]);