
angular.module('indiplatform.mail.controllers', ['ngResource','x2js','ngCordova'])
.controller('boxCtrl', function($scope,$stateParams,$state ,MailService,x2js,CONFIG,$ionicScrollDelegate,$rootScope,AuthService,$timeout) {
  $scope.initialized = false;
  /*var key,type;
  if ($state.current.name=="tab.mail.inbox") {
        type="($Inbox)";key="mailinbox";
  }else if($state.current.name=="tab.mail.outbox"){
        type="($Sent)";key="mailsent"
  }else{
        type="($Drafts)";key="maildrafts"
  }*/
var type="($Inbox)";
var key="mailinbox";
$rootScope.tmpMailetype={};//从列表切到邮件详情，记录邮件类型，已读垃圾什么的
$rootScope.maillist={}
var param={
      "strUserName": $scope.context.userinfo.userid,
      "folderName": "",
      "mailnum":20,
      "mailtype":3,
      "start":1,
      "query":""
  }
 $scope.getMaillist=function(thistype,thiskey){
        type=thistype;
        key=thiskey;
        param.folderName=type;
        $scope.isDraft=false;
        if(thistype=="($Drafts)"){
            $scope.isDraft=true;
        }
        if(typeof($scope.maillist[key])=="undefined" ) {
          $scope.doRefresh()
        }
       // $timeout(function(){$scope.moreDataCanBeLoaded=true;},50)
$scope.moreDataCanBeLoaded=true
        $rootScope.param=param;
 }
  $scope.doRefresh = function(){
     
        param.start=1;
        param.folderName=type;
        MailService.all(param,function(data){
          $scope.initialized = true;
          $scope.maillist[key]=data;
          if($scope.maillist[key].length>=20){
              $scope.moreDataCanBeLoaded=true;
          }
        })
        if($scope.initialized){
            AuthService.getUserinfo().then(function(result){
            $scope.context.userinfo = result;   
            });
        }
        $scope.initialized = true;
        $scope.$broadcast('scroll.refreshComplete');
   
  };
  //$scope.doRefresh();
  
  //shanglihui20150429
  $scope.$on("tab.refreshdata", function(event, data) {
	    //alert("mail-$scpoe.$on-pushservice.refreshdata, data:" + data);
		if (data && data.url && data.url==="tab.mail"){
			//alert("tab.home.mail-$scope.doRefresh(true)");
			$scope.doRefresh(true);
		}
  });
  
  $scope.loadMore = function() {//下拉加载更多
    console.log("more");
      if( typeof($scope.maillist[key])=="undefined" ){

       $scope.$broadcast('scroll.infiniteScrollComplete');
               return;
      }
      param.start=$scope.maillist[key].length+1;
      MailService.all(param,function(data){
          $scope.maillist[key]=$scope.maillist[key].concat(data);   
          if(data.length<param.mailnum){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
          $scope.initialized = true;
          $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };
  $scope.modifyMailinfo=function(index,text){
    $scope.tmpMailetype.value=key;
    $scope.tmpMailetype.index=index;
    $scope.tmpMailetype.text=text;
    if(key=="mailinbox" && $scope.maillist[key][index].mailread=='false'){
      $scope.context.userinfo.count.unread_mail=$scope.context.userinfo.count.unread_mail-1;
    }
    $scope.maillist[key][index].mailread='true';
  }
 
})
.controller('actionsCtrl', function($timeout,$q,$resource,$scope,$stateParams,$state ,MailService,x2js,CONFIG,$ionicPopup,selectService,DocService,$ionicSlideBoxDelegate,$ionicScrollDelegate,$ionicActionSheet,$ionicHistory,$cordovaKeyboard,$ionicPlatform) {  
    $ionicPlatform.ready(function(){
      try{
         $cordovaKeyboard.hideAccessoryBar(false);
      }catch(e){
      }     
    })
    $scope.formData={
        strUserName:"",
        sendTo:"",
        copyTo:"",
        blindCopyTo:"",
        subject:"",
        Body:"",
        saveDraft:"0",
        file:"",
        filename:"",
        isNotAttachment:"0"
      };
      $scope.type=$stateParams.type;
      $scope.isNotAttachment="0";
      if($stateParams.defaddress){
              $scope.formData.sendTo=$stateParams.defaddress.split(",")
      }

    if($stateParams.unid){//不是新建的邮件
        $scope.isDraft=false;
        MailService.readMail($scope.context.userinfo.userid,$stateParams.unid).then(function(data){
        if($state.current.name=="writemail"){//草稿,回复邮件，或者转发邮件
            
            $scope.formData.subject=data.data.DATAS.ITEM.SUBJECT;
            $scope.formData.Body=data.data.DATAS.ITEM.BODY;//草稿用
            $scope.formData.unid=$stateParams.unid;
            if($stateParams.type==""){//草稿
               var mailcontent={};  
               mailcontent.unid=$stateParams.unid;
               $scope.mailcontent=mailcontent;
               $scope.isDraft=true;
               $scope.formData.sendTo=data.data.DATAS.ITEM.SENDTO==""?"":data.data.DATAS.ITEM.SENDTO.split(",");//变数组
               $scope.formData.copyTo=data.data.DATAS.ITEM.COPYTO==""?"":data.data.DATAS.ITEM.COPYTO.split(",");//变数组
               $scope.formData.blindCopyTo=data.data.DATAS.ITEM.BLINDCOPYTO==""?"":data.data.DATAS.ITEM.BLINDCOPYTO.split(",");//变数组
               
            }
            if($stateParams.type=="reply"){
                
                var mailcontent={};  //回复带上原邮件信息
                mailcontent.date=data.data.DATAS.ITEM.DATE;
                mailcontent.from=data.data.DATAS.ITEM.FROM;
                mailcontent.copyto=data.data.DATAS.ITEM.COPYTO.split(",");
                mailcontent.sendto=data.data.DATAS.ITEM.SENDTO.split(",");
                mailcontent.subject=data.data.DATAS.ITEM.SUBJECT;
                mailcontent.conent=data.data.DATAS.ITEM.BODY;
                mailcontent.sendtype="reply";//如果是回复的就不能选发件人
                $scope.mailcontent=mailcontent;

                $scope.formData.subject="答复:"+x2js.json2xml_str(data.data.DATAS.ITEM.SUBJECT).replace("<![CDATA[","").replace("]]>","");
                $scope.formData.sendTo=data.data.DATAS.ITEM.FROM.split(",");//变数组
                $scope.formData.Body="";
                if($stateParams.range=="mulite"){ //如果是回复多人
                   $scope.formData.copyTo=(data.data.DATAS.ITEM.SENDTO==""?"":data.data.DATAS.ITEM.SENDTO)+(data.data.DATAS.ITEM.COPYTO==""?"":(","+data.data.DATAS.ITEM.COPYTO));
                   $scope.formData.copyTo=$scope.formData.copyTo==""?[]:$scope.formData.copyTo.split(",")//变数组
                }
               
            }
            if($stateParams.type=="forword"){

                var mailcontent={};  //转发带上原邮件信息
                mailcontent.date=data.data.DATAS.ITEM.DATE;
                mailcontent.from=data.data.DATAS.ITEM.FROM;
                mailcontent.copyto=data.data.DATAS.ITEM.COPYTO.split(",");
                mailcontent.sendto=data.data.DATAS.ITEM.SENDTO.split(",");
                mailcontent.subject=data.data.DATAS.ITEM.SUBJECT;
                mailcontent.conent=data.data.DATAS.ITEM.BODY;               
               
                mailcontent.attachs=[];
                if(data.data.DATAS.ITEM.ATTACHS){           
                      if(data.data.DATAS.ITEM.ATTACHS.ATTACH.length){
                           mailcontent.attachs=data.data.DATAS.ITEM.ATTACHS.ATTACH;     
                      }else{
                           mailcontent.attachs[0]=data.data.DATAS.ITEM.ATTACHS.ATTACH;
                      }
                    $scope.formData.isNotAttachment="1";                    
                }else{
                  mailcontent.attachs=0;
                }
                $scope.mailcontent=mailcontent;
                $scope.formData.subject="转发:"+data.data.DATAS.ITEM.SUBJECT;
                $scope.formData.Body="";
               
            }

        }else{//读邮件
            var mailcontent={};  
            mailcontent.date=data.data.DATAS.ITEM.DATE;
            mailcontent.from=data.data.DATAS.ITEM.FROM;
            mailcontent.copyto=data.data.DATAS.ITEM.COPYTO.split(",");
            mailcontent.sendto=data.data.DATAS.ITEM.SENDTO.split(",");
            mailcontent.blindcopyto=data.data.DATAS.ITEM.BLINDCOPYTO.split(",");
            mailcontent.subject=data.data.DATAS.ITEM.SUBJECT;
            mailcontent.conent=data.data.DATAS.ITEM.BODY;
            
            mailcontent.mailread=true;
             mailcontent.unmailread=false;
            mailcontent.unid=$stateParams.unid;
            mailcontent.attachs=[];
            if(data.data.DATAS.ITEM.ATTACHS){  
              if(data.data.DATAS.ITEM.ATTACHS.ATTACH.length){
                   mailcontent.attachs=data.data.DATAS.ITEM.ATTACHS.ATTACH;     
              }else{
                   mailcontent.attachs[0]=data.data.DATAS.ITEM.ATTACHS.ATTACH;
              }
            }else{
              mailcontent.attachs=0;
            }
              $scope.mailcontent=mailcontent;
        }
           
      })
} 
$scope.send=function(){ //发邮件，或回复邮件
   
    $scope.inputDown({"keyCode":13},'$scope.formData.sendTo','$scope.formData.tmpsendTo');
    $scope.inputDown({"keyCode":13},'$scope.formData.copyTo','$scope.formData.tmpcopyTo');
    $scope.inputDown({"keyCode":13},'$scope.formData.blindCopyTo','$scope.formData.tmpblindCopyTo');
    if( ($scope.formData.tmpsendTo&&$scope.formData.tmpsendTo!="") || ($scope.formData.tmpcopyTo&&$scope.formData.tmpcopyTo!="")||($scope.formData.tmpblindCopyTo&&$scope.formData.tmpblindCopyTo!="")){
          //手动输入的还有值就是非法的！
          $ionicPopup.alert({
                   template: "请输入正确格式的邮箱，或从列表选择人员:(",
          })
          return;
    }
    if($scope.formData.sendTo==""){ 
        $ionicPopup.alert({
            template:"请选择邮件接收人！"
        })
        return;
    }
    if($scope.formData.subject==""&&!arguments[0]){ 
        $ionicPopup.confirm({
            template:"您的邮件主题为空，确认发送吗？"
        }).then(function(res){
          if(res){
            $scope.send(true);
          }else{
              return;
          }
        })
        return;
    }

    var sendtype
    switch($stateParams.type)
    {
    case "reply":
      sendtype="replySendMail"
      break;
    case "forword":
     sendtype="forwordSendMail"
      break;
    default:
      sendtype="createDocument"
    }
    $scope[sendtype+"formData"]={};
    $scope[sendtype+"formData"][$stateParams.type+"sendTo"]=typeof($scope.formData.sendTo)=="string"?$scope.formData.sendTo:$scope.formData.sendTo.join(",");
    $scope[sendtype+"formData"][$stateParams.type+"copyTo"]=typeof($scope.formData.copyTo)=="string"?$scope.formData.copyTo:$scope.formData.copyTo.join(",");
    $scope[sendtype+"formData"][$stateParams.type+"blindCopyTo"]=typeof($scope.formData.blindCopyTo)=="string"?$scope.formData.blindCopyTo:$scope.formData.blindCopyTo.join(",");
    $scope[sendtype+"formData"][$stateParams.type+"subject"]=$scope.formData.subject;
    $scope[sendtype+"formData"][$stateParams.type+"Body"]=$scope.formData.Body;

    if($stateParams.type!=""){//回复邮件或转发邮件
       $scope[sendtype+"formData"].unid=$stateParams.unid;
    }else{//直接发邮件是否存草稿
        $scope[sendtype+"formData"].saveDraft="1";
    }
    $scope[sendtype+"formData"].strUserName=$scope.context.userinfo.userid;
    $scope[sendtype+"formData"].isNotAttachment=$scope.formData.isNotAttachment;
    MailService.sendMail($scope[sendtype+"formData"],sendtype).success(function( status) { 
        $ionicPopup.alert({
         template: status!=""&&status.indexOf("ERROR")<0?"邮件已发送!":status
        }).then(function(){
          if(status.indexOf("ERROR")<0) {
            $state.go("tab.mail");
          }
        })          
    });
}
$timeout(function(){
  $scope.Dateopen=JSON.stringify($scope.formData);
  console.log($scope.Dateopen);
},500)
$scope.goback=function(){ 
        if($scope.Dateopen==JSON.stringify($scope.formData)){
          $ionicHistory.goBack();
          return;
        };
        $ionicPopup.confirm({
                title: '是否保存草稿？',
        }).then(function(res){
                if (res) {
                    $scope.inputDown({"keyCode":13},'$scope.formData.sendTo','$scope.formData.tmpsendTo');
                    $scope.inputDown({"keyCode":13},'$scope.formData.copyTo','$scope.formData.tmpcopyTo');
                    $scope.inputDown({"keyCode":13},'$scope.formData.blindCopyTo','$scope.formData.tmpblindCopyTo');
                    if( ($scope.formData.tmpsendTo&&$scope.formData.tmpsendTo!="") || ($scope.formData.tmpcopyTo&&$scope.formData.tmpcopyTo!="")||($scope.formData.tmpblindCopyTo&&$scope.formData.tmpblindCopyTo!="")){
                          //手动输入的还有值就是非法的！
                          $ionicPopup.alert({
                                   template: "请输入正确格式的邮箱，或从列表选择人员:(",
                          })
                          return;
                    }
                    MailService.saveDocument({
                      "strUserName":  $scope.context.userinfo.userid,
                           "sendTo":  typeof($scope.formData.sendTo)=="string"?$scope.formData.sendTo:$scope.formData.sendTo.join(","),
                           "copyTo":  typeof($scope.formData.copyTo)=="string"?$scope.formData.copyTo:$scope.formData.copyTo.join(","),
                      "blindCopyTo":  typeof($scope.formData.blindCopyTo)=="string"?$scope.formData.blindCopyTo:$scope.formData.blindCopyTo.join(","),
                          "subject":  $scope.formData.subject,
                             "Body":  $scope.formData.Body,
                             "unid":  $stateParams.unid
                    }).success(function(status){
                      $ionicPopup.alert({
                        template:status
                      }).then(function(){
                        $ionicHistory.goBack();
                      })
                    })
                }else{
                  $ionicHistory.goBack();
                };
                
        })
        
}
$scope.delMail = function(id) {
   var flag;
   var btns= [{ text: '移至废件箱',value:0},{ text: '彻底删除',value:1 }];
   if($scope.tmpMailetype.value=="mailjunk"){
       btns= [{ text: '彻底删除',value:1 }];
   }
   var delSheet = $ionicActionSheet.show({
       buttons:btns,
       cancelText: '取消',
       cancel: function() {
            // add cancel code..
          },
       buttonClicked: function(index) {
             if(btns[index].value==0){
                 flag=false;
                 var confirmPopup = $ionicPopup.confirm({
                   title: '确认移到废件箱？',
                 });       
             }
             if(btns[index].value==1){
                flag=true;
                var confirmPopup = $ionicPopup.confirm({
                   title: '彻底删除',
                   template: '彻底删除不可恢复，确认删除？'
                 });
             }
             confirmPopup.then(function(res) {
               if(res) {
                  MailService.delMail($scope.context.userinfo.userid,id,flag).success(function(status){
                      $ionicPopup.alert({
                         template: status.indexOf("UNID")>0?"您已"+(flag?"删除":"作废")+"一条标题为"+status.split('标题为')[1]:status
                      }).then(function(){
                           $scope.maillist[$scope.tmpMailetype.value].splice([$scope.tmpMailetype.index],1);
                           $state.go("tab.mail");
                      })   
                  });
                  $state.go("tab.mail");
               } else {
                  console.log('You are not sure');
               }
             }); 
             delSheet();
       }
   });
};
$scope.mark = function(id) {
   var btns=$scope.mailcontent.mailread?[{ text: '标记未读' ,flag:false}]:[{ text: '标记已读' ,flag:true}]
   var markSheet = $ionicActionSheet.show({
     buttons: btns,
     cancelText: '取消',
     cancel: function() {
        },
     buttonClicked: function(index) {
      MailService.markMail($scope.context.userinfo.userid,[id],btns[index].flag).success(function(status){
              if (status=="success") {
                    $scope.mailcontent.mailread=btns[index].flag;
                    $scope.mailcontent.unmailread=!$scope.mailcontent.mailread;
                    if($scope.mailcontent.mailread){//在邮件表单中标记同时，修改相应列表中的状态
                        $scope.context.userinfo.count.unread_mail=$scope.context.userinfo.count.unread_mail-1;
                        $scope.maillist[$scope.tmpMailetype.value][$scope.tmpMailetype.index].mailread='true';
                    }else{
                        $scope.context.userinfo.count.unread_mail=$scope.context.userinfo.count.unread_mail+1;
                        $scope.maillist[$scope.tmpMailetype.value][$scope.tmpMailetype.index].mailread='false';
                    }
               
                     markSheet();
              }else{
                    $ionicPopup.alert({
                        template: status
                    }).then(function(){
                        markSheet();
                    })   
              };
          
      });
     }
   });
};
$scope.move = function(id) {
  //  MailService.getFolders($scope.context.userinfo.userid).success(function(btns){
          var btns=[{id: "$Inbox",text: "收件箱"}]
          var moveSheet = $ionicActionSheet.show({
                                 buttons: btns,
                                 cancelText: '取消',
                                 cancel: function() {
                                      // add cancel code..
                                    },
                                 buttonClicked: function(index) {
                                          moveSheet();
                                         $ionicPopup.confirm({
                                                template: '确认移到'+btns[index].text+"?"
                                            }).then(function(res) {                                       
                                                 if(res) {
                                                    MailService.doWithSelectedDoc({
                                                      strUserName:$scope.context.userinfo.userid,
                                                      folderName: $scope.param.folderName,
                                                      unid:id,
                                                      straction:"movenormal",
                                                      strdest:btns[index].id
                                                    }).success(function(status){
                                                          $ionicPopup.alert({
                                                             template: status
                                                          }).then(function(){
                                                               $state.go("tab.mail");
                                                          })   
                                                    });                                        
                                                 } else {
                                                   console.log('You are not sure');
                                                 }
                                            }); 
                                 }
                            });
   // })
 
};
$scope.reply = function() {
   var markSheet = $ionicActionSheet.show({
     buttons: [
       { text: '回复发件人' },
       { text: '回复所有人' }
     ],
     cancelText: '取消',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
      if(index==0){
          $state.go("writemail",{unid:$scope.mailcontent.unid,type:'reply',range:'single'});
      }else{
          $state.go("writemail",{unid:$scope.mailcontent.unid,type:'reply',range:'mulite'});
      }
       return true;
     }
   });
};

$scope.form={};
$scope.form.handWrite=[];
$scope.showSimple=function(){
  $scope.form.isDetail=!$scope.form.isDetail;
}
$scope.toArry=function(to){//把人名列表变成数组参数为'$scope.formdata.filed'
      if(typeof(eval(to))=="string"){
            if(eval(to)==""){
              eval(to+"=[]");
            }else{
              var arr=eval(to).splice(",");
              eval(to+"=arr");
            }
        }
}
var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
$scope.inputDown=function(ev,to,from){
  // if(ev.keyCode==8 && eval(from+".length")==0&&false){
  //      $scope.toArry(to);
  //      if(eval(to+".length==0")){
  //         return
  //      }else{
  //         var index=eval(to+".length-1");
  //         eval(to+".splice(index,1)")
  //      }
  // }

  if(ev.keyCode==13){
        $scope.toArry(to);
        if(eval(to).indexOf(eval(from))==-1 && eval(from)!="" && typeof(eval(from))!="undefined" &&filter.test(eval(from))){
            eval(to+".push("+from+")");
           // $scope.form.handWrite.push(eval(from));//记录手动输入人员，提示用
            eval(from+"=''");
        }
  }  
}
$scope.valueChange=function(to,from){
 
  if(eval(from).indexOf(",")>0){
      var toadd=eval(from).split(",")[0];
      $scope.toArry(to);
      if(eval(to).indexOf(toadd)==-1 && toadd!="" && typeof(toadd)!="undefined" &&filter.test(eval(from))){
          eval(to+".push('"+toadd+"')");
        //  $scope.form.handWrite.push(toadd);//记录手动输入人员，提示用
          eval(from+"=''");
      }
  }  
}
$scope.removeSeletct=function(to,from,del){
  if(eval(del)==from){ //del为标记为删除的值
    var index=eval(to+".indexOf(from)");
    eval(to+".splice(index,1)");
    if($scope.form.handWrite.indexOf(from)>=0){//从手写的里面也删掉
        $scope.form.handWrite.splice($scope.form.handWrite.indexOf(from),1)
    }
  }else{//不等着标记为待删除
    eval(del+"=from")
  }
}


})