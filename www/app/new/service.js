
angular.module('indiplatform.new.services', [])


.factory('NewsService', function(CONFIG,SoapService) {
  var news;
  return {
    getlist: function(param,appserve,callback) {   
      news = [];
      var url = appserve+"/indishare/iowebservice.nsf/wsforinfo?wsdl";
      SoapService.invoke(
        url,
        "wsForGetNoticeList",param
      ).success(function(data, status) { 
        if (typeof(data.datas.item)=="string") {
          data.datas.item=[data.datas.item];
        };
        angular.forEach(data.datas.item,function(item){
           news.push({
                    newtitle:item.split("#####")[0],
                    newtime:item.split("#####")[1],
                    newimgurl:item.split("#####")[2],
                    newcontent:item.split("#####")[3],
                    newid:item.split("#####")[4]
                  }); 
        })
        callback(news);
      }); 
      },
      get: function(id,appserve,dbpath,callback){
           var url = appserve+"/indishare/iowebservice.nsf/wsforinfo?wsdl";
            SoapService.invoke(
              url,
              "wsForNotification",{strUNID:id,ftpShow:0,dbpath:dbpath}
            ).success(function(data, status) {
              callback(data);
          }); 
       
      }
  }
})