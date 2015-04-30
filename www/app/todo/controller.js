
angular.module('indiplatform.todo.controllers', [])


.controller('TodosCtrl', function($scope, TodosService) {
  // 控制进入页面显示的加载条
  $scope.initialized = false;
  $scope.moreDataCanBeLoaded = false;
  $scope.doRefresh = function(refresh){
    var start = 1;
    TodosService.all($scope.context.userinfo.userid,0,function(data,todoslen){
      $scope.todos = data;
      $scope.context.userinfo.count.todo = todoslen;
      if($scope.todos.length>=20){
        $scope.moreDataCanBeLoaded = true;
      }
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.refreshComplete');
    },refresh,"",start);
    //$scope.moreDataCanBeLoaded = true;
  };
  $scope.doRefresh(true);

  //shangilhui20150429
  $scope.$on("tab.refreshdata", function(event, data) {
	    //alert("todo-$scpoe.$on-pushservice.refreshdata, data:" + data);
		if (data && data.url && data.url==="tab.home.todo"){
			//alert("tab.home.todo-$scope.doRefresh(true)");
			$scope.doRefresh(true);
		}
  });
  
  //
  $scope.loadMore = function() {//下拉加载更多
    var start = 1;
    if($scope.todos){
      start = $scope.todos.length + 1;
    }
    TodosService.all($scope.context.userinfo.userid,0,function(data,todoslen){
      if($scope.todos && $scope.todos.length>0){
        $scope.todos = $scope.todos.concat(data)
      }else{
        $scope.todos = data;
      }
      $scope.context.userinfo.count.todo = todoslen;
      if(data.length<20){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },true,"",start);
  };
  //
})
.controller('ToreadsCtrl', function($scope, TodosService) {
  $scope.initialized = false;
  $scope.doRefresh = function(refresh){
    var start = 1;
    TodosService.all($scope.context.userinfo.userid,2,function(data,toreadslen){
      $scope.toreads = data;
      $scope.context.userinfo.count.toread = toreadslen;
      if($scope.toreads.length>=20){
        $scope.moreDataCanBeLoaded = true;
      }
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.refreshComplete');
    },refresh,"",start);
  };
  $scope.doRefresh(true);

  //shanglihui20150429
  $scope.$on("tab.refreshdata", function(event, data) {
	    //alert("toread-$scpoe.$on-pushservice.refreshdata, data:" + data);
		if (data && data.url && data.url==="tab.home.toread"){
			//alert("tab.home.toread-$scope.doRefresh(true)");
			$scope.doRefresh(true);
		}
  });
  
  //
  $scope.loadMore = function() {//下拉加载更多
    var start = 1;
    if($scope.toreads){
      start = $scope.toreads.length + 1;
    }
    TodosService.all($scope.context.userinfo.userid,2,function(data,toreadslen){
      if($scope.toreads && $scope.toreads.length>0){
        $scope.toreads = $scope.toreads.concat(data)
      }else{
        $scope.toreads = data;
      }
      $scope.context.userinfo.count.toread = toreadslen;
      if(data.length<20){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },true,"",start);
  };
  //
})
.controller('MydonesCtrl', function($scope, TodosService) {
  $scope.initialized = false;
  $scope.doRefresh = function(refresh){
    var start = 1;
    TodosService.all($scope.context.userinfo.userid,1,function(data,mydoneslen){
      $scope.mydones = data;
      $scope.context.userinfo.count.mydones = mydoneslen;
      if($scope.mydones.length>=20){
        $scope.moreDataCanBeLoaded = true;
      }
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.refreshComplete');
    },refresh,"",start);
  };
  $scope.doRefresh(true);
  //
  $scope.loadMore = function() {//下拉加载更多
    var start = 1;
    if($scope.mydones){
      start = $scope.mydones.length + 1;
    }
    TodosService.all($scope.context.userinfo.userid,1,function(data,mydoneslen){
      if($scope.mydones && $scope.mydones.length>0){
        $scope.mydones = $scope.mydones.concat(data)
      }else{
        $scope.mydones = data;
      }
      $scope.context.userinfo.count.mydones = mydoneslen;
      if(data.length<20){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },true,"",start);
  };
  //
})
.controller('MyattentionsCtrl', function($scope, TodosService,cancelGuanZhuService) {
  $scope.initialized = false;
  $scope.doRefresh = function(refresh){
    var start = 1;
    TodosService.all($scope.context.userinfo.userid,4,function(data,myattentionslen){
      $scope.myattentions = data;
      $scope.context.userinfo.count.myattentions = myattentionslen;
      if($scope.myattentions.length>=20){
        $scope.moreDataCanBeLoaded = true;
      }
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.refreshComplete');
    },refresh,"",start);
  };
  $scope.doRefresh(true);
  $scope.notGuanZhu = function(item){
    cancelGuanZhuService.notGuanZhu(item,function(data){
     $scope.myattentions = $scope.myattentions.filter(function(item){
      return item.unid != data
     });
    });
  };
  //
  $scope.loadMore = function() {//下拉加载更多
    var start = 1;
    if($scope.myattentions){
      start = $scope.myattentions.length + 1;
    }
    TodosService.all($scope.context.userinfo.userid,4,function(data,myattentionslen){
      if($scope.myattentions && $scope.myattentions.length>0){
        $scope.myattentions = $scope.myattentions.concat(data)
      }else{
        $scope.myattentions = data;
      }
      $scope.context.userinfo.count.myattentions = myattentionslen;
      if(data.length<20){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },true,"",start);
  };
  //
})
.controller('MydraftsCtrl', function($scope, TodosService) {
  $scope.initialized = false;
  $scope.doRefresh = function(refresh){
    var start = 1;
    TodosService.all($scope.context.userinfo.userid,5,function(data,mydraftslen){
      $scope.mydrafts = data;
      $scope.context.userinfo.count.mydrafts = mydraftslen;
      if($scope.mydrafts.length>=20){
        $scope.moreDataCanBeLoaded = true;
      }
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.refreshComplete');
    },refresh,"",start);
  };
  $scope.doRefresh(true);
  //
  $scope.loadMore = function() {//下拉加载更多
    var start = 1;
    if($scope.mydrafts){
      start = $scope.mydrafts.length + 1;
    }
    TodosService.all($scope.context.userinfo.userid,5,function(data,mydraftslen){
      if($scope.mydrafts && $scope.mydrafts.length>0){
        $scope.mydrafts = $scope.mydrafts.concat(data)
      }else{
        $scope.mydrafts = data;
      }
      $scope.context.userinfo.count.mydrafts = mydraftslen;
      if(data.length<20){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },true,"",start);
  };
  //
})
.controller('MyreadsCtrl', function($scope, TodosService) {
  $scope.initialized = false;
  $scope.doRefresh = function(refresh){
    var start = 1;
    TodosService.all($scope.context.userinfo.userid,3,function(data,myreadslen){
      $scope.myreads = data;
      $scope.context.userinfo.count.myreads = myreadslen;
      if($scope.myreads.length>=20){
        $scope.moreDataCanBeLoaded = true;
      }
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.refreshComplete');
    },refresh,"",start);
  };
  $scope.doRefresh(true);
  //
  $scope.loadMore = function() {//下拉加载更多
    var start = 1;
    if($scope.myreads){
      start = $scope.myreads.length + 1;
    }
    TodosService.all($scope.context.userinfo.userid,3,function(data,myreadslen){
      if($scope.myreads && $scope.myreads.length>0){
        $scope.myreads = $scope.myreads.concat(data)
      }else{
        $scope.myreads = data;
      }
      $scope.context.userinfo.count.myreads = myreadslen;
      if(data.length<20){$scope.moreDataCanBeLoaded=false;}//如果新获取的条数不到指定的条数说明已经到头了
      if(!$scope.initialized){
        $scope.initialized = true;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    },true,"",start);
  };
  //
});

