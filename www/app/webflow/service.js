
angular.module('indiplatform.webflow.services', ['ngResource','x2js','indiplatform.contact.services'])
.factory('FormDataService', function(SoapService, CONFIG, x2js, $ionicPopup) {
  return {
    addLock: function(param) {
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      return SoapService.invoke(
        url,
        "wsForAddLock", {
          "STRUNID": param.unid
        }
      ).then(function(res){
        return res.data;
      });
    },
    clearLock: function(param) {
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      return SoapService.invoke(
        url,
        "wsForClearLock", {
          "STRUNID": param.unid
        }
      ).then(function(res){
        return res.data;
      });
    },
    get: function(param) {
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";

      return SoapService.invoke(
        url,
        "wsForFormContentForMobile", {
          "STRUNID": param.unid
        }
      ).then(function(res) {
        var data = res.data;
        var ret = {};
        var flow = x2js.xml_str2json(data.flow);
        // 表单信息
        // data.form.formdetail.unshift({id:"fldsubject",name:"标题",value:[flow.rundata._subject]})//标题信息
        ret.form = data.form;

        // 意见列表
        ret.YjList = [].concat(flow.rundata.spyj.yjitem||[]);
        ret.YjList.forEach(function(yj){
          if(yj.yjtp) yj.yjtp = CONFIG.DOM_ROOT+yj.yjtp
        });
        ret.CurInfo = {};
        Object.keys(flow.rundata.curitem||{}).forEach(function(key) {
          ret.CurInfo[key.replace(/^_/, "")] = flow.rundata.curitem[key];
        });

        // 流转信息
        ret.LzList = [].concat(flow.rundata.flowinfo.item||[])
          .map(function(item) {
            var ret = {};
            Object.keys(item).forEach(function(key) {
              ret[key.replace(/^_/, "")] = item[key];
            });
            return ret
          });

        // 下一环节按钮
        ret.FlowBtns = data.submitbtn;

        // 功能按钮
        ret.ActionBtns = data.functionbtn;

        return ret;
      });
    },
    submitHA: function(haInfo) {
        var url = CONFIG.DOM_ROOT + "/" + haInfo.dbpath + "/wsforflow?OpenWebService";
        if(""==haInfo.data){
          return {
              status: "success",
              message: ""
            };
        }else{
          var base64code=haInfo.data;
          base64code=base64code.substr(base64code.indexOf("base64,")+7)
        }
        return SoapService.invoke(
            url,
            "wsForHAFile", {
              "STRUNID": haInfo.unid,
              "strJson": '{"haFileId":"","haFileEditString":""}',
              "base64file":base64code
            }
        ).then(function(res) {
            return {
              status: res.data.type,
              message: res.data.msg
            };
        });
    },
    submit: function(param, formData) {
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      var nextNode, nextNodeId, nextDealer, notifyto;
      if(formData.nextNode){
        nextNode = formData.nodeList[formData.nextNode];
        nextNodeId = [].concat(nextNode.id);
        nextDealer = [].concat(nextNode.submitto);
        notifyto = [].concat(nextNode.notifyto);
      }else{
        nextNodeId = formData.nextNodeId || [];
        nextDealer = formData.nextDealer || [];
      }
      var strNotifyWay = Object.keys(nextNode||{}).filter(function(key){
        return ~["mail", "sms"].indexOf(key) && nextNode[key]
      }).map(function(key){
        return key;
      });
      var zhihuiWay = Object.keys(nextNode||{}).filter(function(key){//这是前端手动选择的知会人员的通知方式
        return ~["notifymail","notifysms","notifytoread"].indexOf(key) && nextNode[key]
      }).map(function(key){
        return key.replace('notify',"");
      });
      var data = {
        "flow": { //流程相关提交参数
          "strLineID": [], //提交的连线ID（连线数据结构+同处理人跳过）
          "strNodeID": nextNodeId, //提交到的环节编号（同处理人跳过情况）
          "strNextDealer": nextDealer, //提交到的环节处理人
          "strAttitude": formData.comments || "", //审批意见
          "strHAFile": formData.HAfilename, //手写文件名
          "strSpgz": "", //多人审批规则
          "strBj": "", //是否可以编辑审批单
          "strNexIdx": "", //是否可以上传idx
          "strBjIdx": "", //是否可以编辑idx
          "strBxhbFlag": formData.strBxhbFlag || "", //并行分支处理标示，请参看1.4.1、1.4.2.5解析说明：bxtj、bxwhb、bxhb、空 
          "strNotifyWay": strNotifyWay,
          "strZhihui":{
                        "users":notifyto || [],
                        "notifyways":zhihuiWay
                      }
        },
        "clientType": "", //请求webservice的客户端类型，项目根据需求做自己的业务定制，改属性在流转记录和审批意见中存储
        "form": {
          "fldzhihuiren": notifyto || []
        } //业务表单相关提交参数，暂为空
      };

      // console.log(data);
      var wsName="wsForSubmit"
      var wsParam={
        "STRUNID": param.unid,
        "strJson": angular.toJson(data)
      }
      if(formData.yjatt.base64!=""){
          var base64code=formData.yjatt.base64;
          base64code=base64code.substr(base64code.indexOf("base64,")+7);
          wsName="wsForSubmitWithAttach"
          wsParam={
            "STRUNID": param.unid,
            "strJson": angular.toJson(data),
            "indiatts":'<INDIATTS><ARRAY>'+
                          '<INDIATT>'+
                            '<BUSINESSTYPE>default</BUSINESSTYPE>'+
                            '<CATNUM>-5</CATNUM>'+
                            '<FILECONTENT>'+base64code+'</FILECONTENT>'+
                            '<FILENAME>'+formData.yjatt.name+'</FILENAME>'+
                         '</INDIATT>'+
                      '</ARRAY></INDIATTS>'
          }
      }
      return SoapService.invoke(
        url,
        wsName, 
        wsParam
      ).then(function(res) {
        return {
          status: res.data.type,
          message: res.data.msg
        };
      });
    },
    bxfzSplit:function(param, formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsForHRFlow?OpenWebService";
      var domuser = ['defaultuser', 'zhr'];
      formData.strBxfz.items.forEach(function(item){
        domuser.forEach(function(prop){
          if(item[prop] && Array.isArray(item[prop])) {
            item[prop] = item[prop].join(",")
          }
        })
      });

      var data = {
        "flow": {
          "strLineID": [],
          "strNodeID": [].concat(param.nodeid),
          "clientType": "",
          "strAttitude": formData.comments || "", //审批意见,
          "strBxfz": {
            "items": formData.strBxfz.items
          }
        },
        "form": {} /*业务表单相关提交参数，暂为空*/
      };
      return SoapService.invoke(
        url,
        "wsForBxfzSplit", {
          "STRUNID": param.unid,
          "strJson": angular.toJson(data),
          "indiatts": '<INDIATTS xsi:type="urn:INDIDOCATTCHMENTARRAY">' +
                      '<ARRAY xsi:type="urn:ArrayOfINDIDOCATTCHMENT" soapenc:arrayType="urn:INDIDOCATTCHMENT[]"/>' +
                      '</INDIATTS>'
        }
      ).then(function(res){
        return {
          status: res.data.type,
          message: res.data.msg
        };
      });
    },
    guanzhu: function(param){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      return SoapService.invoke(
        url,
        "wsForGuanzhu", {
          "strUNID": param.unid,
          "strAction": param.action
        }
      ).then(function(res){
        return res.data;
      });
    },
    chehui:function(param){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      return SoapService.invoke(
        url,
        "wsForCheHuiConfirm", {
          "STRUNID": param.unid
        }
      ).then(function(res){
        return res.data;
      });
    },
    forward:function(param, formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      var strNotifyWay = Object.keys(formData.forward||{}).filter(function(key){
        return ~["mail", "sms"].indexOf(key) && formData.forward[key]
      }).map(function(key){
        return key;
      });
      var data = {
        "strAttitude": formData.comments || "",            /*审批意见*/
        "clientType"  :"",            /*调用方类型*/
        "strUser" : [].concat(formData.forwardUser),    /*被转办人*/  
        "strNotifyWay": strNotifyWay     /* mail（邮件通知）,sms(短信通知)*/
      };
      return SoapService.invoke(
        url,
        "wsForZhuanBanConfirm", {
          "STRUNID": param.unid,
          "strJson": angular.toJson(data),
          "indiatts": '<INDIATTS xsi:type="urn:INDIDOCATTCHMENTARRAY">' +
                      '<ARRAY xsi:type="urn:ArrayOfINDIDOCATTCHMENT" soapenc:arrayType="urn:INDIDOCATTCHMENT[]"/>' +
                      '</INDIATTS>'
        }
      ).then(function(res){
        return res.data;
      });
    },
    //zhangweiguo修改
    zancun: function(param, formData) {
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      var strJson = {
        "strunid": param.unid,
        "strAttitude": formData.comments || "",
        "tryTypeTrans": true,
        "data": {}
      }

      // console.info(angular.toJson(strJson));
      // console.info(formData);
      var base64code = formData.yjatt.base64;
      base64code = base64code.substr(base64code.indexOf("base64,") + 7);
      return SoapService.invoke(
        url,
        "wsForSaveDraft", {
          "strJson": angular.toJson(strJson),
          "indiatts": '<INDIATTS><ARRAY>' +
            '<INDIATT>' +
            '<BUSINESSTYPE>default</BUSINESSTYPE>' +
            '<CATNUM>-5</CATNUM>' +
            '<FILECONTENT>' + base64code + '</FILECONTENT>' +
            '<FILENAME>' + formData.yjatt.name + '</FILENAME>' +
            '</INDIATT>' +
            '</ARRAY></INDIATTS>'
        }
      ).then(function(res) {
        return res.data;
      });
    },
    goutongstart:function(param, formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      var args = {
        "strDealer": [].concat(formData.goutongUser),   /*被沟通人*/    
        "strAttitude": formData.comments || "",              /*意见文本*/
        "clientType": ""             /*调用方类型*/
      };
      var indiatts = '<INDIATTS xsi:type="urn:INDIDOCATTCHMENTARRAY">'+
              '<ARRAY xsi:type="urn:ArrayOfINDIDOCATTCHMENT" soapenc:arrayType="urn:INDIDOCATTCHMENT[]"/>'+
              '</INDIATTS>';
      if(formData.yjatt.base64!=""){
          var base64code=formData.yjatt.base64;
          base64code=base64code.substr(base64code.indexOf("base64,")+7);
          indiatts = '<INDIATTS><ARRAY>'+
                          '<INDIATT>'+
                            '<BUSINESSTYPE>default</BUSINESSTYPE>'+
                            '<CATNUM>-5</CATNUM>'+
                            '<FILECONTENT>'+base64code+'</FILECONTENT>'+
                            '<FILENAME>'+formData.yjatt.name+'</FILENAME>'+
                         '</INDIATT>'+
                      '</ARRAY></INDIATTS>';
      }
      return SoapService.invoke(
        url,
        "wsForGTAdd", {
          "STRUNID": param.unid,
          "strJson" : angular.toJson(args),
          "indiatts": indiatts
        }
      ).then(function(res){
        return res.data;
      });
    },
    goutongsubmit:function(param, formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      var args = { 
        "strAttitude": formData.comments || "",              /*意见文本*/
        "clientType": ""             /*调用方类型*/
      };
      var indiatts = '<INDIATTS xsi:type="urn:INDIDOCATTCHMENTARRAY">'+
              '<ARRAY xsi:type="urn:ArrayOfINDIDOCATTCHMENT" soapenc:arrayType="urn:INDIDOCATTCHMENT[]"/>'+
              '</INDIATTS>';
      if(formData.yjatt.base64!=""){
          var base64code=formData.yjatt.base64;
          base64code=base64code.substr(base64code.indexOf("base64,")+7);
          indiatts = '<INDIATTS><ARRAY>'+
                          '<INDIATT>'+
                            '<BUSINESSTYPE>default</BUSINESSTYPE>'+
                            '<CATNUM>-5</CATNUM>'+
                            '<FILECONTENT>'+base64code+'</FILECONTENT>'+
                            '<FILENAME>'+formData.yjatt.name+'</FILENAME>'+
                         '</INDIATT>'+
                      '</ARRAY></INDIATTS>';
      }
      return SoapService.invoke(
        url,
        "wsForGTSubmit", {
          "STRUNID": param.unid,
          "strJson" : angular.toJson(args),
          "indiatts": indiatts
        }
      ).then(function(res){
        return res.data;
      });
    },
    goutongendsubmit:function(param, dealers, strNotifyWay){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";

      var args = { 
        "strDealer": dealers || [],              /*意见文本*/
        "strNotifyWay": strNotifyWay,
        "clientType": ""             /*调用方类型*/
      };
      return SoapService.invoke(
        url,
        "wsForGTEndSubmit", {
          "STRUNID": param.unid,
          "strJson" : angular.toJson(args),
          "indiatts": '<INDIATTS xsi:type="urn:INDIDOCATTCHMENTARRAY">'+
              '<ARRAY xsi:type="urn:ArrayOfINDIDOCATTCHMENT" soapenc:arrayType="urn:INDIDOCATTCHMENT[]"/>'+
              '</INDIATTS>'
        }
      ).then(function(res){
        return res.data;
      });
    },
    goutongperson:function(param, formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      
      return SoapService.invoke(
        url,
        "wsForGouTongEndDealers", {
          "STRUNID": param.unid
        }
      ).then(function(res){
        return res.data;
      });
    },
    zhihui:function(param, formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      
      var args = { 
        "attitude": formData.comments || "",              /*意见文本*/
        "user": formData.zhihuiUser,            /*被知会人*/
        "flag": formData.zhihuiflag?"1":"0"   /*知会人是否关注被知会人反馈*/
      };
      return SoapService.invoke(
        url,
        "wsForChuanYueConfirm", {
          "strUNID": param.unid,
          "strJson" : angular.toJson(args)
        }
      ).then(function(res){
        return res.data;
      });
    },
    getYuebiInfo:function(param){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      
      return SoapService.invoke(
        url,
        "wsForYueBiInfo", {
          "strUNID": param.unid
        }
      ).then(function(res){
        return [{
          "from": "CN=admin/O=smartdot", //知会发起人
          "attitude": "", //知会发起人意见
          "time": "2014-10-29 10:30:10", //知会发起时间
          "unid": "C7B0AB990D1AD8EF48257D80000DBF8C" //知会记录文档unid
        },{
          "from": "CN=lichuang/O=smartdot", //知会发起人
          "attitude": "", //知会发起人意见
          "time": "2014-10-29 10:30:10", //知会发起时间
          "unid": "C7B0AB990D1AD8EF48257D80000DBF8C" //知会记录文档unid
        }];
        return res.data;
      });
    },
    yuebi:function(param, formData, yuebiInfo){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";

      var args = yuebiInfo.map(function(item){
        return { 
          "unid": item.unid,
          "yj": formData.comments || ""
        };
      });
      return SoapService.invoke(
        url,
        "wsForYueBi", {
          "strUNID": param.unid,
          "strJson": angular.toJson(args)
        }
      ).then(function(res){
        return res.data;
      });
    },
    getDeny:function(param){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      return SoapService.invoke(
        url,
        "wsForGetDenyInfor", {
          "STRUNID": param.unid
        }
      ).then(function(res){
        return res.data;
      });
    },
    bohui:function(param,formData){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";
      if(!formData.nextNode){
        return {
          status: "invalid",
          invalidType: "nextNode",
          msg: "请选择驳回环节"
        }
      };
      var nextNode = formData.denyNodeList[formData.nextNode];
      var strNotifyWay = Object.keys(nextNode).filter(function(key){
        return ~["mail", "sms"].indexOf(key) && nextNode[key]
      }).map(function(key){
        return key;
      });
      var data = {            
            "strNodeID":nextNode.node,      /*驳回到的环节编号*/
            "strAttitude": formData.comments || "", //审批意见
            "strSpgz": "",        /*多人审批规则*/
            "strDenySubmitOpt":formData.denyBackWay,   /*驳回后提交选项0/1，1标示驳回直送*/
            "strBj": "",        /*是否可以编辑审批单*/
            "strNexIdx": "",      /*是否可以上传idx*/
            "strBjIdx": "",       /*是否可以编辑idx*/
            "strNotifyWay":strNotifyWay,
            "clientType"  :""             /*调用方类型*/

            };

      return SoapService.invoke(
        url,
        "wsForDenyConfirm", {
          "STRUNID": param.unid,
          "strJson": angular.toJson(data)
        }
      ).then(function(res){
        return res.data;
      });
    }
  }
})
.factory('NodeInfoService', function(SoapService,CONFIG) {
  return {
    get: function(param){
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsforflow?OpenWebService";

      return SoapService.invoke(
        url,
        "wsForNodeInfor",{
          "STRUNID":param.unid,
          "strNodeId":param.nodeid
        }
      ).then(function(res){
        var data = res.data;

        var ret = {
            submitto: data.defaultuser[0] ? data.defaultuser : [],
            notifyto: data.defaultzhihuiren,
            mail: data.tmpYoujian[0]=="yes",
            sms: data.tmpSms[0]=="yes"
        };
       //  console.log(ret)
        return ret;
      });
      },
      getNextNode: function(param) {
        var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsForHRFlow?OpenWebService";
        var data = {
          "strNodeID": param.nodeid, /*环节标示，具体值详见wsForSubmitBtnWithoutLock调用说明*/
          "strAction": param.action || "" /*类型标示，可为空或bxfz，具体值详见wsForSubmitBtnWithoutLock调用说明*/
        };

        return SoapService.invoke(
          url,
          "wsForGetNextNode", {
            "STRUNID": param.unid,
            "strJson": angular.toJson(data)
          }
        ).then(function(res) {
          var data = res.data;
          return data;
        });
    },
    getBxfzSplitNode: function(param) {
      var url = CONFIG.DOM_ROOT + "/" + param.dbpath + "/wsForHRFlow?OpenWebService";

      return SoapService.invoke(
        url,
        "wsForBxfzSplitNode", {
          "STRUNID": param.unid,
          "strNodeId": param.nodeid
        }
      ).then(function(res) {
        var data = res.data;
        return data;
      });
    }
  }
})
.factory('CyyService', function(SoapService,CONFIG) {
  return {
    get: function(param){
      var url = "http://" + param.dbpath.split("/").splice(1,1).join("/") + "/cyspy.nsf/wsforcyy?OpenWebService";

      return SoapService.invokeSync(
        url,
        "FnGetallmycyy",{},
        {
          transformResponse: function(data) {
            data = data.map(function(item){
              if(item.content){
                item.content = item.content.replace(/^#_#/,"");
              }
              return item;
            });
            // console.log(data)
            return data;
          }
        }
      );
    }
  }
})
.factory('DocService', function($q,$http,CONFIG,$stateParams) {
  function DocViewer(ref, config, success) {
    // make the new keyword optional
    if (!(this instanceof DocViewer)) {
      return new DocViewer(ref, config, success);
    }
    success = success || angular.noop;
    this.baseURI = CONFIG.DOM_ROOT + "/onlinedocviewer.nsf";
    this.countURI = "/xpdocprecache.xsp?open&src=";
    this.previewURI = "/xpdocviewerds.xsp?open&src="
    this._config = config;
    this._ref = ref;
    this.pages = [];
    var httpConfigpage = {
      method: 'GET',
      url: this.baseURI + this.countURI + this._ref,
      timeout:60000
    };
    var httpConfightml = {
        method: 'GET',
        url: this._src(1, "html") + "&frontproxy=yes&multihtml=yes",
        timeout:60000
      };
    var that = this;

    $http(httpConfigpage).then(function(result){
          var pagecount=result.data.pagecount;
          that._initpage(result.data.pagecount);
          if(['doc','docx',"txt"].indexOf(that._ref.split(".")[that._ref.split(".").length-1])>=0){
            $http(httpConfightml).then(function(result){
            that._inithtml(result.data,pagecount);
            success();
            })
          }else{
            success();
          }
          
    })
    // $q.all([
    //   $http(httpConfigpage),
    //   $http(httpConfightml)
    //   ]).then(function(result){
    //       that._initpage(result[0].data.pagecount);
    //       that._inithtml(result[1].data,result[0].data.pagecount);
    //       success();
    //   })
  }
  DocViewer.prototype = {
    _initpage: function(pagecount){
       this.count = parseInt(pagecount);
          for (var i = 1; i <= this.count; i++) {
            this.pages.push({
              imgURI: this._src(i, "png"),
              pagecode:i
            })
          }
    },
    _inithtml:function(data,pages){
      var that = this;
      that.html =  data;
          that.htmls=[];
          that.htmlsforshow=[]; 
          for (var i = 1; i <= pages; i++) {
                 that.htmls.push({
                      htmlURI: data.substring(0,data.lastIndexOf("-"))+"-"+i+".html"
                  })
          }    
          that.htmlsforshow=[that.htmls[0]]
    },
    _src: function(index, filetype){
      return this.baseURI + this.previewURI + this._ref + "-page-" + index + "&filetype=" + filetype;
    }
  };

  return DocViewer;
});
