
angular.module('indiplatform.search', ['ionic', 'indiplatform.search.services', 'indiplatform.search.controllers'])


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
 
     .state('search', {
      cache: true,
      url: "/search/:type",
      views: {
        'main-view': {
          templateUrl: 'app/search/search.html',
           controller: 'searchCtrl'
        }
      }
    })  
});

