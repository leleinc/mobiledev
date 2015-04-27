
angular.module('indiplatform.todo', ['ionic', 'indiplatform.todo.services', 'indiplatform.todo.controllers'])


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tab.home.todo', {
      url: "/todo",
      views: {
        'todo-tab': {
          templateUrl: 'app/todo/todo.html',
          controller: 'TodosCtrl'
        }
      }
    })
    .state('tab.home.toread', {
      url: "/toread",
      views: {
        'toread-tab': {
          templateUrl: 'app/todo/toread.html',
          controller: 'ToreadsCtrl'
        }
      }
    })  
});

