
angular.module('indiplatform.new.controllers', [])


.controller('NewsCtrl', function($scope, $stateParams, NewsService,CONFIG,UrlService) {
   $scope.initialized = false;
 $scope.news=[];
  var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;  
 $scope.param= {strstart:1,strCount:5,searchQuery:"",dbpath:$scope.context.userinfo.appName+"/ioboard.nsf"};
   if($stateParams.id){
   NewsService.get($stateParams.id,$scope.context.userinfo.appServer,$scope.context.userinfo.appName+"/ioboard.nsf",function(data){
         if(data.imgurl[0]) {
             data.content[0]=data.content[0].replace(new RegExp("http://"+urlReg.exec(data.imgurl[0].url)[0],"gi"),CONFIG.DOM_ROOT);
         }
         $scope.new=data;
         angular.forEach($scope.new.idxfiles,function(item){
          item.url=$scope.context.userinfo.appServer+item.url;
          item.size=Math.floor(item.size/1024)+"KB";
        })
    });
  }
 $scope.doRefresh = function(){
    NewsService.getlist( {strstart:1,strCount:5,searchQuery:"",dbpath:$scope.context.userinfo.appName+"/ioboard.nsf"},$scope.context.userinfo.appServer,function(data){
     $scope.news=[];
      angular.forEach(data,function(item){
            var yuming=urlReg.exec(item.newimgurl);
            if (item.newimgurl) {
               item.newimgurl=UrlService.transform(item.newimgurl);
            };
             $scope.news.push(item);
      })
      $scope.initialized = true;
      $scope.moreDataCanBeLoaded=true;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
  $scope.doRefresh();
 
  $scope.loadMore = function() {
    console.log("more");
    if($scope.news.length==0){
       $scope.$broadcast('scroll.infiniteScrollComplete');
  //     return
      }
    $scope.param.strstart=$scope.news.length+1;
     NewsService.getlist($scope.param,$scope.context.userinfo.appServer,function(data){
      angular.forEach(data,function(item){
        var yuming=urlReg.exec(item.newimgurl);
        if (item.newimgurl) {
           item.newimgurl=UrlService.transform(item.newimgurl);
        };
         $scope.news.push(item);
      })
      if(data.length<$scope.param.strCount){$scope.moreDataCanBeLoaded=false}
      $scope.initialized = true;
         $scope.$broadcast('scroll.infiniteScrollComplete');
    });
 
  };
   
           
 
         
})