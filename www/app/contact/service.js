
angular.module('indiplatform.contact.services', ['ngResource','x2js'])

.factory('ContactService', function(CONFIG,SoapService,$resource) {
  
      var contact;
      var localinfo = localStorage.getItem("uinfo");
      var _rtParam='';
      if(localinfo){
        _rtParam="&_rt="+angular.fromJson(localinfo).addresstree_timestamp+"&count=9999";
        _todoser=angular.fromJson(localinfo).todoserveName;
        _tododb=angular.fromJson(localinfo).todoFile;
      }
      var _cache = {};
      return {  
                alldeps:function(param){
                  return $resource('/indishare/addresstree.nsf/api/data/collections/name/vwDepByParentCode4AddBook?'+param+_rtParam+"&keysexactmatch=true")
                },
                //alldeps:$resource(CONFIG.DOM_ROOT +'/indishare/indinames.nsf/api/data/collections/name/vwABdepparentcode'),
                recentUser:function(param){
                 
                  return $resource(param+'/api/data/collections/name/vwMyRecentUserformobile?'+"count=9999")
                },
                contactstmp:function(param){
                  return $resource('/indishare/addressbook.nsf/api/data/collections/name/vwABMobile_cp?'+param+_rtParam+"&keysexactmatch=true")
                },
                 contacts:function(param){
                  return $resource('/indishare/indinames.nsf/api/data/collections/name/vwABMobile_cp?'+param+_rtParam+"&keysexactmatch=true")
                },
                getAvatar: function(name){
                  if(_cache[name]) {
                    return _cache[name]
                  }

                  var ret = {};
                  this.get(name).then(function(res){
                    ret.avatar = CONFIG.DOM_ROOT + (res.data.msg.img||'/indishare/addressbook.nsf/noimg.png');
                    _cache[name] = ret;
                  });
                  return ret;
                },
                get:function(name){
                          var url = "/indishare/addressbook.nsf/wsForAddressbook?OpenWebService";
                           return   SoapService.invoke(
                                url,
                                "queryByUserAbb",{
                                 user:name
                                }
                              ).success(function(data, status) {            
                               return data;
                            })
                         
                },
                SaveRecentUser: function(names) { //发送邮件内容
                      var url =  "/indishare/indiWSCenter.nsf/wsforUser?OpenWebService";
                      return      SoapService.invoke(
                                      url,
                                      "SaveRecentUser",
                                      {
                                        todoserver:_todoser,
                                        todofile:_tododb,
                                        recentInfo:names
                                      }
                                  )
                },
      }
})
.service('selectService', function($ionicModal, $rootScope) {

  var init = function(tpl, $scope) {

    var promise;
    $scope = $scope || $rootScope.$new();
    promise = $ionicModal.fromTemplateUrl(tpl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.selectmodal = modal;
      return modal;
    });
    return promise;
  }

  return {
    init: init
  }

})
;