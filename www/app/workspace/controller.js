angular.module('indiplatform.workspace.controllers', [])
.controller('TabCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})
.controller('LoginCtrl', function($scope, $state,$ionicPopup,$ionicHistory, LoginService, AuthService, PushService) {
  $scope.userinfo = LoginService.getUserinfo();
  $scope.invalid = false;
  $ionicHistory.clearHistory();

  // 实际登录的方法
  $scope.doLogin = function() {
    LoginService.getUserid($scope.userinfo.showname).then(function(userid){
      if(!userid){
        // 没找到对应的userid，登陆失败
        $scope.$emit("login.failed");
      }else{
        $scope.userinfo.name = userid;
        LoginService.requestVerifyPass($scope,$scope.userinfo);
      }
    });
  };

  $scope.$on('login.success',function(){

    $scope.invalid = false;
    // 记住用户名密码
    LoginService.setUserinfo($scope.userinfo);

    //注意:要在LoginService.setUserinfo之后调用, 因为PushService依赖LoginService获取用户id了; shanglihui20150401
    PushService.register();

    // 请求并存储认证token
    AuthService.setUserinfo($scope.userinfo).then(function(){
      AuthService.getUserinfo().then(function(result){
        $scope.context.userinfo = result;   
        $state.go("tab.home.todo");  
      });
    });   
  });
  $scope.$on('login.failed',function(){
    $scope.invalid = true;
    window.cordova && cordova.plugins.Keyboard.close();
    $ionicPopup.alert({
      title: '登录失败',
      content: '用户名或密码错误，请重新输入'
    })
  });
})

.controller('MainCtrl', function($rootScope,$scope,$state,$location,$ionicModal,AuthService,CONFIG,$ionicSideMenuDelegate, PushService) {
  $scope.context = {};
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $rootScope.$on( "$ionicView.enter", function( scopes, states ) {
    if(states.stateName) {
      if(scopes.currentScope.$root.refresh && scopes.targetScope.doRefresh){
        delete scopes.currentScope.$root.refresh
        scopes.targetScope.doRefresh(true)
      }
    }
  });

  // 当xhr返回登录页时，密码失效。调用logout
  $scope.$on('xhr:loginError', function(evt,config) {
    $location.path("/logout");
  });

  // 未通过认证，调到登录页
  if(!AuthService.isAuthed()){
    $location.path("/login");
    return;
  }

  var localinfo = localStorage.getItem("uinfo");
  if(localinfo){
    $scope.context.userinfo = angular.fromJson(localinfo);
  }

  AuthService.getUserinfo().then(function(result){
    $scope.context.userinfo = result;   
  });

})
.controller('LogoutCtrl', function($state,$ionicHistory,AuthService, PushService) {
  AuthService.clearUserinfo().then(function(){
    $state.go("login");
    $ionicHistory.clearCache();

    //取消和设备的推送绑定;20150401shanglihui
    PushService.unregister();
  });
})
.controller('HomeCtrl', function($scope) {

})
