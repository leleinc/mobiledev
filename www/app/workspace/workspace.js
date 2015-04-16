
angular.module('indiplatform.workspace', ['indiplatform.workspace.services', 'indiplatform.workspace.controllers','indiplatform.setup.controllers','indiplatform.todo.controllers','indiplatform.setup.services'])
.run(function ($ionicPlatform, VersionTuiSongService) {
    $ionicPlatform.ready(function(){
        //检测版本信息
        VersionTuiSongService.versionCheck();
    });
})
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tab', {
      url: "/tab",
      abstract: true,
      views:{
        'main-view': {
          templateUrl: "app/workspace/tabs.html",
          controller: 'TabCtrl'
        }
      }
    })

    .state('tab.home', {
      url: "/home",
      abstract: true,
      views: {
        'home-tab': {
          templateUrl: 'app/workspace/home.html',
          controller: 'HomeCtrl'
        }
      }
    })
   /* .state('tab.home.news', {
      url: "/news",
      views: {
        'news-tab': {
          templateUrl: 'app/workspace/news.html'
        }
      }
    })      */
    .state('login', {
      url: "/login",
      views: {
        'main-view': {
          templateUrl: "app/workspace/login.html",
          controller: 'LoginCtrl'
        }
      }
    })

    .state('tab.more', {
      url: "/more",
      views: {
        'more-tab': {
          template: '<ion-view title="更多"><ion-content>更多</ion-content></ion-view>'
        }
      }
    })

    .state('logout', {
      url: "/logout",
      cache: false,
      views: {
        'main-view': {
          template: '',
          controller: 'LogoutCtrl'
        }
      }
    })
    
    .state('setup', {
      url: "/setup",
      views: {
        'main-view': {
          templateUrl: 'app/setup/setup.html',
          controller: 'setupCtrl'
        }
      }
    })

    .state('mydone', {
      url: "/mydone",
      views: {
        'main-view': {
          templateUrl: 'app/todo/mydone.html',
          controller: 'MydonesCtrl'
        }
      }
    })

    .state('myattention', {
      url: "/myattention",
      views: {
        'main-view': {
          templateUrl: 'app/todo/myattention.html',
          controller: 'MyattentionsCtrl'
        }
      }
    })

    .state('mydraft', {
      url: "/mydraft",
      views: {
        'main-view': {
          templateUrl: 'app/todo/mydraft.html',
          controller: 'MydraftsCtrl'
        }
      }
    })

    .state('myread', {
      url: "/myread",
      views: {
        'main-view': {
          templateUrl: 'app/todo/myread.html',
          controller: 'MyreadsCtrl'
        }
      }
    })

    .state('myinfo', {
      url: '/myinfo',
      views: {
        'main-view': {
          templateUrl: 'app/setup/myinfo.html',
          controller: 'myinfoCtrl'
        }
      }
    })

    .state('changepw', {
      url: '/changepw',
      views: {
        'main-view': {
          templateUrl: 'app/setup/changepw.html',
          controller: 'changePWCtrl'
        }
      }
    })
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/home/todo');
})