
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
     .state('new', {
      url: "/new/:id",
      views: {
        'main-view': {
          templateUrl: 'app/new/new.html',
           controller: 'NewsCtrl'
        }
      }
    })  
});

