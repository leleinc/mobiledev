angular.module('indiplatform.common.service', [])
.factory('UrlService', function(CONFIG) {
	return {
		transform:function(url){
			var dom_root = CONFIG.DOM_ROOT;
			if(url.indexOf("http://") === 0){
				url = "/_api" + url.replace("http://","/");
			}
			if(url.indexOf(".nsf") !== -1 && url.indexOf(dom_root) !== 0){
				url =  dom_root + url;
			}
	        if(url.indexOf("/") === 0){
	        	url =  location.protocol + "//" + location.host + url;
	        }
			return url;
		}
	}
})
.factory('AppinfoService', function($q,$http,$ionicPlatform) {
  return {
    getVersion:function(){
      var deferred = $q.defer();
      $ionicPlatform.ready(function(){
        if(typeof cordova!=="undefined" && cordova.getAppVersion){
          cordova.getAppVersion.getVersionNumber(function (version) {
            deferred.resolve(version);
          });
        }else{
          deferred.resolve("0.0.0");
        }
      });
      return deferred.promise;
    },
    checkUpdate:function(){
      var deferred = $q.defer();
      $http.get("/_api/checkupdate").success(function(data){
        deferred.resolve(data);
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
})
.factory('wwwinfoService', function($q,$http,$ionicPlatform) {
  function extractVer(str){
    var match = str.match(/mobile_www\/.*?_v([^\/]*)/);
    if (match != null) {
      return match[1];
    } else {
      return "0";
    }
  }
  return {
    getVersion:function(){
      return extractVer(location.href);
    },
    checkUpdate:function(){
      var deferred = $q.defer();
      $http.get("/mob_www_ver").success(function(data){
        deferred.resolve(extractVer(data));
      }).error(function(data){
        deferred.reject(data);
      });
      return deferred.promise;
    }
  }
})
.config(function($provide) {
  // 修改对话框的默认按钮文字
  $provide.decorator('$ionicPopup', function($delegate) {
    var _old_confirm = $delegate.confirm;
    $delegate.confirm = function(opts){
      return _old_confirm.apply($delegate, [processBtnText(opts)]);
    }
    var _old_prompt = $delegate.prompt;
    $delegate.prompt = function(opts){
      return _old_prompt.apply($delegate, [processBtnText(opts)]);
    }

    var _old_alert = $delegate.alert;
    $delegate.alert = function(opts){
      return _old_alert.apply($delegate, [processBtnText(opts)]);
    }

    function processBtnText(opts){
      return angular.extend({
        cancelText: opts.cancelText || '取消',
        okText: opts.okText || '确定',
      }, opts || {});
    }

    return $delegate;
  });  
})