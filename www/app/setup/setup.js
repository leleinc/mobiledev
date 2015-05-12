
angular.module('indiplatform.setup', ['ionic', 'indiplatform.setup.services', 'indiplatform.setup.controllers'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('setup.i18n', {
      url: '/setup/i18n',      
      views: {
        'main-view': {
          templateUrl: 'app/setup/i18n.html',
          controller: 'setupCtrl'
        }
      }
    })
    .state('about', {
      url: '/setup/about',
      views: {
        'main-view': {
          templateUrl: 'app/setup/about.html',
          controller: 'AboutCtrl'
        }
      }
    })
});
