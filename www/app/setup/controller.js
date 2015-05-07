
angular.module('indiplatform.setup.controllers', ['ionic','ngResource','x2js']).
controller('setupCtrl', function($scope,pushInfoService) {
	$scope.toggleLeft = function() {
		$ionicSideMenuDelegate.toggleLeft();
	};
	//1.1 消息通知list
	$scope.userid = "";
	var localinfo = localStorage.getItem("uinfo");
	if(localinfo){
		var objmyinfo = angular.fromJson(localinfo);
	}
	var userid = objmyinfo.userid;
	$scope.userid = userid;
	pushInfoService.get(userid).then(function(data) {
		angular.forEach(data.data.items,function(item){
			if(item.checked === "true"){
				item.checked = true;
			}else{
				item.checked = false;
			}
		});
		$scope.pushList = data.data;
	});
	$scope.fnPushList = function(item){
		var strKey = "";
		strKey = item.type;
		if(strKey != ""){
			pushInfoService.save($scope.userid,angular.toJson($scope.pushList)).then(function(data) {
				console.log(data)
			});			
		}
	};
	//1.1 消息通知list
	//2 文件默认预览方式
	$scope.fileShowList = [
		{"type":"rep",text:"重排版",value:"republishing"},
		{"type":"ori",text:"原始版",value:"origin"}
	];
	var strFileShow = ""
	if(!("fileShow" in localStorage) || localStorage["fileShow"]==""){
		localStorage["fileShow"] = "origin";
		strFileShow = "origin";
	}else{
		strFileShow = localStorage["fileShow"];
	}
	$scope.fnfileShowList = function(item){
		localStorage["fileShow"] = item.value;
	};
	//2 文件默认预览方式 end
	//3 皮肤
	$scope.sysSkinList = [
		{"type":"blue",text:"蓝色系",value:"blue"},
		{"type":"black",text:"暗黑系",value:"black"}
	];
	var strSkinShow = ""
	if(!("skinShow" in localStorage) || localStorage["skinShow"]==""){
		localStorage["skinShow"] = "blue";
		strSkinShow = "blue";
	}else{
		strSkinShow = localStorage["skinShow"];
	}
	$scope.fnsysSkinList = function(item){
		localStorage["skinShow"] = item.value;
	};
	//3皮肤 end
	//4 手写
	var strhandWriting = "";
	var objhandWriting = {};
	if(!("handWriting" in localStorage) || localStorage["handWriting"]==""){
		localStorage["handWriting"] = false;
		strhandWriting = false;
	}else{
		strhandWriting = localStorage["handWriting"]==="false"?false:true;
	}
	objhandWriting = {
		text:"手写签批",
		checked:strhandWriting
	}
	$scope.fnhandWriting = function(item){
		localStorage["handWriting"] = item.checked;
	};
	//4 手写end
	//5 手写
	var strvoice = "";
	var objvoice = {};
	if(!("voice" in localStorage) || localStorage["voice"]==""){
		localStorage["voice"] = false;
		strvoice = false;
	}else{
		strvoice = localStorage["voice"]==="false"?false:true;
	}
	objvoice = {
		text:"语音审批",
		checked:strvoice
	}
	$scope.fnvoice = function(item){
		localStorage["voice"] = item.checked;
	};
	//5 手写end
	//6 多语言
	$scope.sysLangList = [
		{"type":"simChina",text:"简体中文",value:"simChina"},
		{"type":"eng",text:"英文",value:"eng"}
	];
	var strLang = ""
	if(!("langShow" in localStorage) || localStorage["langShow"]==""){
		localStorage["langShow"] = "simChina";
		strLang = "simChina";
	}else{
		strLang = localStorage["langShow"];
	}
	$scope.fnsysLang = function(item){
		localStorage["langShow"] = item.value;
	};
	//6多语言 end
	$scope.showData = {
		showFile:strFileShow,
		showSkin:strSkinShow,
		handWriting:objhandWriting,
		voice:objvoice,
		showLang:strLang
	};
	//测试专用
    $scope.pushNotificationChange = function(){
    	
    };
  $scope.pushNotification = {checked:true};
  $scope.emailNotification = 'Subscribed';
})
.controller('myinfoCtrl',function($scope,$stateParams,CONFIG,$ionicPopup,myinfoService,$timeout,$ionicLoading){//个人信息
	//是否显示保存编辑按钮
	$scope.showEditBtn = true;
	$scope.showSaveBtn = false;
	$scope.myName = "";
	var localinfo = localStorage.getItem("uinfo");
	if(localinfo){
		var objmyinfo = angular.fromJson(localinfo);
	}
	var abbname = objmyinfo.fullname.replace("CN=","").replace("O=","");
	$scope.myName = abbname;
	myinfoService.get(abbname).then(function(data) {
		$scope.person = data.data.msg;
		if ($scope.person.img) {
			$scope.person.img = CONFIG.DOM_ROOT + $scope.person.img
		} else {
			$scope.person.img = CONFIG.DOM_ROOT + "/indishare/addressbook.nsf/noimg.png"
		}
		var subDeps = $scope.person.fldSubDepsInfo == "" ? "" : JSON.parse($scope.person.fldSubDepsInfo)
		var deps = []
		for (var x in subDeps) {
			deps = deps.concat(subDeps[x]);
		};
		$scope.person.fldSubDepsInfo = deps;
	});
	$scope.fnEditMyinfo = function(){
		$scope.showEditBtn = false;
		$scope.showSaveBtn = true;		
	};
	$scope.fnSaveMyinfo = function(){
		//手机号码
		var strRet = "";
		var re = /^[0-9]*$/;
		var re2 = /^([0-9]|\-|#)*$/;
		var re3 = /^(\w|-)+@(\w|-)+(\.\w+)+$/;
		if($scope.person.MobilePhone != '' && $scope.person.MobilePhone != undefined){
			if(!re.test($scope.person.MobilePhone)){
				strRet = '移动电话包含非字符符号，请您输入数字的移动电话。';
				$ionicPopup.alert({
	            	template:strRet
        		})
			return false;
			}
			if($scope.person.MobilePhone.length != 11){
				strRet = '移动电话长度错误，请您输入正确长度的移动电话（11位数字）。';
				$ionicPopup.alert({
	            	template:strRet
        		})
			return false;
			}
		}
		if($scope.person.OfficeTel != '' && $scope.person.OfficeTel != undefined){
			if(!re2.test($scope.person.OfficeTel)){
				strRet = '办公电话只能包含数字、-和#，请您输入正确的办公电话。';
				$ionicPopup.alert({
	            	template:strRet
        		})
			return false;				
			}
		}
		if($scope.person.InternetAddress != '' && $scope.person.InternetAddress != undefined){
			if(!re3.test($scope.person.InternetAddress)){
				strRet = '请输入正确格式的电子邮件。';
				$ionicPopup.alert({
	            	template:strRet
        		})
			return false;				
			}
		}
		if($scope.person.Fax != '' && $scope.person.Fax != undefined){
			if(!re.test($scope.person.Fax)){
				strRet = '传真号码包含非字符符号，请您输入数字的传真号码。';
				$ionicPopup.alert({
	            	template:strRet
        		})
			return false;				
			}
		}
		var strMyinfo = angular.toJson($scope.person);
		myinfoService.save(strMyinfo).then(function(data){
			var myPopup,msg;
			if(data.data.type === "success"){
				msg = '保存成功';
			    $scope.showEditBtn = true;			
				$scope.showSaveBtn = false;
			}else{
				msg = '保存失败，请重试';
			}
			$ionicLoading.show({
		      	template: '<i class="ion-checkmark-round"></i> ' + msg,
  				noBackdrop: true
		    });
			$timeout(function() {
		      	$ionicLoading.hide();
		    }, 1000);
		});		
	}
})
.controller('changePWCtrl',function($scope,$state,$stateParams,CONFIG,$ionicPopup,changePWService){
	$scope.showSaveBtn = true;
	$scope.p = {};
	$scope.fnConfirmPW = function(){
		if($scope.p.oldpassword == "" || $scope.p.oldpassword == undefined){
			$ionicPopup.alert({
	            template:"当前密码不能为空，请确认。"
        	})
			return false;
		}
		if($scope.p.newpassword == "" || $scope.p.newpassword == undefined){
			$ionicPopup.alert({
	            template:"新的密码不能为空，请确认。"
        	})
			return false;
		}
		if($scope.p.confirmpassword == "" || $scope.p.confirmpassword == undefined){
			$ionicPopup.alert({
	            template:"确认密码不能为空，请确认。"
        	})
			return false;
		}
		if($scope.p.newpassword != $scope.p.confirmpassword){
			$ionicPopup.alert({
	            template:"新的密码和确认密码不一致，请确认。"
        	})
			return false;
		}
		if($scope.p.newpassword == $scope.p.oldpassword){
			$ionicPopup.alert({
	            template:"新的密码不能和输入的旧密码相同，请确认。"
        	})
			return false;
		}
		//
		var uinfo = localStorage["uinfo"];
		var objuinfo = angular.fromJson(uinfo);
		var uid = objuinfo.userid;
		var strMyinfo = 'type~changepassword^userid~'+uid+'^oldpassword~'+$scope.p.oldpassword+'^newpassword~'+$scope.p.newpassword+'^confirmpassword~'+$scope.p.confirmpassword;
		changePWService.confirmPW(strMyinfo).then(function(data){
			$ionicPopup.alert({
	            template:"密码更改请求已发送，请通过邮件查看更改情况（需5分钟左右）。"
        	}).then(function(){
			$state.go("tab.home.todo");
			$scope.p = {};
		})
		});	
	};
})
.controller('AboutCtrl', function($scope,$ionicPopup,$timeout,CONFIG,AppinfoService,VersionService) {
/**
 *关于 版本更新模块
 */
 	$scope.appname = CONFIG.APP_NAME;
 	AppinfoService.getVersion().then(function(v){
  		$scope.localVersion = v;//本地版本
  	});
  	$scope.checkNewVersion = function(){
  		//获取服务器版本
  		AppinfoService.checkUpdate().then(function(v){
	  		if(v && v.version && $scope.localVersion){
	  			var result = VersionService.versionCompare($scope.localVersion,v.version);
		  		if(result != -1){
			  		var myPopup1 = $ionicPopup.show({
				      title: '已经是最新版本'
				    });
			  		$timeout(function() {
				      myPopup1.close();
				    }, 2000);
			  	}else{
			  		$ionicPopup.confirm({
			          	title: '最新版本为' + v.version + '，立即更新吗？',
			       	}).then(function(res) {
						if(res){
							VersionService.newVersionDownload(v.url);
						};
			       }); 
			  	}; 
		  	}else{
		  		var myPopup2 = $ionicPopup.show({
					title: '检查失败，请稍后重试'
			    });
		  		$timeout(function() {
					myPopup2.close();
			    }, 2000);
		  	};
	  	});	
  	}
});