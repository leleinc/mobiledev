
angular.module('indiplatform.todo.services', [])


.factory('TodosService', function(SoapService) {
  var cache={};

  return {
    all: function(user,type,callback,refresh,query,start) {
      if(!refresh && cache[type]){
        callback(cache[type]);
        return;
      }
      todos = cache[type] = [];
      todoslen = 0;
      var url = "/indishare/indiwscenter.nsf/wsGetTodolist?OpenWebService";
      SoapService.invoke(
        url,
        "getDBSYListByType",{
          "type": type,
          "personname": user,
          "start": start,
          "docnum": 20,
          "query": query
        }
      ).success(function(data, status) {
        angular.forEach([].concat(data.DATAS.ITEM),function(item){
          if(!item) return;
          todos.push({
            id: todos.length,
            title: item.TITLE,
            type: item.OTHERS,
            from: item.fromuser,
            unid: item.flowunid,
            receivetime: item.receivetime,
            dbpath: item.flowurl
          });
        });
        var todoslen = todos.length;
        if(data.DATAS.allTotal){
          todoslen = data.DATAS.allTotal;
        }
        callback(todos,todoslen);
      });
    },
    get: function(id) {
      return todos[id];
    }
  }
})
.factory('cancelGuanZhuService',function(SoapService,CONFIG){
  return{
    notGuanZhu:function(item,callback){
      var url = CONFIG.DOM_ROOT +"/"+item.dbpath+"/wsforflow?OpenWebService";
          return SoapService.invoke(
        url,
        "wsForGuanzhu",{
          "STRUNID":item.unid,
          "strAction":"del"
        }
      ).then(function(res){
        console.log(res.data)
        if(res.data.type == "success"){
          callback(item.unid);
        }
      });
    }
  }
});
