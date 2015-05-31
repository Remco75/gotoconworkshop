'use strict';

/**
* @ngdoc directive
* @name ingGlobal.directive:ing-popover
* @restrict EA
* @scope =
*
* @param {String} [position] popover position relative to the container
* @param {String} [size] values: auto, xs, sm, md, lg (default is xs)
*
* @description
* Directive for displaying a popover.
*
* Position can be one of the following:
* right-down, above-right, above-left, below-right(default,) below-left
*
* @example
<example module="ingGlobal">

 <file name="ing-popover.html">

    <h2 class="heading-b-md">Usage example</h2>

    <div class="panel">
        <div ing-popover>
             <button ing-popover-invoker>
                <span ing-info-icon sr-text="Meer info over item X"></span>
             </button>
             <div ing-popover-content position="above-right">
                 <h3 ing-popover-title>Tooltip</h3>
                 Lorem ipsum
             </div>
         </div>
    </div>

    <h2 class="heading-b-md">Position demo</h2>

    <!-- Please use code above as implementation example -->

    <div data-popover-demo ng-controller="Ctrl" style="position:relative"><div ng-style="btnStyle"><input ng-model="ttt" ng-click="stopProp($event)"></input><button style="width:200px;" ng-click="posToggle($event)">{{preferredPosition || 'Toggle position'}}</button></div><div ing-popover style="position:absolute; top: 100px;"><a href class="btn btn-primary" ing-popover-invoker>Invoke popover</a><div ing-popover-content><h3 ing-popover-title>{{position}}</h3>{{ttt}}</div></div></div>
  </file>

    <file name="positionDemo.js">

        // Note: code below only needed for positioning demo

        function Ctrl($scope, $element, $timeout) {

            var demoTop = $('[data-popover-demo]').offset().top;

            $(document).scroll(function(){
                var btnStylePrev = $scope.btnStyle;

                if( $(document).scrollTop()  >= demoTop ){
                    $scope.btnStyle = {position:'fixed', top:'10px'};
                }else {
                    $scope.btnStyle = {position:'absolute', top:'10px'};
                }
                if(!angular.equals($scope.btnStyle, btnStylePrev)){
                    $scope.$digest();
                }
            });


            $scope.ttt = 'Popover content';

            var n = 0;
            $scope.posToggle = function(e){
                var poss = ['above-left', 'below-right', 'right-down', 'below-left', 'above-right', 'right-down' ];
                $scope.preferredPosition = $('[data-popover-demo] .overlay-content').scope().preferredPosition = poss[n % poss.length];
                n ++;

                e.stopPropagation();
                $('[data-popover-demo] .overlay-content').scope().positionPopover();
            }

            $scope.stopProp = function(e){
                e.stopPropagation();
            }
        }
    </file>
</example>
*/

/*global jQuery*/
angular.module('gotoconSliderApp').directive('ingPopover', [function() {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope:true,
        template: '<div style="position:relative; display:inline-block;"></div>',
        link:function (scope, element, attrs, ctrl, transclude) {
            // Share scope
            transclude(scope, function(clone){
                element.append(clone);
            });
        }
    };
}]);


angular.module('gotoconSliderApp').directive('ingPopoverInvoker', function () {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template:'<a href="" role="button"></a>',
        link: function (scope, element, attrs, ctrl, transclude) {

            jQuery(document).bind('keyup.popover-' + scope.$id, function(e) {
                if(e.which === 27) { //esc
                    scope.closePopover();
                }
            });

            element.bind('click.popover-' + scope.$id, function(e) {
                scope.togglePopover();
                e.stopPropagation();
            });

            jQuery(document).bind('click.popover-' + scope.$id, function() {
                scope.closePopover();
            });

            scope.invokerElem = element; //share invoker element with popoverController

            scope.$on('$destroy', function(){
                jQuery(document).unbind('keyup.popover-' + scope.$id);
                jQuery(document, element).unbind('click.popover-' + scope.$id);
            });

            // Share scope
            transclude(scope, function(clone){
                element.append(clone);
            });
        },
        controller: 'popoverController'
    };
});


angular.module('gotoconSliderApp').directive('ingPopoverContent', ['popoverPositionService', '$timeout', '$parse', '$animate', function (popoverPosition, $timeout, $parse, $animate) {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        template:
            '<div ng-show="visible" class="overlay overlay-{{size}} fade overlay-padding" ng-style="popoverStyle">' +
                '<div data-popover-content class="arrow-sm overlay-content panel panel-shadow-a h-bg-a l-mb-0">' +
                    '<button type="button" ng-click="closePopover()" class="close close-default close-float-right">' +
                        '<span class="sr-only">Sluiten</span>' +
                        '<i class="icon" aria-hidden="true"></i>' +
                    '</button>' +
                    '<div class="arrow arrow-bordered" ng-style="popoverArrowStyle" ng-class="{' +
                        '\'arrow-down\':    position == \'above-right\' || position == \'above-left\','   +
                        '\'arrow-up\':      position == \'below-right\' || position == \'below-left\','   +
                        '\'arrow-left\':    position == \'right-down\'}">'  +
                    '</div>' +
                '</div>' +
            '</div>',
        link: function (scope,element,attrs, ctrl, transclude){
            attrs.$observe('size', function(s){
                scope.size = s || 'xs';
            });

            attrs.$observe('position', function(p){
                scope.preferredPosition = p || 'below-right';
            });

            // For cross browser/device compatible css animation, apply styles successively
            scope.$watch('active', function(active) {
                if(active) {
                    scope.visible = true;
                    $timeout(function(){
                        scope.$digest();
                        $animate.addClass(element, 'in');
                        scope.positionPopover();
                    });
                } else {
                    $animate.removeClass(element, 'in', function(){
                        scope.visible = false;
                        $timeout(function(){
                            scope.$digest();
                        });
                    });
                }
            });

            transclude(scope, function(clone){
                element.find('[data-popover-content]').append(clone);
            });

            element.click(function (e) {
                e.stopPropagation();
            });

            // share elem with popoverController
            scope.popoverContentElem = element.find('[data-popover-content]');

        },
        controller: 'popoverController'
    };
}]);


angular.module('gotoconSliderApp').controller('popoverController', ['$scope', '$element', '$timeout', '$rootScope', 'utilsService', 'popoverPositionService', function ($scope, $element, $timeout, $rootScope, utilsService, popoverPosition) {

    $scope.positionPopover = function () {
        var popoverElem = $scope.popoverContentElem,
            invokerElem = $scope.invokerElem,
            space       = utilsService.getSpaceInViewport(popoverElem, invokerElem);

        if(!utilsService.isNoSpaceInViewport(space) && !utilsService.isSpaceInViewportAllDirections(space)){
            var newPos  = popoverPosition.determineNewPosition($scope.preferredPosition, space);
            $scope.position = newPos !== null ? newPos: $scope.preferredPosition;
        } else {
            $scope.position = $scope.preferredPosition;
        }

        $scope.popoverStyle         = popoverPosition.getStylingFromPosition($scope.position, popoverElem, invokerElem);
        $scope.popoverArrowStyle    = popoverPosition.getArrowStylingFromPosition($scope.position, popoverElem, invokerElem);
    };

    $scope.togglePopover = function() {
        var active = $scope.active; // Save visibility state, so toggle doesn't get affected by broadcast
        $rootScope.$broadcast('close-all-popovers');
        $scope.active = !active;
    };

    $scope.closePopover = function() {
        $scope.active = false;
        $timeout(function() {
            $scope.$digest();
        });
    };

    $scope.$on('close-all-popovers', function() {
        $scope.closePopover();
    });

}]);


angular.module('gotoconSliderApp').directive('ingPopoverTitle', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        replace: true,
        link:function (scope, element) {
            $timeout(function(){ // Minimize DOM manipulation, align with digest cycles
                element.addClass('heading-b-md l-mb-0 h-text-b');
            });
        }
    };
}]);


angular.module('gotoconSliderApp').service('popoverPositionService', [function () {

    var constants = {
        MARGIN        : 15,     // amount of px between invoker and popover
        POPOVER_X     : -30,    // amount of px needed to align popover arrow with invoker
        ARROW_X       : 20      // amount of px between arrow and tooltip border
    };

    function determineNewPosition(position, space) {
        var noSpaceForGivenPosition =
            (position === 'right-down'  && !space.right)                    ||
            (position === 'above-right' && (!space.top || !space.right))    ||
            (position === 'above-left'  && (!space.top || !space.left))     ||
            (position === 'below-right' && (!space.bottom || !space.right)) ||
            (position === 'below-left'  && (!space.bottom || !space.left));

        if (noSpaceForGivenPosition){
            return getPositionFromViewportSpace(space);
        } else {
            return position;
        }
    }

    function getPositionFromViewportSpace(space){
        var position = null;

        // Position right if possible
        if (space.right) {
            if (space.bottom) {
                position = 'below-right';
            }
            else if (space.top) {
                position = 'above-right';
            }
            else {
                position = 'right-down';
            }
        }
        // Position left if no space on right
        else if (space.left) {
            if (space.bottom) {
                position = 'below-left';
            }
            else if (space.top) {
                position = 'above-left';
            }
        }
        return position;
    }

    function getStylingFromPosition(position, popoverElem, invokerElem) {
        var style;

        var popover = {
            width: popoverElem.outerWidth(true),
            height: popoverElem.outerHeight(true),
            margin: constants.MARGIN,
            popoverX: constants.POPOVER_X
        };

        var invoker = {
            width:  invokerElem.outerWidth(),
            height: invokerElem.outerHeight(),
            left:   invokerElem.offset().left,
            top:    invokerElem.offset().top
        };

        switch(position){
            case 'right-down':
                style = { top: 0, left: invoker.width + popover.margin + 'px' };
                break;
            case 'above-right':
                style = { bottom: invoker.height + popover.margin + 'px', left: invoker.width + popover.popoverX + 'px' };
                break;
            case 'above-left':
                style = { bottom: invoker.height + popover.margin + 'px', left: - popover.width - popover.popoverX + 'px' };
                break;
            case 'below-right':
                style = { top: invoker.height + popover.margin + 'px', left: invoker.width + popover.popoverX + 'px' };
                break;
            case 'below-left':
                style = { top: invoker.height + popover.margin + 'px', left: - popover.width - popover.popoverX + 'px' };
                break;
        }

        return style;
    }


    function getArrowStylingFromPosition(position, popoverElem, invokerElem) {
        var invokerHeight   = invokerElem.outerHeight(),
            arrowHeight     = popoverElem.find('.arrow').outerWidth(true),
            style;

        if (position === 'right-down'){
            style = { top: Math.max(invokerHeight/2, 11) + 'px' }; //11px is minimum for arrow to align properly with top
        }
        else if(position === 'above-right' || position === 'below-right') {
            style = { left: + constants.ARROW_X + 'px', right:'auto' };
        }
        else if(position === 'above-left' || position === 'below-left'){
            style = { right: constants.ARROW_X - 5 - (arrowHeight/2) + 'px', left:'auto' }; //5px correction needed, since same values for right and left positioning don't result in same offset
        }
        return style;
    }

    return {
        determineNewPosition :          determineNewPosition,
        getStylingFromPosition :        getStylingFromPosition,
        getArrowStylingFromPosition:    getArrowStylingFromPosition,
        getPositionFromViewportSpace :  getPositionFromViewportSpace
    };

}]);

