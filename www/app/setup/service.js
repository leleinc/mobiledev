angular.module('indiplatform.setup.services', ['ngResource', 'x2js'])
	.factory('SetupService', function() {})
	.factory('myinfoService', function(CONFIG, SoapService, $resource) {
		return {
			//获取
			get: function(name) {
				var url = "/indishare/addressbook.nsf/wsForAddressbook?OpenWebService";
				return SoapService.invoke(
					url,
					"queryByUserAbb", {
						user: name
					}
				).success(function(data, status) {
					return data;
				})

			},
			//保存
			save: function(strUserJson) {
				var url = "/indishare/addressbook.nsf/wsForAddressbook?OpenWebService";
				return SoapService.invoke(
					url,
					"updateUserForAddrbook", {
						strUserJson: strUserJson
					}
				).success(function(data, status) {
					return data;
				})
			},
		}
	})
	.factory('changePWService', function(CONFIG, SoapService, $resource) {
		return {
			confirmPW: function(userpwinfo) {
				var url = "/indishare/indiwscenter.nsf/wsForUser?OpenWebService";
				return SoapService.invoke(
					url,
					"ProcessUser", {
						userinfo: userpwinfo
					}
				).success(function(data, status) {
					return data;
				})

			}
		}
	})
	.factory('pushInfoService', function(CONFIG, SoapService, $resource) {
		return {
			get: function(userid) {
				var url = "/indishare/inditravelerpush.nsf/wsForUserPushSet?OpenWebService";
				return SoapService.invoke(
					url,
					"getPushSetByUser", {
						userid: userid
					}
				).success(function(data, status) {
					return data;
				})
			},
			save: function(userid,pushSet){
				var url = "/indishare/inditravelerpush.nsf/wsForUserPushSet?OpenWebService";
				return SoapService.invoke(
					url,
					"savePushSetByUser", {
						userid: userid,
						pushSet: pushSet
					}
				).success(function(data, status) {
					return data;
				})
			}
		}
	})
	.factory('VersionService', function() {
		return {
			versionCompare: function(left, right) {
			    if (typeof left + typeof right != 'stringstring')
			        return false;	    
			    var a = left.split('.')
			    ,   b = right.split('.')
			    ,   i = 0, len = Math.max(a.length, b.length);
			        
			    for (; i < len; i++) {
			        if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
			            return 1;
			        } else if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
			            return -1;
			        }
			    }
			    return 0;
			},
			newVersionDownload: function(url){
				window.open(url,'_system');
			}
		}
	});
