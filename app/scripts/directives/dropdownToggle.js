'use strict';

/**
 * @ngdoc directive
 * @name ingGlobal.directive:ing-dropdown-toggle
 * @restrict A
 *
 * @description
 * Directive for toggling a dropdown menu, intended to be used with The Guide dropdown component.
 *
 * @example
 * <example module="ingGlobal">
 *     <file name="dropdown.html">
 *         <div class="dropdown">
 *             <button class="btn btn-default dropdown-toggle icon-position icon-after icon-position-xs" type="button" id="exampleDropdownToggle" ing-dropdown-toggle>
 *                 Dropdown
 *                 <i aria-hidden="true" class="icon dropdown-toggle-icon"></i>
 *             </button>
 *             <ul class="dropdown-menu dropdown-menu-default" role="menu" aria-labelledby="exampleDropdownToggle">
 *                 <li class="dropdown-menu-item" role="presentation">
 *                     <a role="menuitem" tabindex="-1" href="#">Action</a>
 *                 </li>
 *                 <li class="dropdown-menu-item" role="presentation">
 *                     <a role="menuitem" tabindex="-1" href="#">Another action</a>
 *                 </li>
 *                 <li class="dropdown-menu-item" role="presentation">
 *                     <a role="menuitem" tabindex="-1" href="#">Something else here</a>
 *                 </li>
 *             </ul>
 *         </div>
 *     </file>
 * </example>
 */
angular.module('gotoconSliderApp')
    .directive('ingDropdownToggle', ['$document', function ($document) {
        return {
            restrict: 'A',
            scope: false,
            link: function (scope, element) {
                element.on('click', function (event) {
                    var parent = element.parent(),
                        shouldOpen = !parent.hasClass('open');
                    element.triggerHandler('blur');
                    event.stopPropagation();

                    angular.element($document[0].querySelector('.dropdown.open')).removeClass('open');
                    parent.toggleClass('open', shouldOpen);
                });

                // we need jQuery, cause jqLite can't bind an event with a namespace
                $document.on('click.dropdown-' + scope.$id, function () {
                    element.parent().removeClass('open');
                });

                scope.$on('$destroy', function () {
                    $document.off('click.dropdown-' + scope.$id);
                });
            }
        };
    }]);