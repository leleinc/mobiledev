angular.module('indiplatform.common', ['angularMoment','indiplatform.common.service', 'indiplatform.common.filter', 'indiplatform.common.directive'])
.run(function ($ionicPlatform,wwwinfoService) {
    $ionicPlatform.ready(function(){
      navigator.splashscreen && navigator.splashscreen.hide();
      cordova.plugins.Keyboard.disableScroll(true);
    });
    $ionicPlatform.on("resume",function () {
      wwwinfoService.checkUpdate().then(function (ver) {
        var update = wwwinfoService.getVersion();
        if(ver!==update){
          navigator.splashscreen && navigator.splashscreen.show();
          location.href = "/mobile_www/";
        }
      });
    })
    document.addEventListener('invalid', function(e){
        //prevent the browser from showing default error bubble/ hint
        e.preventDefault();
    }, true);
})
.config(function($httpProvider) {
  //$httpProvider.defaults.withCredentials = true;
  $httpProvider.interceptors.push(function($rootScope,$injector,$timeout,$q) {
    return {
      // 生成几个和http请求相关的事件
      request: function(config) {
        // 登录请求需要允许传递cookie
        if(config.url.indexOf("?login")===-1){
          //config.headers["Authorization"] = config.headers["Authorization"] || getAuthString();
          config.withCredentials = true;
        }
        // 如果未设置自定义timeout函数，增加通用的
        if((!config.timeout || angular.isNumber(config.timeout)) && isXhrByUser(config)){
          addTimtout(config);
        }
        //
        var trans_url = $injector.get('UrlService').transform;
        config.url = trans_url(config.url);

        $rootScope.$broadcast('xhr:start',config);
        return config;
      },
      response: function(response) {
        if(angular.isFunction(response.config.headers) && response.headers("logintype") === "0"){
          $rootScope.$broadcast('xhr:loginError',response);          
        }
        $rootScope.$broadcast('xhr:finish',response);
        return response;
      },
      requestError: function(config){
        $rootScope.$broadcast('xhr:requestError',config);
      },
      responseError: function(response){
        // logintype === 0 登录页
        if(angular.isFunction(response.config.headers) && response.config.headers("logintype") === "0"){
          $rootScope.$broadcast('xhr:loginError',response);          
        }
        $rootScope.$broadcast('xhr:responseError',response);
      }
    }

    function addTimtout(config){
      var canceller = $q.defer();
      var timeout = config.timeout;
      config.timeout=canceller.promise;
      config.canceller = canceller;
      if(timeout){
        $timeout(function() {
          canceller.resolve();
        },timeout);
      }
    }
    // 从本地存储获取认证信息
    function getAuthString(){
      var strAuth = localStorage.getItem("ba") || "";
      return strAuth;
    }
  })
})
.run(function($http, $rootScope, $ionicLoading, $timeout) {
  var loadingCount = 0;
  var loadingPromise;
  $rootScope.$on('xhr:start', function(evt,config) {
    // 忽略非用户出发的请求
    if(!isXhrByUser(config)) return;
    loadingCount++;
    // 在tab列表页or待办页不显示加载框
    var pagename = evt.currentScope.$state.current.name;
    if(pagename.indexOf("tab.") !== -1 || pagename.indexOf("mydone") !== -1 || pagename.indexOf("myattention") !== -1|| pagename.indexOf("mydraft") !== -1 || pagename.indexOf("myread") !== -1){
      return;
    }
    // 取消上一个loading定时
    if(loadingPromise){
      $timeout.cancel(loadingPromise);
    }
    // 延迟一定时间再显示
    loadingPromise = $timeout(function(){
      $ionicLoading.show({
        template: '<ion-spinner class="spinnerContent" icon="ios"></ion-spinner><span ng-click="cancelXhr()">正在加载 <i class="icon ion-android-close"></i></span>',
        noBackdrop: false
      });
    },1000);

  })

  $rootScope.cancelXhr = (function(http){
    return function(){
      http.pendingRequests.forEach(function (req) {
        req.canceller && req.canceller.resolve();
      });      
    }
  })($http);
  // 请求完成时，隐藏加载框
  $rootScope.$on('xhr:finish', function(evt,response) {
    if(!isXhrByUser(response.config)) return;
    loadingCount--;
    if(loadingCount === 0){
      $timeout.cancel(loadingPromise);
      $ionicLoading.hide();
    };
  })

  $rootScope.$on('xhr:responseError', function(evt,response) {
    if(!isXhrByUser(response.config)) return;

    // 处理ws返回的错误
    var msg = "";
    if(response instanceof Error){
      msg = "后台服务错误";
    }else{
      if(response.status !== 200 && response.status !== 0){
        msg = "处理请求时发生错误<br>" + response.status + " " + response.statusText;
      }else{
        msg = "网络错误，请稍候重试";
      }
    }

    // 手工取消的请求，不显示错误
    var showError = !(response.config.timeout && response.config.timeout.$$state && response.config.timeout.$$state.status === 1);
    if(showError){
      // 显示错误提示
      $ionicLoading.show({
        template: '<i class="ion-ios7-information-outline"></i> ' + msg,
        noBackdrop: false
      });
    }

    loadingCount--;
    if(loadingCount === 0){
      $timeout.cancel(loadingPromise);
      $timeout(function(){
        $ionicLoading.hide();
      },showError?1000:0);
      // 发出下拉刷新完成的事件
      evt.currentScope.$broadcast('scroll.refreshComplete');
    }
  })
})
.run(function(amMoment) {
  amMoment.changeLocale('zh-cn');
  // 定制日期显示格式
	var _calendar = moment.localeData("zh-cn").calendar;
	moment.localeData("zh-cn").calendar = function(type,oMoment){
    	var result = _calendar.apply(this, arguments);
		switch(type) {
		    case "sameDay":
		        result = result.replace("[今天]","");
		        break;
		    case "lastDay":
		        result = '[昨天]';
		        break;
		    case "lastWeek":
		        result = result.split("Ah")[0];
		        break;
		    case "sameElse":
		    	if(moment().year() === oMoment.year()){
		    		result = 'MoDo';
		    	}else{
		        	result = 'L';
		    	}
		        break;
		} 
    	return result;
    }
    // Domino时间格式的预处理
    amMoment.preprocessors["domino"] = function(value, format){
      return moment.utc(value.replace(" ZE8","").replace(/-/g,"/"), format).zone("+08:00");
    }
})
.config(function($ionicConfigProvider) {
  // 修改ionic默认样式
  $ionicConfigProvider.backButton.previousTitleText(false).text('').icon('indi-fanhui');
  $ionicConfigProvider.form.toggle("large");
  $ionicConfigProvider.tabs.position('bottom').style("standard");
  $ionicConfigProvider.navBar.alignTitle('center');
})
.run(function ($state,$rootScope) {
    // 便于在表达式中判断当前state
    $rootScope.$state = $state;
})
.constant('angularMomentConfig', {
    preprocess: 'domino'
});

// 区分用户发出的数据请求 或 ionic发出的模板请求
function isXhrByUser(config){
  return config.url.indexOf("app/")!==0;
}