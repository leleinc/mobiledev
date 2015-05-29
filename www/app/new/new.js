
angular.module('indiplatform.new', ['ionic', 'indiplatform.new.services', 'indiplatform.new.controllers'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tab.home.news', {
      url: "/news",
      views: {
        'news-tab': {
          templateUrl: 'app/new/news.html',
           controller: 'NewsCtrl'
        }
      }
    })
    .state('tab.home.ioboard', {
      url: "/ioboard",
	  cache: false,
      views: {
        'ioboard-tab': {
          templateUrl: 'app/new/ioboards.html',
           controller: 'NewsCtrl'
        }
      }
    })
    .state('new', {
      url: "/new/:id/:type",
	  cache: false,
      views: {
        'main-view': {
          templateUrl: 'app/new/new.html',
           controller: 'NewsCtrl'
        }
      }
    })  
});

