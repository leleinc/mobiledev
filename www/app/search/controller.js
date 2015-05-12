

angular.module('indiplatform.search.controllers', [])
.controller('searchCtrl', function($timeout,$ionicScrollDelegate,$state,$rootScope,$ionicPlatform,$scope, $stateParams,$ionicNavBarDelegate,$ionicHistory, NewsService,ContactService,MailService,TodosService,$ionicModal,CONFIG) {
  
    $scope.unique = function(arry){
        var n = {},r=[]; //n为hash表，r为临时数组
        for(var i = 0; i < arry.length; i++) //遍历当前数组
        {
          if (!n[arry[i]]) //如果hash表中没有当前项
          {
            n[arry[i]] = true; //存入hash表
            r.push(arry[i]); //把当前数组的当前项push到临时数组里面
          }
        }
        return r;
      }
      $timeout(function(){
                    if($stateParams.type){
                     $scope.searchtype=$stateParams.type;
                     $scope.setSearchtype($stateParams.type);
                    }
      },200)
      $scope.$on('$stateChangeStart', function(){
               $scope.searchtype=$stateParams.type;
               $scope.setSearchtype($stateParams.type);
               $scope.nothing=false;
      });
   // $ionicNavBarDelegate.showBackButton(false);
    $scope.searchkey={};
    $scope.setSearchtype=function(type){
          $scope.morecanload=false; 
          $scope.firstSearch = true;
          switch(type)
          {
              case "todos":
                $scope.searchtype="todos"
                $stateParams.type="todos"
               
                break;
              case "news":
                $scope.searchtype="news"
                $stateParams.type="news"
             
                break;
              case "mails":
                $scope.searchtype="mails"
                $stateParams.type="mails"
           
                break;
              case "contact":
                $scope.searchtype="contact"
                $stateParams.type="contact"
              
                break;
          }
    }
 
     $scope.dosearch=function(item){
          $scope.nothing=false;
          $ionicScrollDelegate.resize();
          if (typeof(item)!="undefined") {
            $scope.searchkey[$scope.searchtype]=item;
          };
          $scope.showhistory=false;
          if($scope.searchkey[$scope.searchtype]!=""){
                if(!("searchkey" in localStorage)||localStorage["searchkey"]==""){//搜索记录,存7条
                    localStorage.setItem("searchkey",$scope.searchkey[$scope.searchtype])
                 }else{
                    var storekey= localStorage["searchkey"].split(",")
                    storekey.unshift($scope.searchkey[$scope.searchtype]);
                    storekey= $scope.unique(storekey);
                    if(storekey.length>7){
                        storekey.length=7;
                    }
                    localStorage["searchkey"]=storekey;
                 }
          }
          switch($scope.searchtype)
          {
          case "todos":  
           $scope.searchjob();            
            break;
          case "news":      
          $scope.searchnews();         
            break;
          case "mails":    
           $scope.searchmail();    
            break;
          case "contact":
            $scope.searchpeople();
            break;
          }
    }
    $scope.enter = function(ev) {
      if(ev.keyCode==13){
        $scope.dosearch();
        ev.preventDefault();
      }
    }
    $scope.ifshowhistory = function() {
      if("searchkey" in localStorage){
        $scope.showhistory=true;
        $scope.searchhistory=localStorage["searchkey"].split(",")
      }
    }
    $scope.clearhistory = function() {
      localStorage.removeItem("searchkey");
      $scope.showhistory=false;
    }
    $scope.edithistory = function(flag) {
      $scope.showedit=flag;
    }
    $scope.rmovehistory = function(item) {
       $scope.searchhistory.splice($scope.searchhistory.indexOf(item),1); 
       if($scope.searchhistory.length==0){
          $scope.clearhistory();
       }else{
          localStorage["searchkey"]=$scope.searchhistory;
       }
    }
    $scope.goback=function(){ 
        $ionicHistory.goBack();
    //    $ionicNavBarDelegate.showBackButton(true);
    }
    $scope.cancel=function(){ 
      $scope.searchkey[$scope.searchtype]="";
      $scope[$scope.searchtype]=[];
    }
    $scope.searchpeople=function(){ /////////////////////////////////////////////////////////////////人员快速搜索
      $scope.ROOT=CONFIG.DOM_ROOT;
      $scope.defaultimage=CONFIG.DOM_ROOT+"/indishare/addressbook.nsf/noimg.png";
      $scope.contact=["null"];
      var searchkey=$scope.searchkey[$scope.searchtype];
      var patrn=/^[\x00-\xff]*$/;
           if(patrn.test(searchkey)){
              searchkey = '*' + searchkey + '*';
           }
      ContactService.contacts("search=FIELD%20Name%20CONTAINS%20"+searchkey).query(function(data){ 
            if(data.length==0){
                $scope.nothing=true
            }
            $scope.contact=data;
            angular.forEach($scope.contact,function(item){
                var reg=new RegExp($scope.searchkey[$scope.searchtype],"g"); //创建正则RegExp对象  
                item['_name']=item['_name'].replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
            })
      })
    }
 ///////////////////////////////////////////////////////////////////////////////////////邮件搜索
    $scope.searchmail = function(){
        var argument=arguments[0];
        if(argument && $scope.firstSearch){ //第一次搜索滚动BUG
          $scope.firstSearch = false;
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return
        }
        var searchkey=$scope.searchkey[$scope.searchtype];
        if(searchkey==""){
               $scope.mails= [];
               return;
        }
        if(!argument){
               $scope.mails= [];
        }
        var patrn=/^[\x00-\xff]*$/;
        if(patrn.test(searchkey)){
          searchkey = '*' + searchkey + '*';
        }
     
        var param={
          "strUserName": $scope.context.userinfo.userid,
          "folderName": "($All)",
          "mailnum":20,
          "mailtype":3,
          "start":1,
          "query":searchkey
        }
        if(argument){
          param.start=$scope.mails.length+1;
        }
        MailService.all(param,function(data){
          if(!argument&&data.length==0){
              $scope.nothing=true
          }
          //console.log(data);
          var reg=new RegExp($scope.searchkey[$scope.searchtype],"g"); //创建正则RegExp对象 
          angular.forEach(data,function(item){
                var reg=new RegExp($scope.searchkey[$scope.searchtype],"g"); //创建正则RegExp对象  
                item['mailtitle']=item['mailtitle'].replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
                item['mailfrom']=item['mailfrom'].replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
                item['mailcntent']=item['mailcntent'].split("/")[0].replace("CN=","").replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
          })
          $scope.mails= $scope.mails?$scope.mails.concat(data):data;
          if(!argument&&$scope.mails.length>=20){//第一次运行初始标示能否加载更多的值
             $scope.morecanload=true;
          }
          if (argument&&data.length<20) {
              $scope.morecanload=false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        })    
    };
    $scope.modifyMailinfo=function(index){
     $scope.mails[index].mailread='true';
    }
    
    $scope.searchjob = function(){//工作搜索
        
        var argument=arguments[0];
       if(argument && $scope.firstSearch){ //第一次搜索滚动BUG
         $scope.firstSearch = false;
         $scope.$broadcast('scroll.infiniteScrollComplete');
         return
       }
        
        var searchkey=$scope.searchkey[$scope.searchtype];
        if(searchkey==""){
               $scope.todos= [];
               return;
        }
        if(!argument){
               $scope.todos= [];
        }
        var patrn=/^[\x00-\xff]*$/;
           if(patrn.test(searchkey)){
              searchkey = '*' + searchkey + '*';
           }
        var start=1;
        if(argument){
          start=$scope.todos.length+1;
        }
        TodosService.all($scope.context.userinfo.userid,6,function(data){
          if(!argument&&data.length==0){
              $scope.nothing=true
          }
           //console.log(data);
           angular.forEach(data,function(item){
                var reg=new RegExp($scope.searchkey[$scope.searchtype],"g"); //创建正则RegExp对象  
                item['title']=item['title'].replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
                item['type']=item['type'].replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
                item['from']=item['from'].split("/")[0].replace("CN=","").replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
            })
           $scope.todos= $scope.todos?$scope.todos.concat(data):data;
            if(!argument&&$scope.todos.length>=20){//第一次运行初始标示能否加载更多的值
                $scope.morecanload=true;               
            }
          if (argument&&data.length<20) {
              $scope.firstSearch = true;
              $scope.morecanload=false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
        },true,searchkey,start);
        
        
    };
     $scope.searchnews= function(){//公告搜索
        
        var argument=arguments[0];
        if(argument && $scope.firstSearch){ //第一次搜索滚动BUG
          $scope.firstSearch = false;
          $scope.$broadcast('scroll.infiniteScrollComplete');
          return
        }
        var argument=arguments[0];
        var searchkey=$scope.searchkey[$scope.searchtype];
        if(searchkey==""){
               $scope.news= [];
               return;
        }
        if(!argument){
               $scope.news= [];
        }
        var patrn=/^[\x00-\xff]*$/;
           if(patrn.test(searchkey)){
              searchkey = '*' + searchkey + '*';
           }
        var param={strstart:1,strCount:20,searchQuery:searchkey,dbpath:$scope.context.userinfo.appName+"/ioboard.nsf"}
        if(argument){
          param.strstart=$scope.news.length+1;
        }
        NewsService.getlist( param,$scope.context.userinfo.appServer,function(data){
          if(!argument&&data.length==0){
              $scope.nothing=true
          }
          //console.log(data);
          angular.forEach(data,function(item){
                var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;  
                var yuming=urlReg.exec(item.newimgurl);
                if (item.newimgurl) {
                   item.newimgurl=item.newimgurl.replace("http://"+urlReg.exec(item.newimgurl)[0],CONFIG.DOM_ROOT);
                };
                var reg=new RegExp($scope.searchkey[$scope.searchtype],"g"); //创建正则RegExp对象  
                item['newtitle']=item['newtitle'].replace(reg,"<font color=blue>"+$scope.searchkey[$scope.searchtype]+"</font>");
          })
          $scope.news= $scope.news?$scope.news.concat(data):data;
            if(!argument&&$scope.news.length>=20){//第一次运行初始标示能否加载更多的值
                $scope.morecanload=true;
            }
          if (argument&&data.length<20) {
              $scope.morecanload=false;
          }
          $scope.$broadcast('scroll.infiniteScrollComplete');
    });
    };
})
