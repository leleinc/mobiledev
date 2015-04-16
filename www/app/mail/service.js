
angular.module('indiplatform.mail.services', ['ngResource','x2js'])

.factory('MailService', function(CONFIG,SoapService,x2js,$resource) {
  var mails;
  var localinfo = localStorage.getItem("uinfo");
      var host='';
      if(localinfo&&angular.fromJson(localinfo).mailServer){
        host=angular.fromJson(localinfo).mailServer;
      }
    return { 	
    all: function(param,callback) {   //各种邮件列表
      var url = host+"/indishare/iowebservice.nsf/wsForMail?OpenWebService";
      SoapService.invoke(
        url,
        "readFolder",param
      ).success(function(data, status) {
        mails = [];
        angular.forEach(data.split("\n"),function(item){

			if(item.split("#####")[1]){
				mails.push({
					mailtitle:item.split("#####")[0],
					mailtime:item.split("#####")[1],
					mailfrom:item.split("#####")[2],
					mailhref:item.split("#####")[3],
					mailread:item.split("#####")[4],
					mailattach:item.split("#####")[5],
					mailsize:item.split("#####")[6],
					mailsendto:item.split("#####")[7],
					mailcntent:item.split("#####")[8]

				}); 
			}	
		});	
		callback(mails);
		})
	},
	 unReadcount: function(name,callback) { //未读邮件数
      var url = host+"/indishare/iowebservice.nsf/wsForMail?OpenWebService";
      SoapService.invoke(
        url,
        "getUnreadcount",{
          "strUserName": name,
          "folderName": "($Inbox)",
        }
      ).success(function(data, status) { 
		callback(data);
		})
	},
	readMail: function(name,id) { //获取邮件内容
     var url = host+"/indishare/iowebservice.nsf/wsForMail?OpenWebService";
     return SoapService.invoke(
		        url,
		        "readMail",
		        {
		          "strUserName": name,
		          "unid": id,
		        }
	        )
	},
	sendMail: function(obj,type) { //发送邮件内容
      var url = host+ "/indishare/iowebservice.nsf/wsForMail?OpenWebService";

	  return  SoapService.invoke(
		          url,
		         type,
		          obj
	      	  )
	},

	delMail: function(name,id,flag) { //删除邮件内容
      var url =host+ "/indishare/iowebservice.nsf/wsForMail?OpenWebService";
		return	SoapService.invoke(
		  	url,
	        "deleteDocument",{
	        	"strUserName": name,
	          	"unid": id,
	          	"flag":flag
	        }
	    )
	},
	doWithSelectedDoc: function(obj) { //移动
      var url =host+ "/indishare/iowebservice.nsf/wsForMail?OpenWebService";
		return SoapService.invoke(
		  	url,
	        "doWithSelectedDoc",obj
	    )
	},
	markMail: function(name,ids,flag) { //标记已读未读
      var url =host+ "/indishare/iowebservice.nsf/wsForMail?OpenWebService";
		return	SoapService.invoke(
		  	url,
	        "markDocument",{
	        	"strUserName": name,
	          	"unid": ids,
	          	"flag":flag
	        }
	    )
	},
	getFolders: function(name) { //标记已读未读
      var url =host+ "/indishare/iowebservice.nsf/wsForMail?OpenWebService";
		return	SoapService.invoke(
		  	url,
	        "getFolders",{
	        	"strUserName": name
	        }
	    )
	},
	saveDocument: function(formdata) { //标记已读未读
      var url =host+ "/indishare/iowebservice.nsf/wsForMail?OpenWebService";
		return	SoapService.invoke(
		  	url,
	        "saveDocument",
	        formdata
	    )
	}

}
});
