angular.module('indiplatform.webflow', ['ionic', 'indiplatform.webflow.services', 'indiplatform.webflow.controllers', 'monospaced.elastic'])

.run(function ($ionicPlatform, PushService) {
    $ionicPlatform.ready(function(){

      //alert("$ionicPlatform.ready");
      PushService.init();

      window.requestFileSystem && window.requestFileSystem(LocalFileSystem.TEMPORARY,0,function(fs){
        window._tempFs=fs;
      })
    })
})
.config(function($stateProvider, $urlRouterProvider) {
  var islockedRE = /用户(.*?)已加锁/;
  $stateProvider
    .state('webflow', {
      url: '/webflow/{domain:[^\/]*}{path:.*}/{id:[0-9a-fA-F]{32}}',
      cache: false,
      views: {
        'main-view': {
          templateUrl: 'app/webflow/webflow.html',
          controller: 'WebflowCtrl'
        }
      },
      onEnter: function($stateParams, $state, FormDataService, $filter, $ionicPopup) {
        // 进入时加锁
        FormDataService.addLock({
          domain:$stateParams.domain,
          dbpath:$stateParams.path,
          unid: $stateParams.id
        }).then(function(data) {
          var islocked = data.msg.match(islockedRE);
          if(islocked && islocked[1]) {
            var lockBy = $filter('domUser')(islocked[1]);
            $ionicPopup.alert({
              title: lockBy+'正在处理，请稍后再试'
            }).then(function(){
              $state.go("tab.home.todo")
            });
          }
          //console.info(data.msg);
        });
      },
      onExit: function($stateParams, FormDataService) {
        // 退出时解锁
        FormDataService.clearLock({
          domain:$stateParams.domain,
          dbpath:$stateParams.path,
          unid: $stateParams.id
        }).then(function(data) {
          //console.info(data.msg);
        });
      }
    });

});