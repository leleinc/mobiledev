
angular.module('indiplatform.webflow.controllers', [])


.controller('WebflowCtrl', function($rootScope, $scope, $q, $state, $stateParams,$cordovaFile,$cordovaMedia,$filter,$timeout, $ionicPopup, $ionicLoading, $ionicModal,$ionicActionSheet,$ionicScrollDelegate,$ionicSlideBoxDelegate, DocService, FormDataService, NodeInfoService, CyyService,selectService,ContactService) {
  $scope.fileinfo = {
    domain:$stateParams.domain,
    dbpath: $stateParams.path,
    unid: $stateParams.id
  };
  $scope.form = {};
  $scope.actionType="submit";
  $scope.form.denyBackWay="0";
  FormDataService.get($scope.fileinfo).then(function(FormData) {

  // angular.forEach(FormData.form.formdetail,function(item){
  //     item.isyj=false;
  //     angular.forEach(FormData.YjList,function(i){
  //         if(i._writetofield != undefined && item.id.toUpperCase() == i._writetofield.toUpperCase()){
  //           item.value.push(i);
  //           item.isyj=true;
  //         }
  //     })
  // })
  $scope.formData = FormData.form;
  if($scope.formData.attitude){
    $scope.form.comments=$scope.formData.attitude;
  }
    angular.forEach($scope.formData.formdetail,function(item){
      item.value=item.value.map(function(value){
          if(typeof(value)=="string"){
             value = $filter('escape2Html')(value);//过滤特殊字符
             value= $filter('removeEnter')(value);//过滤回车符
          }       
          return value
      })
      // item.value[0] = $filter('escape2Html')(item.value[0]);//过滤特殊字符
      // item.value[0] = $filter('removeEnter')(item.value[0]);//过滤回车符
      if(item.fieldmbset){//将是|1，否|0转成显示的字
          var fieldmbsetObj={};
		  if(item.value[0].length == 0){//将是|1，否|""转成是|1，否|0  如加班管理
            item.fieldmbset = item.fieldmbset.replace(/\"{2}/,"0");
            item.value[0] = "0";
          }
          angular.forEach(item.fieldmbset.split(","),function(item){
              fieldmbsetObj[item.split("|")[1]]=item.split("|")[0]
          })      
          item.value=item.value.map(function(value){
              return fieldmbsetObj[value];
          })  
      }
      if(item.dync){
        try{
          item.dync = JSON.parse(item.dync);
          item.value = JSON.parse(item.value);
        }catch(e){
          console.error("动态表格数据异常,转换JSON失败");
        }
      }
      if(item.type) {
        if(item.type == "user") {
          item.value = $filter('unique')(item.value);
          item.value = $filter('domUser')(item.value);
        }else if(item.type == "date") {
          item.value = item.value.join("") && moment(item.value.join(""), "YYYY-MM-DD HH:mm:ss Z").format("YYYY-MM-DD") || item.value;
          if(item.value == "Invalid date") {
            item.value = item.value
          }
        }else if(item.type == "datetime") {
          item.value = item.value.join("") && moment(item.value.join(""), "YYYY-MM-DD HH:mm:ss Z").format("YYYY-MM-DD HH:mm:ss") || item.value;
          if(item.value == "Invalid date") {
            item.value = item.value
          }
        }
      }
    });

    $scope.fjlength=0;//附件个数的

    var isAttitude = /\d*_Attitude\.(gif|png)/i;

    angular.forEach($scope.formData.idxfiles,function(item){
      item.url="http://"+$stateParams.domain+item.url;
      item.size=Math.floor(item.size/1024)+"KB";
      if(item.catnum=="-1"){
        $scope.zwurl=item.url;
      }
    });
    $scope.yjs = FormData.YjList;
    $scope.yjs.forEach(function(yj){
        if(yj.yjatt){
          yj.yjatt.url=$scope.formData.idxfiles.filter(function(item){
                              return item.name && yj.yjatt.attname==item.name
                        })[0].url;
        }
    })
    $scope.formData.idxfiles = $scope.formData.idxfiles.filter(function(item){
      return item.name && !isAttitude.test(item.name) && item.catnum!=-5
    });
    $scope.fjlength=$scope.formData.idxfiles.length;
    $scope.getAvatars = function() {
      var first = true;
      return (function() {
        if (first) {
          first = false;
          $scope.yjs.forEach(function(yj) {
            yj.contact = ContactService.getAvatar(yj.user);
          });
        }
      })();
    };
    $scope.lzs = FormData.LzList;
    $scope.curinfo = FormData.CurInfo;
    // $scope.lzs.reverse();
    $scope.cyy = CyyService.get($scope.fileinfo);
    //zhangweiguo修改
    if (FormData.FlowBtns != undefined && FormData.FlowBtns.nextline != undefined) {
      var flag = true;
      if (FormData.FlowBtns.nextline instanceof Array) {
        flag = FormData.FlowBtns.nextline.length > 0;
      }

      $scope.isNextline = flag;
    }
    if(FormData.FlowBtns.btnsubmit) {
      $scope.isNextline = true;
    }
    $scope.nextNodeList = FormData.FlowBtns||{"nextline":[]};
    $scope.returnSence = FormData.FlowBtns.returnSence;
    $scope.FlowBtns = FormData.FlowBtns;
    if(!$scope.nextNodeList.nextline){
      $scope.nextNodeList.nextline = [];
    }
    $scope.form.nodeList = $scope.nextNodeList.nextline.filter(function(item){
      return item[0].conditionresult !== false
    }).map(function(item) {
      var ret = angular.copy(item[0].target);
      ret=angular.extend(ret,{notifymail:"",notifysms:"",notifytoread:""})
      return ret;
    });

    $scope.actionBtns = FormData.ActionBtns;
    //console.log($scope.actionBtns)
  });
  $scope.commentsType = "keypad";
  $scope.toggleCommentsType = function(){
    $scope.commentsType = $scope.commentsType == "mic" ? "keypad" :
                          $scope.commentsType == "keypad" ? "mic" :
                          "mic";
  };
  $scope.isMic = function(){
    return $scope.commentsType == "mic"
  };
  $scope.isKeypad = function(){
    return $scope.commentsType == "keypad"
  };

  $scope.writeComment = function(comment){
    $scope.form.comments = comment;
  };

  $scope.isSelected = function(index){
    return $scope.form.nextNode && index==$scope.form.nextNode
  }
  $scope.itemShown = function(item){
    if(~[].concat(item.id).indexOf("9999")) {
      return false;
    }
    return item.returnSence=='SubmitBtn_sence7' || item.returnSence=='';
  }

  $scope.moreAction = function() {
    function getIcon(btn) {
      var map = {
        "zhihui": "indi-zhihui",
        "zhihuibanbi": "indi-zhihui1",
        "zhihuichehui": "indi-zhihui1",
        "bohui": "indi-bohui",
        "goutongstart": "indi-goutong",
        "chehui": "indi-chehui",
        "guanzhu": "indi-guanzhu1",
        "forward": "indi-huifu",
        "chehui": "indi-chehui",
        "goutongsubmit": "indi-goutong",
        "goutongend": "indi-goutong1",
        "zancun": "indi-zancun"
      };
      var icon = map[btn.id] || "ion-ios-filing";
      if(btn.id=="guanzhu" && btn.label==="取消关注") {
        icon = "indi-guanzhu2"
      }
      return '<i class="icon ' + icon + '"></i>' + btn.label
    }
    var btns = $scope.actionBtns.map(function(btn){
      return {

        id:btn.id,
        text: getIcon(btn),
        label: btn.label
      }
    }).filter(function(btn){
      return !~btn.id.indexOf("huiqian") && !~btn.id.indexOf("hqgtfk") && !~btn.id.indexOf("zhihuichehui")
    });
    $ionicActionSheet.show({
      activityStyle:true,
     buttons: btns,
     cancelText: '取消',
     buttonClicked: function(index) {
           //console.log(btns[index].id);
           switch(btns[index].id){
                case "guanzhu":
                  if(btns[index].label==="关注") {
                    $scope.guanzhu("add").then(function(){
                      $scope.actionBtns[index].label = "取消关注";
                    });
                  }else if(btns[index].label==="取消关注") {
                    $scope.guanzhu("del").then(function(){
                      $scope.actionBtns[index].label = "关注";
                    });
                  }
                  break;
                case "chehui":
                   $ionicPopup.confirm({
                     title: '确认撤回？',
                   }).then(function(res) {
                     if(res) {
                            $scope.chehui();
                     } else {
                        // console.log('You are not sure');
                     }
                   }); 
                 
                  break;
                case "zhihui":
                  $scope.actionType="zhihui";
                  //getzhihui version
                 

                  $scope.openModal();
                  break;
                case "zhihuibanbi":
                  $scope.actionType="yuebi";
                  $scope.openModal();
                  break;
                case "goutongstart":
                  $scope.actionType="goutongstart";
                  $scope.openModal();
                  break;
                case "goutongsubmit":
                  $scope.actionType="goutongsubmit";
                  $scope.openModal();
                  break;
                case "goutongend":
                  FormDataService.goutongperson($scope.fileinfo).then(function(data){
                    $scope.form.goutongdealers = data.dealers.map(function(item){
                      var key = Object.keys(item)[0];
                      return {
                        "dealer": key,
                        "extDealer": item[key]
                      }
                    });
                    $scope.goutongendpage.show();
                  })
                  break;
                case "bohui":
                  $scope.actionType="bohui";
                  FormDataService.getDeny($scope.fileinfo).then(function(items){
                      $scope.form.denyNodeList=items;
                      $scope.form.denyNodeList.forEach(function(item) {
                        item = angular.extend(item, {mail:item.tmpyoujian=="yes",sms:item.tmpSms=="yes"});
                      });
                  });
                  $scope.openModal();
                  break;
                case "forward":
                  $scope.actionType="forward";
                  $scope.openModal();
                  break;
				case "zancun":
					FormDataService.zancun($scope.fileinfo, $scope.form).then(function(data) {
                    $ionicPopup.alert({
                      title: '暂存成功',
                    }).then(function() {
                      if (data.type == "success") {
                          FormDataService.addLock({
                                dbpath: $stateParams.domain+$stateParams.path,
                                unid: $stateParams.id
                          })
                      }
                    });
                  })
				  break;
            }
        return true;
     }
   });
  };
  
    //bug:147
    $scope.getFormatUsers=function(msg){
	  if(msg.indexOf("<span class='userName'>")>0){
		var reg = /<span class='userName'>((.|\n)*?)<\/span>/g; 
		var result=msg.match(reg);
		for(var i=0;result[i]!=undefined;i++){
			var user=result[i].replace("<span class='userName'>","").replace("</span>","");
			msg=msg.replace(user,$filter('domUser')(user));
		}
		return msg;
	  }	
	  return msg;
    };
  
  $ionicModal.fromTemplateUrl('app/webflow/goutongend.html', {
    scope: $scope,
    animation: 'slide-in-right'
  }).then(function(modal) {
    $scope.goutongendpage = modal;
    $scope.cancelGoutong = function(){
      $scope.goutongendpage.hide();
    };
    $scope.endGoutong = function(){
      var dealers = $scope.form.goutongdealers.filter(function(item){
        return item.checked
      }).map(function(item){
        return item.dealer
      });
      var strNotifyWay = Object.keys($scope.form.goutong).filter(function(key){
        return ~["mail", "sms"].indexOf(key) && $scope.form.goutong[key]
      }).map(function(key){
        return key;
      });
      FormDataService.goutongendsubmit($scope.fileinfo, dealers, strNotifyWay)
      .then(function(data){
		data.msg = $scope.getFormatUsers(data.msg);//bug147
        return $ionicPopup.alert({
          title: data.msg,
        });
      })
      .then(function(){
        return $scope.goutongendpage.hide()
      })
      .then(function(){
        $rootScope.refresh = true;
        $state.go("tab.home.todo");
      });
    };
  });

  $ionicModal.fromTemplateUrl('app/webflow/comments.html', {
    scope: $scope,
    animation: 'slide-in-up',
    focusFirstInput: true
  }).then(function(modal) {
    $scope.commentModal = modal;
  });
  $ionicModal.fromTemplateUrl('app/webflow/submitpage.html', {
    scope: $scope,
    animation: 'slide-in-right'
  }).then(function(modal) {
    $scope.submitModal = modal;
  });

  $scope.openModal = function() {
    $ionicSlideBoxDelegate.update();
    $scope.commentModal.show();
  };
  $scope.closeModal = function() {
          switch( $scope.actionType){
                case "chehui":
                  break;
                case "zhihui":
                  $scope.submitModal.show();
                  break;
                case "yuebi":
                  $scope.submitFormActions.yuebi();
                  break;
                case "goutongstart":
                  $scope.submitModal.show();
                  break;
                case "goutongsubmit":
                  $scope.submitFormActions.goutongsubmit();
                  break;
                case "forward":
                  $scope.submitModal.show();
                  break;
                case "bohui":
                  $scope.submitModal.show();
                  break;
                case "zancun": //zhangweiguo修改
                  FormDataService.zancun($scope.fileinfo, $scope.form).then(function(data) {
                    $ionicPopup.alert({
                      title: '暂存成功',
                    }).then(function() {
                      if (data.type == "success") {
                          FormDataService.addLock({
                                dbpath: $stateParams.domain+$stateParams.path,
                                unid: $stateParams.id
                          })
                      }
                    });
                  })
                  break;
                default: 
                  $scope.submit();
            }
   
    $scope.commentModal.hide();
  };
  $scope.cancelComment = function() {

    $scope.form.comments = "";
    $scope.commentModal.hide();
  };
  $scope.submit = function(){
    // console.info($scope.returnSence);
    //zhangweiguo修改
	var ha=$scope.HAInfo.data;
    var comments = $scope.form.comments;
    var iscommentModal = $scope.commentModal._isShown;
    if (!comments&&!ha&&$scope.formData.power.canHandAttitude=='1') {
      $ionicPopup.confirm({
          title: '消息提示',
          template: '您还没有填写意见，是否确定？',
          cancelText: '取消',
          okText: '确定'
        })
        .then(function(res) {
          if (res) {
            _submit();
          } else {
            if (iscommentModal) {
              $scope.openModal();
            }
          }
        });
    } else {
      _submit();
    }
    
    function _submit() {
      var immediateSence = ['SubmitBtn_sence1', 'SubmitBtn_sence2', 'SubmitBtn_sence4'];
      if (~immediateSence.indexOf($scope.returnSence)) {
        $scope.submitFormAuto();
      } else if ("SubmitBtn_sence5" == $scope.returnSence) {
        $scope.form.nodeList.forEach(function(item) {
          if ("SubmitBtn_sence7" != item.returnSence) return;
          var param = angular.extend($scope.fileinfo, {
            nodeid: item.id
          });
          NodeInfoService.get(param).then(function(data) {
            item = angular.extend(item, data);
          });
        });

        if ($scope.form.nodeList.length == 1) {
          $scope.form.nextNode = "0";
        }
        $scope.actionType = "submit";
        $scope.submitModal.show();
      } else if ("SubmitBtn_sence3" == $scope.returnSence) {
        var param = angular.extend($scope.fileinfo, {
          nodeid: $scope.FlowBtns.btnsubmit.curnode
        });
        NodeInfoService.getNextNode(param).then(function(data) {
          //直接提交无需参数
          var immediateSence = ['GetNextNode_sence1', 'GetNextNode_sence2'];
          var sendNodeIdSence = [];
          if (~immediateSence.indexOf(data.returnSence)) {
            $scope.submitFormAuto();
          } else if ("GetNextNode_sence4" == data.returnSence) {
            $scope.form.nextNodeId = "9999";
            $scope.submitFormAuto();
          }
        });
      }
    }

  };

  // $scope.$watch("form.nextNode", function(val){
    
  // });

  $scope.mergeOrSplit = function(val){
    if(val && $scope.form.nodeList[val]) {
      if("SubmitBtn_sence9" == $scope.form.nodeList[val].returnSence){
        var param = angular.extend($scope.fileinfo, {
          nodeid: $scope.form.nodeList[val].id
        });
        NodeInfoService.getBxfzSplitNode(param)
        .then($scope.toSplitNode)
        .then(function(data){
          $scope.form.strBxfz = {
            "items": data
          };
          FormDataService.bxfzSplit($scope.fileinfo, $scope.form)
            .then($scope.submitFormActions.afterSubmit);

        });
      }else if("SubmitBtn_sence10" == $scope.form.nodeList[val].returnSence){
        var param = angular.extend($scope.fileinfo, {
          nodeid: $scope.form.nodeList[val].id,
          action: "bxfz"
        });
        NodeInfoService.getNextNode(param).then(function(data) {
          // console.log(data)
          var immediateSence = ['GetNextNode_sence1','GetNextNode_sence2'];
          if (~immediateSence.indexOf(data.returnSence)) {
            $scope.submitFormAuto();
          }else if("GetNextNode_sence8" == data.returnSence) {
            $scope.form.strBxhbFlag = "bxtj";
            $scope.submitFormAuto();
          }else if("GetNextNode_sence9" == data.returnSence){            
            var nextid = _getMergeInfo($scope.form.nodeList[val]);
            $scope.form.nextNodeId = nextid;
            $scope.form.nextNode = null;
            $scope.form.strBxhbFlag = "bxtj";
            $scope.submitFormAuto();
          }else if("GetNextNode_sence10" == data.returnSence){
            param.nodeid = _getMergeInfo($scope.form.nodeList[val]);
            $scope.toMergeNode(data, param)
          }else if("GetNextNode_sence11" == data.returnSence) {
            param.nodeid = _getMergeInfo($scope.form.nodeList[val]);
            $scope.toMergeNode(data, param)
          }
        });
      }
    }
  }

  var _unique = function(arr) {
    var unique = {};
    return arr.filter(function(item) {
      if (!unique[item]) {
        unique[item] = true;
        return true;
      }
      return false;
    });
  };
  var _getMergeInfo = function(data) {
    var ret = [data.id];
    if(data.merger && data.merger.nextline) {
      ret = ret.concat(_getMergeInfo(data.merger.nextline[0][0].target))
    }
    return ret;
  };
  $scope.toMergeNode = function(nextNode, param) {
    var modalScope = $scope.$new();
    modalScope.form = {};
    modalScope.form.nodeList = nextNode.nextline.map(function(item) {
      var ret = angular.copy(item[0].target);

      ret.id = _unique([].concat(param.nodeid, _getMergeInfo(ret)))
      return ret
    });
    if(modalScope.form.nodeList.length == 1) {
      modalScope.form.nextNode = "0";
    }
    var initModal = $ionicModal.fromTemplateUrl('app/webflow/submitpage.html', {
      scope: modalScope,
      animation: 'slide-in-right'
    });
    return $q(function(resolve, reject) {
      initModal.then(function(modal) {
        modal.show();
        modalScope.cancelSubmit = function(){
          modal.hide();
        };
        modalScope.submitForm = function(){
          if (!modalScope.form.nextNode) {
            $ionicPopup.alert({
              title: "提交失败",
              template: "请选择下一环节"
            });
            return false;
          };
          modal.hide().then(function() {
            $scope.form.nextNode = modalScope.form.nextNode;
            $scope.form.nodeList = modalScope.form.nodeList;
            $scope.form.strBxhbFlag = "bxhb";
            $scope.submitFormAuto();
          });
          
        };
      });
    });
  };
  $scope.toSplitNode = function(splitInfo){
    // console.log(splitInfo)
    var modalScope = $scope.$new();
    modalScope.modalCtrl = {
      data: splitInfo
    };
    modalScope.modalCtrl.nodeList = modalScope.modalCtrl.data.nextline.map(function(item) {
      var ret = angular.copy(item[0].target);
      ret.form = {};
      var map = {
        "defaultuser": "defaultuser",
        "defaultzhihuiren": "zhr",
        "tmpSms": "sms",
        "tmpYoujian": "mail",
        "tmpRule": "spgz",
        "tmpEditable": "idx.eword",
        "tmpIDXEditable": "idx.eatt",
        "tmpIDXNew": "idx.uatt"
      };
      Object.keys(ret.detail).forEach(function(key){
        var val = ret.detail[key]
        if(Array.isArray(val)){
          val = val.join("");
        }
        if(map[key] && ~map[key].indexOf(".")) {
          var prop1 = map[key].split(".")[0];
          var prop2 = map[key].split(".")[1];
          if(!ret.form[prop1]) {
            ret.form[prop1] = {}
          }
          ret.form[prop1][prop2] = val;
          return;
        }
        ret.form[map[key]||key] = val;
      });
      ret.form.flownum = ret.id;
      ret.form.nodename = ret.name;
      return ret;
    });
    var initModal = $ionicModal.fromTemplateUrl('app/webflow/split-selector.html', {
      scope: modalScope,
      animation: 'slide-in-right'
    });
    return $q(function(resolve, reject) {
      initModal.then(function(modal) {
        modalScope.modalCtrl.modal = modal;
        modalScope.modalCtrl.modal.show();
        modalScope.modalCtrl.cancel = function() {
          modalScope.modalCtrl.modal.hide();
          $scope.form.nextNode = null;
        };
        modalScope.modalCtrl.submit = function() {
          var ret = modalScope.modalCtrl.nodeList
          .filter(function(item){
            return item.form.selected
          })
          .map(function(item){
            return item.form
          });
          if(ret.length<=0) {
            $ionicPopup.alert({
              title: "提交失败",
              template: "请至少选择一个分支"
            });
            return;
          }
          if(ret.some(function(item){
            return item.defaultuser.length<=0
          })) {
            $ionicPopup.alert({
              title: "提交失败",
              template: "分支处理人不能为空"
            });
            return;
          }
          modalScope.modalCtrl.modal.hide().then(function() {
            if (ret.length) {
              resolve(ret);
            } else {
              reject(ret);
            }
          });
        };
      });
    });
  };

  $scope.cancelSubmit = function(){
    $scope.submitModal.hide().then(function(){
       $scope.actionType="submit";
       $scope.form.nextNode = null;
    });
   
  };
  $scope.addLock = function() {
    return FormDataService.addLock($scope.fileinfo).then(function(data){
      console.info(data.msg);
    });
  };
  $scope.clearLock = function() {
    return FormDataService.clearLock($scope.fileinfo).then(function(data){
      console.info(data.msg);
    });
  };
  $scope.form.HAfilename="";
  $scope.submitFormAuto = function() {
    //先提交手写批示
    $scope.submitHA()
      .then(function(){
        $scope.submitFormActions.submit();
      });
  };
  $scope.submitForm = function() {
    if ($scope.actionType=="submit" && !$scope.form.nextNode) {
      $ionicPopup.alert({
        title: "提交失败",
        template: "请选择下一环节"
      });
      return false;
    };
    if ($scope.actionType=="submit" 
      && $scope.form.nodeList[$scope.form.nextNode].submitto 
      && $scope.form.nodeList[$scope.form.nextNode].submitto.length<=0) {

      $ionicPopup.alert({
        title: "提交失败",
        template: "下一环节处理人不能为空"
      });
      return false;
    };
    if ($scope.actionType=="goutongstart" 
      && $scope.form.goutongUser 
      && $scope.form.goutongUser.length<=0) {

      $ionicPopup.alert({
        title: "提交失败",
        template: "沟通处理人不能为空"
      });
      return false;
    };
    if ($scope.form.nextNode && $scope.form.nodeList) {
      if (~["SubmitBtn_sence9", "SubmitBtn_sence10"].indexOf($scope.form.nodeList[$scope.form.nextNode].returnSence)) {
        return $scope.mergeOrSplit($scope.form.nextNode)
      }
    }
    
    //先提交手写批示
    $scope.submitHA()
      .then(function(){
      if ($scope.actionType == "submit") {
        var returnSence = $scope.form.nodeList[$scope.form.nextNode].returnSence;
        // console.log(returnSence)
        if (~['SubmitBtn_sence6', 'SubmitBtn_sence7'].indexOf(returnSence) || ""==returnSence) {
          $scope.submitFormActions.submit();
        } else if ("SubmitBtn_sence9" == returnSence) {

        }
      } else {
        $scope.submitFormActions[$scope.actionType]();
      }
        
      });
  };
  $scope.submitHA = function(){
    return $q.when(FormDataService.submitHA($scope.HAInfo)).then(function(data){
      if(data.status == "success"){
        $scope.form.HAfilename=data.message;
      }
    });
  };
  $scope.submitFormActions = {
    afterSubmit: function(data) {
      if (data.status == "success") {
        $scope.clearLock()
          .then(function() {
            return $scope.submitModal.hide()
          })
          .then(function() {
			data.message = $scope.getFormatUsers(data.message);
            return $ionicPopup.alert({
              title: "提交成功",
              template: data.message
            });
          })
          .then(function() {
            $rootScope.refresh = true;
            $state.go("tab.home.todo");
          });
      } else if (data.status == "fail") {
		data.message = $scope.getFormatUsers(data.message);
        $ionicPopup.alert({
          title: "提交失败",
          template: data.message
        });
        $rootScope.refresh = true;
        $state.go("tab.home.todo");
      };
    },
    submit: function() {
         $q.when(FormDataService.submit($scope.fileinfo, $scope.form)).then(function(data){      
            if(data.status == "invalid"){
              if(data.invalidType == "nextNode"){
				data.message = $scope.getFormatUsers(data.message);
                $ionicPopup.alert({
                  title: "提交失败",
                  template: data.message
                });
              }
            }else if(data.status == "success"){
              $scope.clearLock()
              .then(function(){
                return $scope.submitModal.hide()
              })
              .then(function(){
				data.message = $scope.getFormatUsers(data.message);
                return $ionicPopup.alert({
                  title: "提交成功",
                  template: data.message
                });
              })
              .then(function(){
                $rootScope.refresh = true;
                $state.go("tab.home.todo");
              });
            }else if(data.status == "fail"){
			  data.message = $scope.getFormatUsers(data.message);
              $ionicPopup.alert({
                title: "提交失败",
                template: data.message
              });
              $state.reload();
            };
          });
      },
    forward:function(){
      //zhangweiguo修改
      var goutingUsers = $scope.form.forwardUser
      var localinfo = localStorage.getItem("uinfo");
      if (localinfo) {
        var userid = angular.fromJson(localinfo).userid;
        var flag = false;
        for (var i = 0; i < goutingUsers.length; i++) {
          var goutingUser = goutingUsers[0];
          goutingUser = goutingUser.split("/")[0].replace("CN=", "");
          if (userid == goutingUser) {
            flag = true;
          }
        }
        if (flag) {
          return $ionicPopup.alert({
            title: userid + " 是处理人，请重新选择！"
          });
        }
      }
     $scope.form['HAInfo']=$scope.HAInfo
      FormDataService.forward($scope.fileinfo, $scope.form).then(function(data){
		  data.msg = $scope.getFormatUsers(data.msg);
          $ionicPopup.alert({
            title: data.msg,
          }).then(function(){
            if (data.type=="success") {
              $rootScope.refresh = true;
                $state.go("tab.home.todo");
            };   
          });
      });
    },
    bohui:function(){
      $q.when(FormDataService.bohui($scope.fileinfo, $scope.form)).then(function(data){
		  data.msg = $scope.getFormatUsers(data.msg);
          $ionicPopup.alert({
            title: data.msg,
          }).then(function(){
            if (data.type=="success") {
              $rootScope.refresh = true;
                $state.go("tab.home.todo");
            };   
          });
      });
    },
    goutongstart:function(){
      //zhangweiguo修改
      var goutingUsers = $scope.form.goutongUser||[];
      if(goutingUsers.length<=0) {
        return $ionicPopup.alert({
          title: "提交失败",
          template: "沟通处理人不能为空"
        });
      }
      var localinfo = localStorage.getItem("uinfo");
      if (localinfo) {
        var userid = angular.fromJson(localinfo).userid;
        var flag = false;
        for (var i = 0; i < goutingUsers.length; i++) {
          var goutingUser = goutingUsers[0];
          goutingUser = goutingUser.split("/")[0].replace("CN=", "");
          if (userid == goutingUser) {
            flag = true;
          }
        }
        if (flag) {
          return $ionicPopup.alert({
            title: userid + " 是处理人，请重新选择！"
          });
        }
      }
      // $scope.submitHA()
      // .then(function(){
      //   return FormDataService.goutongstart($scope.fileinfo, $scope.form)
      // })
      $scope.form['HAInfo']=$scope.HAInfo;
      FormDataService.goutongstart($scope.fileinfo, $scope.form)
      .then(function(data){
		  data.msg = $scope.getFormatUsers(data.msg);
          $ionicPopup.alert({
            title: data.msg,
          }).then(function(){
            if (data.type=="success") {
              $rootScope.refresh = true;
                $state.go("tab.home.todo");
            };   
          });
      });
    },
    goutongsubmit:function(){
      // $scope.submitHA()
      // .then(function(){
      //   return FormDataService.goutongsubmit($scope.fileinfo, $scope.form)
      // })
      $scope.form['HAInfo']=$scope.HAInfo;
      FormDataService.goutongsubmit($scope.fileinfo, $scope.form)
      .then(function(data){
		  data.msg = $scope.getFormatUsers(data.msg);
          $ionicPopup.alert({
            title: data.msg,
          }).then(function(){
            if (data.type=="success") {
              $rootScope.refresh = true;
                $state.go("tab.home.todo");
            };   
          });
      });
    },
    zhihui:function(){
      FormDataService.zhihui($scope.fileinfo, $scope.form).then(function(data){
		  data.msg = $scope.getFormatUsers(data.msg);
          $ionicPopup.alert({
            title: data.msg,
          }).then(function(){
            if (data.type=="success") {
              $rootScope.refresh = true;
                $state.go("tab.home.todo");
            };   
          });
      });
    },
    yuebi:function(){
      FormDataService.getYuebiInfo($scope.fileinfo, $scope.form)
      .then(function(yuebiInfo){
        if(yuebiInfo.length==1){
          return FormDataService.yuebi($scope.fileinfo, $scope.form, yuebiInfo);
        }else if(yuebiInfo.length>1){
          return $scope.selectYuebi(yuebiInfo);
        }
      }).then(function(data){
        return FormDataService.yuebi($scope.fileinfo, $scope.form, data)
      })
      .then(function(data){
		data.msg = $scope.getFormatUsers(data.msg);
        $ionicPopup.alert({
            title: data.msg,
          }).then(function(){
            if (data.type=="success") {
              $rootScope.refresh = true;
               $state.go("tab.home.todo");
            };   
          });
      });
    }
  }
  $scope.chehui = function() {
    return FormDataService.chehui($scope.fileinfo).then(function(data){
		data.msg = $scope.getFormatUsers(data.msg);
        $ionicPopup.alert({
          title: data.msg,
        }).then(function(){
          if (data.type=="success") {
            $rootScope.refresh = true;
              $state.go("tab.home.todo");
          };   
        });
    });
  };
  $scope.guanzhu = function(action) {
    var param = angular.extend($scope.fileinfo,{
      action: action
    });
    return FormDataService.guanzhu(param).then(function(data){
        return $ionicPopup.alert({
          title: action=='add'?'关注成功':'取消关注成功',
        })
    });
  };
  $scope.selectYuebi = function(yuebiInfo) {
    var modalScope = $scope.$new();
    modalScope.modalCtrl = {
      data: yuebiInfo
    };
    var initModal = $ionicModal.fromTemplateUrl('app/webflow/yuebi-selector.html', {
      scope: modalScope,
      animation: 'slide-in-right'
    });
    return $q(function(resolve, reject) {
      initModal.then(function(modal) {
        modalScope.modalCtrl.modal = modal;
        modalScope.modalCtrl.modal.show();
        modalScope.modalCtrl.cancel = function() {
          modalScope.modalCtrl.modal.hide();
        };
        modalScope.modalCtrl.submit = function() {
          var ret = modalScope.modalCtrl.data.filter(function(item) {
            return item.checked
          });
          modalScope.modalCtrl.modal.hide().then(function() {
            if (ret.length) {
              resolve(ret);
            } else {
              reject(ret);
            }
          });
        };
      });
    });
  };
  $scope.$on('$stateChangeStart', function removeAllDialog(event, toState, toParams, fromState, fromParams){
    if(fromState.name == "webflow"){
      $scope.commentModal.remove();
      $scope.submitModal.remove();
      if($scope.HAModal){
        $scope.HAModal.remove();
      }

    }
  });
  $scope.selectPeople = function(item) {
    $scope.bindTo=item;
    selectService.init('app/contact/select.html',$scope).then(function(modal) {
        modal.show();
      });
  };
  $scope.media=null;
  $scope.wavsrc="";
  $scope.form.yjatt={
    "name":"",
    "base64":""
  }
  $scope.RecordInfo={
    isRecording:false,
    refGesture:null,
    refPopup:null,
    wavFullPath:"",
    m4aFullPath:"",
    base64:"",
    duration:0,
    timeStart:null,
    time:''
  }
  $scope.Record = function(action) {
    
      if(action=="start"){
          $scope.RecordInfo.isRecording=true;
          $scope.RecordInfo.timeStart=new Date();
          $ionicLoading.show({
              template: '<div class="luyin-size-96"><i class="icon indi-luyin-1"></i><i class="icon indi-luyin-2"></i><i class="icon indi-luyin-3"></i><i class="icon indi-luyin-4"></i></div>手指上滑，取消发送',
              noBackdrop: true
          }); 

          //按住按钮的时候不能用swipeup捕获上滑动作，此时认为是拖拽
          if(!$scope.RecordInfo.refGesture){
              $scope.RecordInfo.refGesture=ionic.EventController.onGesture("dragup",function(e){$scope.Record('cancel')},document);
          }
          
          $scope.RecordInfo.wavFullPath = "";
          $scope.RecordInfo.m4aFullPath = "";
          $scope.wavsrc=window._tempFs.root.toURL().replace("file://","") + "record.wav";
          window.resolveLocalFileSystemURL(window._tempFs.root.toURL() + "record.m4a",function(fileEntry) {
              fileEntry.remove();
          });
          $scope.media = $cordovaMedia.newMedia($scope.wavsrc);
          $scope.media.startRecord();  
          

      }else if(action=="finish"){
          if(!$scope.RecordInfo.isRecording){
            return
          }
          $scope.RecordInfo.isRecording=false;
          $ionicLoading.hide();

          $scope.media.stopRecord();
          $scope.RecordInfo.wavFullPath =$scope.wavsrc;
          var timeEnd=new Date();
          var dutime =parseInt((timeEnd.getTime()-$scope.RecordInfo.timeStart.getTime())/1000);
          if(dutime&&dutime>0){
            $scope.RecordInfo.duration=dutime;
            var sec=dutime%60;
            var min=(dutime-sec)/60;
            $scope.RecordInfo.time=min?(min+"'"+sec+'"'):sec+'"';

          }
          $scope.media.release(); 
          
          $scope.Record('show');

      }else if(action=="cancel"){
           $scope.RecordInfo.isRecording=false;
           $ionicLoading.hide();
           //取消监听
           if($scope.RecordInfo.refGesture){
                ionic.EventController.offGesture($scope.RecordInfo.refGesture,"dragup",function(){});
                $scope.RecordInfo.refGesture=null
           }
      }else if(action=="show"){
            $scope.RecordInfo.refPopup=$ionicPopup.show({
                scope:$scope,
                templateUrl: "app/webflow/recordattitude.html"
            });
      }else if(action=="remove"){  
            $scope.RecordInfo.wavFullPath = "";
            $scope.RecordInfo.duration=0;
            $scope.RecordInfo.time="";
            $scope.form.yjatt.name="";
            $scope.form.yjatt.base64="";
            $scope.RecordInfo.refPopup.close();
      }else{

      }
  
  };

  $scope.HAInfo={
      dbpath: $stateParams.path,
      unid:$stateParams.id,
      data:""
  };

  $scope.openHAModal = function(curActiveModal) {
    if(!$scope.HAModal){
       $ionicModal.fromTemplateUrl('HAModal.html', {
          scope: $scope,
          animation: 'slide-in-right'
        }).then(function(modal) {
          $scope.HAModal = modal;
          $ionicSlideBoxDelegate.update();
          $scope.HAModal.show();
        });
    }else{
          $ionicSlideBoxDelegate.update();
          $scope.HAModal.show();
    }
    $scope.lastActiveModal=curActiveModal
    if( curActiveModal&&$scope[curActiveModal]){
        $scope[curActiveModal].hide()
    }

    
  };
  $scope.closeHAModal = function() {
    $scope.HAModal.hide();
    if($scope.lastActiveModal&&$scope[$scope.lastActiveModal]){
      $scope[$scope.lastActiveModal].show()
    }
  }

})
.controller('RecordAttitudeCtrl', function($scope,$cordovaFile) {
      var showErr=function(err) {console.log(err)}
      var encodeRec=function(then){
          // 将wav编码为m4a 
          window.encodeAudio($scope.RecordInfo.wavFullPath, function(newM4APath) {
                $scope.RecordInfo.m4aFullPath = newM4APath
                $cordovaFile.readAsDataURL(cordova.file.tempDirectory,"record.m4a").then(function(result){
                    //result=data:audio/x-m4a;base64,AAxxx==
                    var date=new Date()
                    $scope.form.yjatt.name=date.toTimeString()+".m4a";
                    $scope.form.yjatt.base64=result;
                    if(then=="submit"){
                        $scope.submit();
                    }
                },showErr)
          }, showErr);

      }

      $scope.submitRecord=function () {
          $scope.RecordInfo.refPopup.close();
          if($scope.form.yjatt.base64==""){
            encodeRec('submit');
          }else{
            $scope.submit();
          }

      }
      $scope.saveRecord=function () {
          $scope.RecordInfo.refPopup.close();
          if($scope.form.yjatt.base64==""){
            encodeRec();
          }
      }
      $scope.playRecord=function () {
          if($scope.RecordInfo.wavFullPath == ""){
            return
          }
          $scope.media.play();
      }

})
.controller('HandAttitudeCtrl', function($scope) {
      var canvas =document.getElementById("canvas");
      var ctx = canvas.getContext("2d");
      var canvas_hr =document.getElementById("canvas_hr");
      var ctx_hr = canvas_hr.getContext("2d");
      $scope.clearCanvas=function () {
          ctx.clearRect(0,0,canvas.width,canvas.height);
          ctx_hr.clearRect(-canvas.width/2,-canvas.height/2,canvas.width,canvas.height);
          $scope.HAInfo.data=""
      }
      $scope.saveHA =function(){
          var imgwidth = canvas.width;
          var imgheight = canvas.height;
          ctx_hr.drawImage(canvas, -( imgwidth / 2 ), -(imgheight / 2 ));
          var data=canvas_hr.toDataURL();
          $scope.HAInfo.data=data;
          $scope.closeHAModal();
      }

});

