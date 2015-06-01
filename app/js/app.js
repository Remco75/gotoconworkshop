'use strict';

/**
 * @ngdoc overview
 * @name gotoconSliderApp
 * @description
 * # gotoconSliderApp
 *
 * Main module of the application.
 */
angular
  .module('gotoconSliderApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/slider', {
        templateUrl: 'views/slider.html',
        controller: 'SliderCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
