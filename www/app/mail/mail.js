
angular.module('indiplatform.mail', ['ionic', 'indiplatform.mail.services', 'indiplatform.mail.controllers'])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tab.mail', {
      url: '/mail',
       
      views: {
        'mail-tab': {
          templateUrl: 'app/mail/mail.html',
          controller: 'boxCtrl'
        }
      }
    })
   .state('mailcontent', {
      url: '/mailcontent/:unid',
          cache: false,
      views: {
        'main-view': {
          templateUrl: 'app/mail/mailcontent.html',
          controller: 'actionsCtrl'
        }
      }
    })
   .state('writemail', {
     // url: '/writemail/:id',
      url: '/writemail/{unid:.*}/{type:.*}/{range:.*}?defaddress',
      cache: false,
      views: {
        'main-view': {
          templateUrl: 'app/mail/writemail.html',
          controller: 'actionsCtrl'
        }
      }
    })
});
