
angular.module('indiplatform.contact.controllers', ['ngResource','ionic'])
.controller('ContactCtrl', function($q,$scope,$state,$stateParams,$ionicSlideBoxDelegate,$ionicModal,$ionicScrollDelegate,$ionicLoading,CONFIG, ContactService) {
	setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('contact').enableSlide(false)})
  $scope.$on('$stateChangeStart', function(){
    $ionicSlideBoxDelegate.$getByHandle('contact').update();
  });
	$scope.isrootnode=true; //当前是不是根节点
	$scope.searchkey=""; 
	$scope.currentIndex=0;
	var currentIndex
	$scope.Slide=[{}];
	$scope.checkedradio = {names:{}}; //记录radio选中状态
	var	thisid
	$scope.ROOT=CONFIG.DOM_ROOT;
	$scope.defaultimage=CONFIG.DOM_ROOT+"/indishare/addressbook.nsf/noimg.png";
	ContactService.alldeps("search=[DepartmentCode]="+$scope.context.userinfo.depId).query(function(data){//初始化当前部门及兄弟部门
				$scope.checkedradio.names["radio"+data[0].ParentDepCode]=$scope.context.userinfo.depId;
				ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){
					$scope.Slide[0].depNodes=data;
					$scope.showChilds($scope.context.userinfo.depId,'left');
				})
	})				
	$scope.showChilds=function(id,type){	
		currentIndex=$ionicSlideBoxDelegate.$getByHandle('contact').currentIndex();//当前滑动页签下标
		var contacts=[];
		$q.all([ 
	        // $q will keep the list of promises in a array 根据部门id获取当前部门下的人员和子部门
	        ContactService.contacts("keys="+id.toString()).query(),
	        ContactService.alldeps("keys="+id.toString()).query(),
          ContactService.contactstmp("keys="+id.toString()).query(),
	    ]).then(function (results){
	    
    	    $scope.concats =results[0];			  		
    			$scope.childdeps=results[1];
          $scope.concatstmp=results[2];
            if(type=="left") {//点击左边时刷新页签数组里的人员和子部门数据 
          $scope.Slide[currentIndex].concats=$scope.concats;
          $scope.Slide[currentIndex].concatstmp=$scope.concatstmp;
          $scope.Slide[currentIndex].childdeps=$scope.childdeps;
          $ionicSlideBoxDelegate.$getByHandle('contact').update();
          $scope.release();
          return;
          }                           
          $scope.depNodes=$scope.Slide[currentIndex].childdeps;
            //点击右侧时如果是往下加一级追加页签，如果是点过的就修改数组
            if($scope.Slide.length==currentIndex+1){
               $scope.Slide.push({depNodes:$scope.depNodes,
                        concats:$scope.concats,
                        concatstmp:$scope.concatstmp,
                        childdeps:$scope.childdeps
                    }
                );
            }else{
              $scope.Slide[currentIndex+1].concats=$scope.concats;
              $scope.Slide[currentIndex+1].concatstmp=$scope.concatstmp;
              $scope.Slide[currentIndex+1].depNodes=$scope.depNodes;
              $scope.Slide[currentIndex+1].childdeps=$scope.childdeps;
            }
          $ionicSlideBoxDelegate.$getByHandle('contact').update();
          setTimeout(function(){
              $ionicSlideBoxDelegate.$getByHandle('contact').next();
              $scope.release(); 
          })
    				
	    });
	}
	$scope.backFather=function(){//返回上级节点操作,先找父节点，再找到父节点的父节点，再找叔叔节点	
		currentIndex=$ionicSlideBoxDelegate.$getByHandle('contact').currentIndex();//当前滑动页签下标
		var fatherslide={};
		if(currentIndex==0){
				ContactService.alldeps("search=[DepartmentCode]="+$scope.Slide[0].depNodes[0].DepartmentCode).query(function(data){	//找到左边第一个节点
					var fatherid=data[0].ParentDepCode;
					ContactService.alldeps("search=[DepartmentCode]="+data[0].ParentDepCode).query(function(data){//根据左边第一个节点找到他们的父节点
								ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){//根据他们的父节点再找到叔叔节点
										fatherslide.depNodes=data;
										fatherslide.childdeps=$scope.Slide[0].depNodes;
						  				ContactService.contacts("keys="+fatherid).query(function(data){  		//选择节点下的直接人员	
												fatherslide.concats=data;
							  				$scope.Slide.unshift(fatherslide);
							  				$ionicSlideBoxDelegate.$getByHandle('contact').update();
							  				setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('contact').slide(1, [0])},5);	
							  				setTimeout(function(){
							  					$ionicSlideBoxDelegate.$getByHandle('contact').previous();
							  					$scope.checkedradio.names["radio"+$scope.Slide[0].depNodes[0].ParentDepCode]=fatherid;//父节点的选择状态
												$scope.release();
							  				},200);			
										})
												
							})
				
					})
			
				})
		}else{
				$ionicSlideBoxDelegate.$getByHandle('contact').previous()
				currentIndex=$ionicSlideBoxDelegate.$getByHandle('contact').currentIndex();//当前滑动页签下标
				$scope.release();
		}
	}
  $scope.release=function(){//每次页面事件触发后判断下是不是跟节点
	currentIndex=$ionicSlideBoxDelegate.$getByHandle('contact').currentIndex();//当前滑动页签下标
	if($scope.Slide[currentIndex].depNodes[0].DepartmentCode==1){
	  	$scope.isrootnode=true;
	  }else{
	  	$scope.isrootnode=false;
	  }
	
  }
})
.controller('personCtrl',function($scope,$stateParams,CONFIG,ContactService,$resource){//个人详情
  if($stateParams.name){//oa用户
      ContactService.get($stateParams.name).then(function(data){
        $scope.person=data.data.msg;  
        if( $scope.person.img){ $scope.person.img=CONFIG.DOM_ROOT+$scope.person.img}else{$scope.person.img=CONFIG.DOM_ROOT+"/indishare/addressbook.nsf/noimg.png"}
          var subDeps =$scope.person.fldSubDepsInfo==""?"":JSON.parse($scope.person.fldSubDepsInfo)
        var deps=[]
        for(var x in subDeps ){
          deps=deps.concat(subDeps[x]);
        };
        $scope.person.fldSubDepsInfo=deps;
      })
  }else{//非oa用户
        $resource('/indishare/addressbook.nsf/api/data/documents/unid/'+$stateParams.unid).get(function(data){
            $scope.person=data;  
            $scope.person.img=$stateParams.imgpath;
            if($scope.person.img){ $scope.person.img=CONFIG.DOM_ROOT+$scope.person.img}else{$scope.person.img=CONFIG.DOM_ROOT+"/indishare/addressbook.nsf/noimg.png"}
              var subDeps =$scope.person.fldSubDepsInfo==""?"":JSON.parse($scope.person.fldSubDepsInfo)
            var deps=[]
            for(var x in subDeps ){
              deps=deps.concat(subDeps[x]);
            };
            $scope.person.fldSubDepsInfo=deps;
            $scope.person.MobilePhone=$scope.person.MobilePhone?$scope.person.MobilePhone:"";
            $scope.person.OfficeTel=$scope.person.OfficeTel?$scope.person.OfficeTel:"";
            $scope.person.InternetAddress=$scope.person.InternetAddress?$scope.person.MobilePhone:"";
        })
  }

})
////////////////////////////////////////////////////////////////////////人员选择control
.controller('selectCtrl', function($timeout,$q,$http,$rootScope,$scope,$state,$stateParams,$ionicModal,$ionicSlideBoxDelegate,$ionicScrollDelegate,$ionicLoading,CONFIG, ContactService,x2js) {
	setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').enableSlide(false)})
	$scope.isrootnode=true;
	$scope.searchkey="";
	$scope.currentIndex=0;
	$scope.selected = {names:{}}; 
	$scope.namelist=[];
	$scope.ROOT=CONFIG.DOM_ROOT;
	$scope.checkedradio = {names:{}}; //记录radio部门选中状态,
	$scope.defaultimage=CONFIG.DOM_ROOT+"/indishare/addressbook.nsf/noimg.png";
  $scope.checkedforAll={}

  $scope.checkAll=function(){
    if($scope.islocal){ 
          angular.forEach($scope.recentUser,function(item){
             $scope.selected.names[item._name] =$scope.checkedforAll.isAllChecked?item.AbbName:$scope.checkedforAll.isAllChecked; 
              $scope.showchecked(item.AbbName);
          })
    }else{
      angular.forEach($scope.Slide2[$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()].concats,function(item){
            $scope.selected.names[item._name] =$scope.checkedforAll.isAllChecked?item.AbbName:$scope.checkedforAll.isAllChecked; 
            $scope.showchecked(item.AbbName);
      })
    }
 
  }
    $scope.isAllChecked=function(){//人员选了后检查是否全选
    $timeout(function(){
           var arrays;//[e, e, e, e, e, e, e, e, e, e, e, e, e, e, e, $promise: d, $resolved: true]
           $scope.checkedforAll.isAllChecked=true;
           if($scope.islocal){
              arrays=$scope.recentUser;
           }else{
              arrays=$scope.Slide2[$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()].concats;            
           }
           if(arrays.length==0){
                $scope.checkedforAll.isAllChecked=false;
           }else{
                for(i in arrays ){
                  try{
                      if(!$scope.selected.names[arrays[i].AbbName.split("/")[0]] ){
                      $scope.checkedforAll.isAllChecked=false;
                      break;
                      }    
                  }catch(e){}                       
                }
           }

    },100) 
  }
	var currentIndex;
  	if(eval($scope.bindTo)&&eval($scope.bindTo)[0]){
  		var tmpbindTo=eval($scope.bindTo);
   		if(typeof(eval($scope.bindTo))=="string"){
   		   tmpbindTo=tmpbindTo.split(",")
   		}
      	angular.forEach(tmpbindTo,function(item){
	      	if(item!="") { 
	      		$scope.namelist.push(item.replace("CN=","").replace("O=",""));
	      		$scope.selected.names[item.replace("CN=","").replace("O=","").split("/")[0]]=item.replace("CN=","").replace("O=","")
	      	};
      	})
  	}
  $scope.Slide2=[{}];
  var thisid 
  ContactService.alldeps("search=[DepartmentCode]="+$scope.context.userinfo.depId).query(function(data){//初始化当前部门及兄弟部门
        ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){
        	$scope.checkedradio.names["radio"+data[0].ParentDepCode]=$scope.context.userinfo.depId;
          	$scope.Slide2[0].depNodes=data;
          	$scope.showChilds($scope.context.userinfo.depId,'left');
        })
  })  
  $scope.showChilds=function(id,type){
    $scope.checkedforAll.isAllChecked=false;
  	currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex();
  	$scope.islocal=false;
  	if (id=='local') {//常用选择联系人
  		  ContactService.recentUser($scope.context.userinfo.todoServer+"/"+$scope.context.userinfo.todoFile).query(function(data){
  			var recentUser=[]
	  		angular.forEach(data,function(item){
	         	item._name=item.AbbName.split("/")[0];
	          recentUser.push(item);
	        })
  			$scope.recentUser=recentUser;
        $scope.isAllChecked();

  		})
  		$scope.islocal=true ;

  		return;
  	};
 	var contacts=[];
  var groups=[];
  		$q.all([ 
                // $q will keep the list of promises in a array
               	ContactService.contacts("keys="+id.toString()).query(),
                ContactService.alldeps("keys="+id.toString()).query(),
                 
                $http({ //初始化
                        method: 'GET',
                        url: "/indishare/addresstree.nsf/vwGroupBydepPath?readviewentries&restricttocategory=_"+id+"_"+"&rt="+$scope.context.userinfo.addresstree_timestamp
                })
        ]).then(function (results) {
              	$scope.concats = results[0];
              	$scope.childdeps=results[1];
                $scope.groups=[];
                var groupentry=x2js.xml_str2json(results[2].data).viewentries.viewentry;//获取部门群组
                if(typeof(groupentry)!="undefined"){
                    if(!groupentry.length){ //只有一个群组,变成数组格式统一处理
                       groupentry=[groupentry];
                    };
                    angular.forEach(groupentry,function(item){
                      $scope.groups.push(item.entrydata[0])
                    })
                }
              	if( type=="left"){//点击左边时刷新页签数组里的人员和子部门数据 
                  $scope.Slide2[currentIndex].groups=$scope.groups;
	                $scope.Slide2[currentIndex].concats=$scope.concats;
	                $scope.Slide2[currentIndex].childdeps=$scope.childdeps;
	                $ionicSlideBoxDelegate.$getByHandle('select').update();
	                $scope.release();
                  $scope.isAllChecked(); 
	                return;
              	}                           
              	$scope.depNodes=$scope.Slide2[currentIndex].childdeps;
                //点击右侧时如果是往下加一级追加页签，如果是点过的就修改数组               
                if($scope.Slide2.length==currentIndex+1){
                   	$scope.Slide2.push({
                            groups:$scope.groups,//添加群组
                            depNodes:$scope.depNodes,
                            concats:$scope.concats,
                            childdeps:$scope.childdeps//,
                    });
                }else{
                    $scope.Slide2[currentIndex+1].groups=$scope.groups;
                  	$scope.Slide2[currentIndex+1].concats=$scope.concats;
                  	$scope.Slide2[currentIndex+1].depNodes=$scope.depNodes;
                  	$scope.Slide2[currentIndex+1].childdeps=$scope.childdeps;
                }
              	$ionicSlideBoxDelegate.$getByHandle('select').update();
                setTimeout(function(){
                    $ionicSlideBoxDelegate.$getByHandle('select').next();
                    $scope.release();
                    $scope.isAllChecked(); 
                })    
           
            }); 
  }
  $scope.backFather=function(){//返回上级节点操作,先找父节点，再找到父节点的父节点，再找叔叔节点 
        $scope.checkedforAll.isAllChecked=false;
  	currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()
    var fatherslide={};
    if(currentIndex==0){
        ContactService.alldeps("search=[DepartmentCode]="+$scope.Slide2[0].depNodes[0].DepartmentCode).query(function(data){ 
          	var fatherid=data[0].ParentDepCode;
          	ContactService.alldeps("search=[DepartmentCode]="+data[0].ParentDepCode).query(function(data){
                ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){
                    fatherslide.depNodes=data;
                    fatherslide.childdeps=$scope.Slide2[0].depNodes;
                   
                    $q.all([ //选择节点下的直接人员和群组 
                        // $q will keep the list of promises in a array
                        ContactService.contacts("keys="+fatherid).query(),
                        $http({ //初始化
                                method: 'GET',
                                url: "/indishare/addresstree.nsf/vwGroupBydepPath?readviewentries&restricttocategory=_"+fatherid+"_",
                        })
                    ]).then(function(results){
                        fatherslide.concats=results[0];
                        fatherslide.groups=[];
                        var groupentry=x2js.xml_str2json(results[2].data).viewentries.viewentry;//获取部门群组
                        if(typeof(groupentry)!="undefined"){
                            if(!groupentry.length){ //只有一个群组,变成数组格式统一处理
                               groupentry=[groupentry];
                            };
                            angular.forEach(groupentry,function(item){
                              fatherslide.groups.push(item.entrydata)
                            })
                        }
                        $scope.Slide2.unshift(fatherslide);
                        $ionicSlideBoxDelegate.$getByHandle('select').update();              
                        setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').slide(1, [0])},5); 
                        setTimeout(function(){
                            $ionicSlideBoxDelegate.$getByHandle('select').previous();
                            if(!$scope.islocal){ $scope.checkedradio.names["radio"+$scope.Slide2[0].depNodes[0].ParentDepCode]=fatherid;}
                          $scope.release();
                          $scope.isAllChecked();
                        },200);  
                    })

                    /*ContactService.contacts("keys="+fatherid).query(function(data){     //选择节点下的直接人员  
                    	  fatherslide.concats=data;
                      	$scope.Slide2.unshift(fatherslide);
                      	$ionicSlideBoxDelegate.$getByHandle('select').update();              
                      	setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').slide(1, [0])},5); 
                      	setTimeout(function(){
                            $ionicSlideBoxDelegate.$getByHandle('select').previous();
                            if(!$scope.islocal){ $scope.checkedradio.names["radio"+$scope.Slide2[0].depNodes[0].ParentDepCode]=fatherid;}
                        	$scope.release();
                      	},200);  
                    }) */ 
              	})
          	})
      
        })
    }else{
      setTimeout(function(){
        $ionicSlideBoxDelegate.$getByHandle('select').previous()
        currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()
    $scope.release();
    $scope.isAllChecked();
    },200); 
    }
  }
 
   $scope.showchecked=function(data){//事件执行前，该checkbox状态已经确定了，这是确定后的操作,如果勾上加个人，没够上-个人
   
    if($scope.selected.names[data.split("/")[0]]){
      if($scope.prope.isSingle=='yes'){//如果是单选把之前选的都清掉
          $scope.selected = {names:{}};
          $scope.namelist=[];
          $scope.selected.names[data.split("/")[0]]=data;
      }
      if($scope.namelist.indexOf(data)<0){//没有才加上，有就不加了
               $scope.namelist.push(data);
      }
    }else{
      if($scope.namelist.indexOf(data)>=0){
              $scope.namelist.splice($scope.namelist.indexOf(data),1);
      }
    }

  }
   $scope.remove=function(data){//删除已选择的人员
    var k;
    if(data){
      $scope.selected.names[data.split("/")[0]]=false;
      $scope.showchecked(data);
    }else{
      for (k in $scope.selected.names){
        $scope.selected.names[k]=false;
          $scope.namelist=[];
      }
    }
  }
  $scope.release=function(){
  if($scope.Slide2[$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()].depNodes[0].DepartmentCode==1){
        $scope.isrootnode=true;
    }else{
      $scope.isrootnode=false;
    }
  }
   $scope.searchpeople=function(){ //人员快速搜索
      $scope.result=["null"];
      var searchkey=$scope.searchkey
      var patrn=/^[\x00-\xff]*$/;
           if(patrn.test(searchkey)){
              searchkey = '*' + searchkey + '*';
           }
      ContactService.contacts("search=FIELD%20Name%20CONTAINS%20"+searchkey).query(function(data){ 
        $scope.result=data;
       })
  }
  $scope.clearsearch=function(){
      $scope.searchkey="";
      $scope.result=[];
    }
   $scope.closePeople = function(data) {
    var filed=$scope.bindTo;
    if (data) {
    		eval($scope.bindTo+"=$scope.namelist");
        if($scope.namelist){
            ContactService.SaveRecentUser($scope.namelist.join("^")).success(function(status){
                console.log("保存到常用选择人:"+status);
            })
        }
    };
    
    $scope.remove();
    $scope.selectmodal.remove();  
  };

})
////////////////////////////////////////////////////////////////////////部门选择control
.controller('selectdepCtrl', function($q,$rootScope,$scope,$state,$stateParams,$ionicModal,$ionicSlideBoxDelegate,$ionicScrollDelegate,$ionicLoading,CONFIG, ContactService) {
  setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').enableSlide(false)})
  $scope.isrootnode=true;
  $scope.searchkey="";
  $scope.currentIndex=0;
  $scope.selected = {names:{}}; 
  $scope.namelist=[];
  $scope.codelist=[];
  $scope.ROOT=CONFIG.DOM_ROOT;
  $scope.checkedradio = {names:{}}; //记录radio部门选中状态,
  $scope.defaultimage=CONFIG.DOM_ROOT+"/indishare/addressbook.nsf/noimg.png";
  var currentIndex;
    if(eval($scope.bindTo)&&eval($scope.bindTo)[0]){
      var tmpbindTo=eval($scope.bindTo);
      var tmpbindTocode=eval($scope.bindTo+"code");
      if(typeof(eval($scope.bindTo))=="string"){
         tmpbindTo=tmpbindTo.split(",")
         tmpbindTocode=tmpbindTocode.split(",")
      }
      angular.forEach(tmpbindTo,function(item){
        if(item!="") { 
          $scope.namelist.push(item);
        };
      })
      angular.forEach(tmpbindTocode,function(item){
        if(item!="") { 
          $scope.codelist.push(item);
          $scope.selected.names[item]=$scope.namelist[$scope.codelist.indexOf(item)]
        };
      })
    }
  $scope.Slide2=[{}];
  var thisid 
  ContactService.alldeps("search=[DepartmentCode]="+$scope.context.userinfo.depId).query(function(data){//初始化当前部门及兄弟部门
        ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){
          $scope.checkedradio.names["radio"+data[0].ParentDepCode]=$scope.context.userinfo.depId;
            $scope.Slide2[0].depNodes=data;
            $scope.showChilds($scope.context.userinfo.depId,'left');
        })
  })  
  $scope.showChilds=function(id,type){
    currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex();
    $scope.islocal=false;
      $q.all([ 
                // $q will keep the list of promises in a array
               
                ContactService.alldeps("keys="+id.toString()).query(),
        ]).then(function (results) {
              $scope.childdeps=results[0];
                if( type=="left"){//点击左边时刷新页签数组里的人员和子部门数据 
               
                  $scope.Slide2[currentIndex].childdeps=$scope.childdeps;
                  $ionicSlideBoxDelegate.$getByHandle('select').update();
                  $scope.release();
                  return;
                }                           
                $scope.depNodes=$scope.Slide2[currentIndex].childdeps;
                //点击右侧时如果是往下加一级追加页签，如果是点过的就修改数组               
                if($scope.Slide2.length==currentIndex+1){
                    $scope.Slide2.push({depNodes:$scope.depNodes,
                      
                            childdeps:$scope.childdeps//,
                        }
                 );
                }else{
                   
                    $scope.Slide2[currentIndex+1].depNodes=$scope.depNodes;
                    $scope.Slide2[currentIndex+1].childdeps=$scope.childdeps;
                }
                $ionicSlideBoxDelegate.$getByHandle('select').update();
                setTimeout(function(){
                  $ionicSlideBoxDelegate.$getByHandle('select').next();
                  $scope.release();
                })
                 
           
            }); 
  }
  $scope.backFather=function(){//返回上级节点操作,先找父节点，再找到父节点的父节点，再找叔叔节点 
    currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()
    var fatherslide={};
    if(currentIndex==0){
        ContactService.alldeps("search=[DepartmentCode]="+$scope.Slide2[0].depNodes[0].DepartmentCode).query(function(data){ 
            var fatherid=data[0].ParentDepCode;
            ContactService.alldeps("search=[DepartmentCode]="+data[0].ParentDepCode).query(function(data){
                ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){
                    fatherslide.depNodes=data;
                    fatherslide.childdeps=$scope.Slide2[0].depNodes;
                    $scope.Slide2.unshift(fatherslide);
                    $ionicSlideBoxDelegate.$getByHandle('select').update();              
                    setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').slide(1, [0])},5); 
                    setTimeout(function(){
                        $ionicSlideBoxDelegate.$getByHandle('select').previous();
                        if(!$scope.islocal){ $scope.checkedradio.names["radio"+$scope.Slide2[0].depNodes[0].ParentDepCode]=fatherid;}
                      $scope.release();
                    },200);   
                })
            })
      
        })
    }else{
      setTimeout(function(){
        $ionicSlideBoxDelegate.$getByHandle('select').previous()
        currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()
    $scope.release();
    },200); 
    }
  }
 
  $scope.type=2;//1,单选2,多选
   $scope.showchecked=function(depcode){//事件执行前，该checkbox状态已经确定了，这是确定后的操作
   
    if($scope.selected.names[depcode]){
      if($scope.type==1){//如果是单选把之前选的都清掉
        var temp1=$scope.selected.names[depcode];
          $scope.selected = {names:{}};
          $scope.namelist=[];
          $scope.codelist=[];
          $scope.selected.names[depcode]=temp1;
      }
      $scope.namelist.push($scope.selected.names[depcode]);
      $scope.codelist.push(depcode);
    }else{
      var nth=$scope.codelist.indexOf(depcode)
      $scope.codelist.splice(nth,1);
      $scope.namelist.splice(nth,1);
     
    }
  }
   $scope.remove=function(index){//删除已选择的人员
    var k;
    if(typeof(index)!="undefined"){
      $scope.selected.names[$scope.codelist[index]]=false;
      $scope.showchecked($scope.codelist[index]);
    }else{
      for (k in $scope.selected.names){
        $scope.selected.names[k]=false;
          $scope.namelist=[];
          $scope.codelist=[];
      }
    }
  }
  $scope.release=function(){
  if($scope.Slide2[$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()].depNodes[0].DepartmentCode==1){
        $scope.isrootnode=true;
    }else{
      $scope.isrootnode=false;
    }
  
  }
   $scope.searchpeople=function(){ //人员快速搜索
      $scope.result=["null"];
      var searchkey=$scope.searchkey
      var patrn=/^[\x00-\xff]*$/;
           if(patrn.test(searchkey)){
              searchkey = '*' + searchkey + '*';
           }
      ContactService.contacts("search=FIELD%20Name%20CONTAINS%20"+searchkey).query(function(data){ 
        $scope.result=data;
       })
  }
  $scope.clearsearch=function(){
      $scope.searchkey="";
      $scope.result=[];
    }
   $scope.closePeople = function(data) {
    var filed=$scope.bindTo;
    if (data) {
    eval($scope.bindTo+"=$scope.namelist");
    eval($scope.bindTo+"code=$scope.codelist");
    };
    $scope.remove();
    $scope.selectmodal.remove();  
  };

})
////////////////////////////////////////////////////////////////////////部门选择control
.controller('selecthqdepCtrl', function($http,$q,$rootScope,$scope,$state,$stateParams,$ionicModal,$ionicSlideBoxDelegate,$ionicScrollDelegate,$ionicLoading,CONFIG, ContactService) {
  setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').enableSlide(false)})
  $scope.isrootnode=true;
  $scope.searchkey="";
  $scope.currentIndex=0;
  $scope.selected = {names:{}}; 
  $scope.namelist=[];
  $scope.codelist=[];
  $scope.ROOT=CONFIG.DOM_ROOT;
  $scope.checkedradio = {names:{}}; //记录radio部门选中状态,

  var currentIndex;
    if(eval($scope.bindTo)&&eval($scope.bindTo)[0]){
      var tmpbindTo=eval($scope.bindTo);
      var tmpbindTocode=eval($scope.bindTo+"code");
      if(typeof(eval($scope.bindTo))=="string"){
         tmpbindTo=tmpbindTo.split(",")
         tmpbindTocode=tmpbindTocode.split(",")
      }
      angular.forEach(tmpbindTo,function(item){
        if(item!="") { 
          $scope.namelist.push(item);
        };
      })
      angular.forEach(tmpbindTocode,function(item){
        if(item!="") { 
          $scope.codelist.push(item);
          $scope.selected.names[item]=$scope.namelist[$scope.codelist.indexOf(item)]
        };
      })
    }
  $scope.Slide2=[{}];
  var thisid 

  var depsurl="/indishare/gwpz.nsf/(agtGetAddrTree)?openagent&gwpz="+$scope.treetype+"&id="
  $http({ //初始化
        method: 'GET',
        url: depsurl+"1",
  }).success(function(data){
        $scope.checkedradio.names["radio0"]=1;
        $scope.Slide2[0].depNodes=[{DepName: data[0].text,DepartmentCode:data[0].id,ParentDepCode:0,FLDHASCHILD:data[0].hasChildren,truehasgwpz: data[0].hasgwpz}];
        $scope.showChilds(1,'left');
  })
  $scope.showChilds=function(id,type){
  
    currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex();
    $http({ //初始化
          method: 'GET',
          url: depsurl+id,
    }).success(function(data){
          if(!data[0].hasChildren &&  type=="right"){return}//没有子部门就不翻页了
          $scope.childdeps=[];
          angular.forEach(data[0].ChildNodes,function(item){
            $scope.childdeps.push({
                  DepName: item.text,
                  DepartmentCode:item.id,
                  ParentDepCode:id,
                  FLDHASCHILD:item.hasChildren,
                  hasgwpz: item.hasgwpz
            })
         })
         if( type=="left"){//点击左边时刷新页签数组里的人员和子部门数据 
                $scope.Slide2[currentIndex].childdeps=$scope.childdeps;
                $ionicSlideBoxDelegate.$getByHandle('select').update();
                $scope.release();
                return;
              }                           
              $scope.depNodes=$scope.Slide2[currentIndex].childdeps;
              //点击右侧时如果是往下加一级追加页签，如果是点过的就修改数组               
              if($scope.Slide2.length==currentIndex+1){
                  $scope.Slide2.push({depNodes:$scope.depNodes,
                          concats:$scope.concats,
                          childdeps:$scope.childdeps//,
                      }
               );
              }else{
                  $scope.Slide2[currentIndex+1].depNodes=$scope.depNodes;
                  $scope.Slide2[currentIndex+1].childdeps=$scope.childdeps;
              }
              $ionicSlideBoxDelegate.$getByHandle('select').update();
              setTimeout(function(){
                $ionicSlideBoxDelegate.$getByHandle('select').next();
                $scope.release();
          })
    })

  }
  $scope.backFather=function(){//返回上级节点操作,先找父节点，再找到父节点的父节点，再找叔叔节点 
    currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()
    var fatherslide={};
    if(currentIndex==0){
        ContactService.alldeps("search=[DepartmentCode]="+$scope.Slide2[0].depNodes[0].DepartmentCode).query(function(data){ 
            var fatherid=data[0].ParentDepCode;
            ContactService.alldeps("search=[DepartmentCode]="+data[0].ParentDepCode).query(function(data){
                ContactService.alldeps("keys="+data[0].ParentDepCode).query(function(data){
                    fatherslide.depNodes=data;
                    fatherslide.childdeps=$scope.Slide2[0].depNodes;
                    $scope.Slide2.unshift(fatherslide);
                        $ionicSlideBoxDelegate.$getByHandle('select').update();              
                        setTimeout(function(){$ionicSlideBoxDelegate.$getByHandle('select').slide(1, [0])},5); 
                        setTimeout(function(){
                            $ionicSlideBoxDelegate.$getByHandle('select').previous();
                            if(!$scope.islocal){ $scope.checkedradio.names["radio"+$scope.Slide2[0].depNodes[0].ParentDepCode]=fatherid;}
                          $scope.release();
                        },200);     
                })
            })
      
        })
    }else{
      setTimeout(function(){
        $ionicSlideBoxDelegate.$getByHandle('select').previous()
        currentIndex=$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()
    $scope.release();
    },200); 
    }
  }
 
  $scope.type=2;//1,单选2,多选
   $scope.showchecked=function(depcode){//事件执行前，该checkbox状态已经确定了，这是确定后的操作
   
    if($scope.selected.names[depcode]){
      if($scope.type==1){//如果是单选把之前选的都清掉
        var temp1=$scope.selected.names[depcode];
          $scope.selected = {names:{}};
          $scope.namelist=[];
          $scope.codelist=[];
          $scope.selected.names[depcode]=temp1;
      }
      $scope.namelist.push($scope.selected.names[depcode]);
      $scope.codelist.push(depcode);
    }else{
      var nth=$scope.codelist.indexOf(depcode)
      $scope.codelist.splice(nth,1);
      $scope.namelist.splice(nth,1);
     
    }
  }
   $scope.remove=function(index){//删除已选择的人员
    var k;
    if(typeof(index)!="undefined"){
      $scope.selected.names[$scope.codelist[index]]=false;
      $scope.showchecked($scope.codelist[index]);
    }else{
      for (k in $scope.selected.names){
        $scope.selected.names[k]=false;
          $scope.namelist=[];
          $scope.codelist=[];
      }
    }
  }
  $scope.release=function(){
  if($scope.Slide2[$ionicSlideBoxDelegate.$getByHandle('select').currentIndex()].depNodes[0].DepartmentCode==1){
        $scope.isrootnode=true;
    }else{
      $scope.isrootnode=false;
    }
  
  }
   $scope.searchpeople=function(){ //人员快速搜索
      $scope.result=["null"];
      var searchkey=$scope.searchkey
      var patrn=/^[\x00-\xff]*$/;
           if(patrn.test(searchkey)){
              searchkey = '*' + searchkey + '*';
           }
      ContactService.contacts("search=FIELD%20Name%20CONTAINS%20"+searchkey).query(function(data){ 
        $scope.result=data;
       })
  }
  $scope.clearsearch=function(){
      $scope.searchkey="";
      $scope.result=[];
    }
   $scope.closePeople = function(data) {
    var filed=$scope.bindTo;
    if (data) {
    eval($scope.bindTo+"=$scope.namelist");
    eval($scope.bindTo+"code=$scope.codelist");
    };
    $scope.remove();
     $scope.selectmodal.remove();  
  };
})