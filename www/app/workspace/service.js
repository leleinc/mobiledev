
angular.module('indiplatform.workspace.services', [])


.factory('AuthService', function($http,$timeout,UrlService) {
  return {
    setUserinfo: function(info){
      var strAuth = 'Basic ' + toBase64(info.name + ":" + info.pass);
      localStorage.setItem("ba",strAuth);
      return $timeout(function(){
      	document.cookie = "ba=" + strAuth + "; path=/; expires=Wed, 06-May-2028 06:02:55 GMT";
      });
    },
    isAuthed:function(){
      return !!localStorage.getItem("ba");
    },
    getUserinfo: function(){
      return $http.post("/indishare/inditraveler.nsf/api.xsp/api",{
        method: "getUserInfo",
        params: []
      }).then(function(res){
        res.data.result.avatar = UrlService.transform(res.data.result.avatar||"/indishare/addressbook.nsf/noimg.png");
        localStorage.setItem("uinfo",angular.toJson(res.data.result));
        return res.data.result;
      });
    },    
    clearUserinfo: function(info){
      localStorage.removeItem("ba");
      localStorage.removeItem("uinfo");
      return $timeout(function(){
      	document.cookie = "ba=; path=/; expires=Wed, 06-May-2008 06:02:55 GMT";
      });
    }
  }

  function toBase64(input){
      var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      do {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }

          output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) +
          keyStr.charAt(enc3) + keyStr.charAt(enc4);
      } while (i < input.length);

      return output;
  }

}).factory('LoginService', function($http,UrlService) {
  return {
    getUserinfo: function(){
      var name = localStorage["m_name"]||"";
      var pass = localStorage["m_pass"]||"";
      var savepass = localStorage["m_savepass"]==="true";
      return {
          name:name,
          pass:pass,
          savepass:savepass
      }
    },
    setUserinfo: function(info){
      localStorage["m_name"] = info.name;
      localStorage["m_savepass"] = info.savepass;
      localStorage["m_pass"] = info.savepass?info.pass:"";
      //sessionStorage["m_name"] = info.name;
      //sessionStorage["m_pass"] = info.pass;
    },
    logout: function(){
      //delete sessionStorage["m_name"];
      //delete sessionStorage["m_pass"];
    },
    requestVerifyPass: function(scope,info){
      var data = {
        username:info.name,
        password:info.pass,
        redirectto: UrlService.transform("/indishare/indidomcfg.nsf/pgshowusername_PA_?openpage")
      };
      $http({
        method: 'POST',
        url: "/names.nsf?login",
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        data: data
      }).success(function(data,code,getHeaders){
        if(getHeaders("content-type")==="text/plain"){
          scope.$emit("login.success");
        }else{
          scope.$emit("login.failed");
        }
      });
    }
  };
}).factory("PushService", function($http,UrlService, LoginService, $state, $ionicLoading, $timeout, AuthService, $rootScope) {
	var myLog = {
			debug: false,
			log: function(msg){
				var me = this;
				if (me.debug){
					alert(msg);
				}
				console.log(msg);
			},
			error: function(error){
				alert(error);
			}
		}

		var JPushService = {
			smPushService: null,
			init: function(smPushService){
				myLog.log("极光推送插件初始化...");

				var me = this;
				me.smPushService = smPushService;
				if (window.plugins && window.plugins.jPushPlugin){
					smPushService.pushPlugin =  window.plugins.jPushPlugin;
				
					//启动极光推送服务
					window.plugins.jPushPlugin.init();
					//调试模式
					window.plugins.jPushPlugin.setDebugMode(myLog.debug);
					
					//此处调用, 第一次安装后获取不到设备id, 需要重新进入应用才行; 20150417
					//window.plugins.jPushPlugin.getRegistrationID(me.onGetRegistradionID.bind(me));
				} else {
					myLog.log('未安装JPushService插件, 无法支持消息推送!');
				}
			},
			delayRegister: function(smPushService){
				myLog.log('进入JPushService插件delayRegister函数...!');

				var me = this;
				if (window.plugins && window.plugins.jPushPlugin){
					window.plugins.jPushPlugin.getRegistrationID(me.onGetRegistradionID.bind(me));
					//测试发现这个触发不了, 注释掉先
					//document.addEventListener("jpush.receiveNotification", me.onReceiveNotification, false);
				}
			},
			//杀掉进程后, 注销用户的时候需要调用这个获取设备id
			getRegistrationID: function(callback){
				if (window.plugins && window.plugins.jPushPlugin){
					window.plugins.jPushPlugin.getRegistrationID(callback);
				}
			},
			onGetRegistradionID: function(data) {
				var me = this;
				try{
					if (data){
						me.smPushService.onReady(data);
						me.smPushService.registerToMaump();
						myLog.log("极光推送插件设备id:" + data);
						//myLog.log("JPushService:registrationID is "+data);
						//if (myLog.debug) window.prompt("极光推送插件设备id:", data);
					} else {
						myLog.log('极光推送插件获取设备id失败, 请重连一下wifi, 然后重新进入系统!');
					}
				}
				catch(exception){
					myLog.log(exception);
				}
			},
			/*无法触发, 注释掉先
			onReceiveNotification: function(event){
				if (!AuthService.isAuthed()){
					alert("未登录, 缓存消息先!");
					window.eventsCache.push(event);
					return;
				}
			
				try{
					var alertMsg   = event.aps.alert;
					console.log("JPushService-onReceiveNotification key aps.alert:"+alertMsg);
					alert("JPushService-onReceiveNotification key aps.alert:"+alertMsg);
				}
				catch(exeption){
					console.log(exception)
				}
			},
			*/
			onOpenNotification: function(event){
				//myLog.log("JPushService-onOpenNotification...");
				var smPushService = this; //注意: 这个函数的this被绑定到了PushService上了.
				
				//目前app退出后这个函数无法收到这个消息, 注释掉先
				//if (!smPushService.isLogined){
				//if (!AuthService.isAuthed()){
				//	smPushService.eventsCache.push(event);
				//	alert("not login, cache message!");
				//	return;
				//}
			
				try{
					var alertMsg   = event.alert;
					var extras  = event.extras;
					smPushService.gotoUrl(event);
					//myLog.log("已登录, 后台消息:" + event.alert);
					
				}
				catch(exeption){
					console.log(exception)
				}
			}
		};
		var pushNotificationService = {
			pushPlugin: null,
			smPushService: null,
			init: function(smPushService){
				myLog.log("iOS插件 initing...");
				
				var me = this;
				me.smPushService = smPushService;
				if (window.plugins && window.plugins.pushNotification){
					myLog.log("ios插件 init...register");
				
					smPushService.pushPlugin =  window.plugins.pushNotification;
					me.pushPlugin = window.plugins.pushNotification;
					
					me.pushPlugin.register(
						me.tokenHandler.bind(me),
						me.errorHandler,
						{
							"badge":"true",
							"sound":"true",
							"alert":"true",
							"ecb":"onNotificationAPN"
						}
					);
				}else{
					myLog.log("ionic 没有安装pushNotification插件, 无法支持推送功能!");
				}
			},
			getRegistrationID: function(callback){
				var me = this;
				if (window.plugins && window.plugins.pushNotification){
					window.plugins.pushNotification.register(
						callback,
						me.errorHandler,
						{
							"badge":"true",
							"sound":"true",
							"alert":"true",
							"ecb":"onNotificationAPN"
						}
					);
				}
			},
			tokenHandler: function(result) {
				myLog.log("ios插件 register成功, 设备编码:" + result);
				//window.prompt("pushNotification初始化成功, 设备编码:", result);
			
				var me = this;
				me.smPushService.onReady(result);
			},
			errorHandler: function(error) {
				myLog.log("ios插件 初始化错误:" + error);
			},
			onNotificationAPN: function(event) {
				var smPushService = this; //注意: 这个函数的this被绑定到了PushService上了.
				
				//android还没有支持这个特性, ios也先取消先;20150331
				//if (!AuthService.isAuthed()){
				//	smPushService.eventsCache.push(event);
				//	return;
				//}
				
				
				if ( event.alert ){
					if (event.foreground === "1"){
						$ionicLoading.show({
					      	template: '<i class="ion-checkmark-round"></i> ' + event.alert,
			  				noBackdrop: true
					    });
						$timeout(function() {
					      	$ionicLoading.hide();
					    }, 2000);
						console.log("已登录, 前台消息:" + event.alert);
						//此处如何处理还需等待设计??
					}else{
						smPushService.gotoUrl(event);
						console.log("已登录, 后台消息:" + event.alert);
					}
				}
			}			
		};
		var PushService = {
			pushType: 1,
			platForm: 'iOS',
			deviceName: 'iPhone',
			pushPlugin: null,
			isReady: false,
			deviceId: null,
			state: null,//登录成功后调用register设置这个值, 以供页面跳转
			isLogined: false,//AuthService.isAuthed这个属性不好用, 改用这个开控制; 进程杀掉后这个状态会消失, 所以还得用AuthService.isAuthed
			eventsCache: [],
			/*测试代码
			receiveMessageInAndroidCallback: function(data){
				alert('receiveMessageInAndroidCallback:' + data);
			},
			openNotificationInAndroidCallback: function(data){
				alert('openNotificationInAndroidCallback:' + data);
			},
			reportNotificationOpened: function(data){
				alert('reportNotificationOpened:' + data);
			},
			*/
			
			//注意: 这个方法要先于init执行, 否则无法缓存未登录的消息(因为收消息的事件比ionic.platform.ready触发的早)
			bindReceiveEvent: function(){
				var me = this;
				if (ionic.Platform.isIOS()){
					window.onNotificationAPN = pushNotificationService.onNotificationAPN.bind(me);
				} else if (ionic.Platform.isAndroid()){
					document.addEventListener("jpush.openNotification", JPushService.onOpenNotification.bind(me), false);
				} else {
					myLog.log("推送不支持的操作系统平台!");
				}
			},
			init: function(){
				myLog.log("进入推送服务的init方法...");
				var me = this;
				if (ionic.Platform.isIOS()){
					myLog.log("准备初始化ios推送插件...");
					
					me.pushType = 1;
					me.platForm = 'iOS';
					me.deviceName = 'iPhone';
					pushNotificationService.init(me);
				} else if (ionic.Platform.isAndroid()){
					myLog.log("准备初始化极光推送插件...");
					
					me.pushType = 3;
					me.platForm = 'android';
					me.deviceName = 'android';
					JPushService.init(me);
					
					/*可以拦截到隐含消息内容; 暂时不用;20150331
					if (window.plugins && window.plugins.jPushPlugin){
						var plugin = window.plugins.jPushPlugin;
						plugin.receiveMessageInAndroidCallback = me.receiveMessageInAndroidCallback.bind(me);
						plugin.openNotificationInAndroidCallback = me.openNotificationInAndroidCallback.bind(me);
						plugin.reportNotificationOpened = me.reportNotificationOpened.bind(me);
						alert('bind jpush receiver ok!');
					}else{
						alert('window.plugins.jPushPlugin not exists!');
					}
					*/
				} else {
					myLog.log("推送不支持的操作系统平台!");
				}
			},
			onReady: function(deviceId){
				myLog.log("推送插件注册成功, 设备id:" + deviceId);
				var me = this;
				me.isReady = true;
				me.deviceId = deviceId;
				//alert("pushNotification init success:" + deviceId);
			},
			registerToMaump: function(){
				var me = this;
				//me.state = state;
				var pushType = me.pushType;
				var platForm = me.platForm;
				var deviceName = me.deviceName;
				var deviceTokey = me.deviceId;
				
				var loginUser =  LoginService.getUserinfo();
				var userId = loginUser.name;
				
				//alert('in PushService.register, LoginService.loginUser:' + loginUser.name);
				//var userId = "iPhone4test";
				//var deviceTokey = "7929d63534d3460f29c99921d15de6506717e257379bd8afa59616a060ea595e"; //apple设备编码; iPhone4test手机设备编码;
				//iPhone4test手机
				//alert('$http.get');
				var msg = {"userId": userId, 
						"appName":"",
						"platForm":platForm,
						"appVersion":"1.0",
						"deviceToken": deviceTokey, 
						"deviceName":deviceName,
						"platFormVersion":"4.0.1",
						"status":"1",
						"groupId":"1",
						"apiKey":"", 
						"secretKey":"", 
						"appId": "Indi.Traveler", //这个为常量, 调用maump/pushController/pushMessage也会传递这个, 和应用的app是两个概念
						"geAppId":"",
						"pushType":pushType};
				
				var url = "/_api/_push/addUserPush" + "?msg=" + JSON.stringify(msg);
				$http({
					method: 'GET',
					url: url,
					data: null
				}).success(function(data,code,getHeaders){
					myLog.log("注册推送用户成功!");
				}).error(function(response, status, headers, config){
					myLog.error("注册推送用户失败, 请检查推送服务是否启动!");
				});
			},
			register: function(){
				//myLog.log("Pushservice-register...");
				var me = this;

				//有种特殊情况未考虑清楚, 就是登陆成功后, 推送服务没有就绪(尤其是android第一次安装时容易出现这种问题), 该如何处理?
				//极光推送插件, 第一次安装时获取到设备id速度较慢, 此处特殊处理; 
				if (ionic.Platform.isAndroid()){
					JPushService.delayRegister(me);
				} else {
					if (me.isReady){
						me.registerToMaump();
					} else {
						myLog.log("推送服务未能成功安装, 请检查!");
					}
				}

			},
			unregister: function(){
				//alert('unregister');
				var me = this;
				//var deviceTokey = me.deviceId; //杀掉进程后deviceId就不存在了, 需要修改设计20150422
				
				var sendHttp = function(deviceTokey){
					var msg = {"deviceToken": deviceTokey,  "status":"0"};
					var url = "/_api/_push/onOffPush" + "?msg=" + JSON.stringify(msg);
					$http({
						method: 'GET',
						url: url,
						data: null
					}).success(function(data,code,getHeaders){
						myLog.log("注销用户成功!");
					}).error(function(response, status, headers, config){
						myLog.error("注销推送用户失败, 请检查推送服务是否启动!");
					});
				};
				var callback = function(deviceId){
					sendHttp(deviceId);
				};
				if (ionic.Platform.isIOS()){
					pushNotificationService.getRegistrationID(callback);
				} else if (ionic.Platform.isAndroid()){
					JPushService.getRegistrationID(callback);
				} else {
					myLog.log("注销用户失败, 推送不支持的操作系统平台!");
				}
				
			},
			gotoUrl: function(event){
				var me = this;
				//myLog.log("PushService-gotoUrl, event:" + event);
				
				var msg = event.alert;
				var url = "tab.home.todo";
		    	if(msg.indexOf("您有新待办") !== -1){
					url = "tab.home.todo";
		    	}else if(msg.indexOf("您有新待阅") !== -1){
					url = "tab.home.toread";
		    	}else if(msg.indexOf("您有新公告") !== -1){
					url = "tab.home.news";
		    	}else if(msg.indexOf("您有新邮件") !== -1){
					url = "tab.mail";
		    	}
				
				$rootScope.$broadcast("tab.refreshdata", {from:me, url: url});
				//$state.go(url, {refresh: true});
				//$rootScope.refresh = true;	
				$state.go(url);
			}
		};
	/*
	这里注入$scope会失败, 所以无法拦截消息
	$scope.$on("login.success", (function(){
		var me = this;
		me.init();
	}).bind(pushService));
	*/
	//这个方法执行的早于init方法; 否则app退出后, 从通知无法得到消息内容
	//alert('factory PushService');
	PushService.bindReceiveEvent();
	return PushService;
})
.factory("VersionTuiSongService",function($ionicPopup,CONFIG,AppinfoService,VersionService){
    return {
        //查验新版本
        versionCheck:function(){
            AppinfoService.getVersion().then(function(local){
                var localVersion = local;//本地版本 
                //获取服务器版本
                AppinfoService.checkUpdate().then(function(v){
                    if(v && v.version && localVersion){
                        var result = VersionService.versionCompare(localVersion,v.version);
                        if(result == -1){
                            $ionicPopup.confirm({
                                title: CONFIG.APP_NAME + v.version + '已发布',
                                subTitle: "是否立即更新？",
                                cancelText: "暂不更新",
                                okText: "立即更新"
                            }).then(function(res){
                                if(res){
                                    VersionService.newVersionDownload(v.url);
                                };
                            }); 
                        }; 
                    }else{
                        console.error("版本检测失败");
                    };
                });
            });
        }
    }
});

