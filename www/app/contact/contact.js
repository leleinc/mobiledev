
angular.module('indiplatform.contact', ['ionic', 'indiplatform.contact.services', 'indiplatform.contact.controllers'])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('tab.contacts', {
      url: '/contacts',
      cache: true,
      views: {
        'contacts-tab': {
          templateUrl: 'app/contact/contact.html',
           controller: 'ContactCtrl'
        }
      }
    })
	.state('person', {
      url: '/person/:name/:unid/:imgpath',
      cache: false,
      views: {
        'main-view': {
          templateUrl: 'app/contact/person.html',
          controller: 'personCtrl'
        }
      }
  })
    .state('selectdep', {
      url: '/selectdep',
      cache: false,
      views: {
        'main-view': {
          templateUrl: 'app/contact/selectdep.html',
          controller: 'selectdepCtrl'
        }
      }
    })
})
