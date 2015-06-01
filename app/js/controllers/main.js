'use strict';

/**
 * @ngdoc function
 * @name gotoconSliderApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the gotoconSliderApp
 */
angular.module('gotoconSliderApp')
  .controller('MainCtrl', function ($scope) {
        $scope.slider = {
            sliderValue: 1
        };
        $scope.rangeSlider = {
            lowerBound: 2,
            higherBound: 4
        };
        $scope.step = 1;
        $scope.min = 1;
        $scope.max = 5;
        $scope.segments = new Array(4);

  });
