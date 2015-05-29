angular.module('indiplatform.common.directive', [])
.directive('sdHtmlViewer', function (CONFIG,UrlService) {
  return {
    restrict: "EA",
    template: function(tElement, tAttrs){
      return '<div ng-include="template" class="html-viewer"></div>'
    },
    replace: true,
    scope: {
      ref: "=sdHtmlViewer",
      uri: "@"
    },
    controller: function($scope, $element, $attrs, $http, $templateCache) {

      var parseRaw = function(val) {
        var wrapper = document.createElement("div");
        wrapper.innerHTML = val.replace(/text-indent:/g,"");//去掉缩进
        var res = document.createElement("div");

        // 删除不需要的标签
        var remove = ["meta", "title", "style"];
        [].slice.call(wrapper.querySelectorAll(remove.join(","))).forEach(function(node) {
          try{
                      wrapper.removeChild(node);
          }catch(e){}

        });

        // if (wrapper.firstElementChild) {
        //     while (wrapper.firstElementChild) {
        //       res.appendChild(wrapper.firstElementChild);
        //     }
        // }else{
        //    if (wrapper.innerHTML!="") {
        //      res.innerHTML=wrapper.innerHTML;
        //    };         
        // };
       res.innerHTML=wrapper.innerHTML;

        // 处理图片
        [].slice.call(res.querySelectorAll("img")).forEach(function(node) {
          var $node = angular.element(node);
          $node.removeAttr("width").removeAttr("height").removeAttr("style");
          if ($scope.uri == "true") {
            var baseURI = $scope.ref.match(/^.*\//g);

            //$node.attr("src", baseURI + $node.attr("src"));
            $node.attr("ng-src",  UrlService.transform(baseURI + $node.attr("src")));
          }else{
            $node.attr("ng-src",  UrlService.transform($node.attr("src")));
          }

        });
     // 去掉table宽度
        [].slice.call(res.querySelectorAll("table")).forEach(function(node) {
          var $node = angular.element(node);
          $node.removeAttr("width").removeAttr("height").removeAttr("style");      
        });
        // 将链接转换为移动版格式
        [].slice.call(res.querySelectorAll("a")).forEach(function(node) {
          // var $node = angular.element(node);
          // var href = $node.attr("href");
          // if(!href) return;
          // var match = $node.attr("href").match(/http:\/\/mobiledev\.smartdot\.com(\/smartdotdev.*?\/)0\/(.*)\?opendocument/);
          //   if (match) {
          //     $node.attr("href","#/webflow" + match[1] + match[2]);
          //   }
            try{
                    var $node = angular.element(node);
                    var href = $node.attr("href");
                    if(!href||!href.split(".nsf/")[1]) return;
                    href = $node.attr("href").replace(/[\r\n]/g,"");
                    var localinfo = angular.fromJson(localStorage.getItem("uinfo"));
                    var appServer=localinfo.appServer;
                    var urlReg = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;  
                    var domain =urlReg.exec(href)[0]
                    var appName=href.split(domain)[1].split("/")[1];
                    if(domain.split(".")[1]!=appServer.split(".")[1]) return;//不是同域名不处理
                    var vw=href.split(".nsf/")[1].split("/")[0]
                    var regexp = new RegExp(domain.replace(new RegExp('\\.','gm'),'\\.')+'(/'+appName+'.*?/)'+vw+'/(.*)\\?(.*)pen(.*)ocument');
                    var match = href.match(regexp);
                    if (match) {
                      $node.attr("href",'#/webflow/' + domain + match[1] + match[2]);
                    }
                    else{
                        //域名不正确
                    }
             }catch(e){}
    
        });
        return res.innerHTML;
      };

      $scope.html = "";
      $scope.raw = "";

      if ($scope.uri == "true") {
        $scope.$watch("ref", function(newVal, oldVal) {
          if (!newVal) return;

          $http({
            method: "GET",
            url: newVal,
            cache: true
          }).success(function(data) {
            $scope.raw = data;
          });

        });
      } else {
        $scope.$watch("ref", function(newVal, oldVal) {
          if (!newVal) return;

          $scope.raw = newVal;
        });
      }

      $scope.$watch("raw", function(newVal, oldVal){
        if (!newVal) return;
        var templateId = "templateDocViewer"+Math.random().toString(16).substring(2)+".html"
        $templateCache.put(templateId, parseRaw(newVal));
        $scope.template = templateId;
      });

    }
  }
})

.config(function($provide) {
  // 修改actionSheet的样式
  $provide.decorator('ionActionSheetDirective', function($delegate,$rootScope) {
    var original = $delegate[0].compile;
    $delegate[0].compile = function(element, attrs, transclude) {
      var ret = original(element, attrs, transclude);
      return {
        pre :function($scope,element){
          if($scope.activityStyle){
            element.addClass("activity-style");
          }
          ret.apply(this,arguments);
        },
        post :function($scope){
        }
      };
    };
    return $delegate;
  });
})
.directive('selectpeople', function($rootScope,selectService) {
  return {
    restrict: 'A',
    template: function(scope, element, attrs, ctrl) {

      var bindid= element.bindid;
      var isSingle= element.$attr.single?"yes":"no";
      var index=element.index;
         $select=angular.element( '<i  class="icon ion-ios-plus-outline placeholder-icon" style="position:absolute;color: rgb(250,120, 0);z-index:100"></i>');  
         $element = angular.element(element.$$element.parent());
         $select[0].style["right"]="5%"
         $select[0].style["font-size"]="30px"
         $select[0].style["top"]="8px"
         $select.attr("ng-click", "selectPeople('"+bindid+"','"+isSingle+"')");
        return $select[0].outerHTML;
    },
    controller:function($scope){
      $scope.selectPeople = function(data,isSingle) {
          $scope.bindTo=data;
          $scope.prope={};
          $scope.prope.isSingle=isSingle;
          selectService.init('app/contact/select.html',$scope).then(function(modal) {
              modal.show();
          });
      };
    }
  }
})
.directive('selectdep', function($rootScope,selectService) {
  return {
    restrict: 'A',
    template: function(scope, element, attrs, ctrl) {
      var bindid= element.bindid;
      var treetype= element.treetype;
      var index=element.index;
         $select=angular.element( '<i  class="icon ion-ios-plus-outline placeholder-icon" style="position:absolute;color: rgb(250,120, 0);z-index:100"></i>');  
         $element = angular.element(element.$$element.parent());
         $select[0].style["right"]="5%"
         $select[0].style["font-size"]="30px"
         $select[0].style["top"]="8px"
         $select.attr("ng-click", "selectDep('"+bindid+"','"+treetype+"')" );
          return $select[0].outerHTML;
    },
    controller:function($scope){
      $scope.selectDep = function(data,treetype) {
        $scope.bindTo=data;
        var template='app/contact/selectdep.html';
        if(treetype!="" && treetype!="undefined"){
          template='app/contact/selecthqdep.html';
          $scope.treetype=treetype;
        }
        selectService.init(template,$scope).then(function(modal) {
            modal.show();
        });
      };
    }
  }
})
.directive('handAttitude', function($rootScope,$timeout) {
  return {
    restrict: 'EA',
    scope:true,
    templateUrl: 'app/webflow/handattitude.html',
    link:function(scope,element,attrs){

        var canvas =element.find("canvas")[0],
            canvas_hr =element.find("canvas")[1],
            ctx = canvas.getContext("2d"),
            ctx_hr = canvas_hr.getContext("2d"),
            painting = false,
            lastX = 0,
            lastY = 0,
            lineThickness = 1,
            canvasWrap=element.find("ion-content")[0],
            canvasToolBar=element.find("ion-footer-bar")[0]

        canvas.addEventListener('touchstart', startPaint, false);
        canvas.addEventListener('touchmove', continuePaint, false);
        canvas.addEventListener('touchend', stopPaint, false);
        //由于android键盘未关闭，会造成获取wrap的高度失败，在此加1s的延时
        $timeout(function(){
            if(canvasWrap&&canvasToolBar){
                canvas.height = canvasWrap.offsetHeight-canvasToolBar.offsetHeight-2
            }
            if(canvasWrap){
                canvas.width = canvasWrap.offsetWidth-2
            }
            //横屏
            canvas_hr.width=canvas.height;
            canvas_hr.height=canvas.width;
            ctx_hr.translate(canvas_hr.width / 2, canvas_hr.height / 2);    
            ctx_hr.rotate(-Math.PI / 2 );
        },1000);
        function startPaint(e) {
            painting = true;
            ctx.fillStyle = "#000000";
            lastX = e.touches[0].pageX - this.offsetLeft;
            lastY = e.touches[0].pageY - this.offsetTop;
            e.preventDefault();
        };

        function stopPaint(e){
            painting = false;
        }

        function continuePaint(e) {
            if (painting) {
                mouseX = e.touches[0].pageX - this.offsetLeft;
                mouseY = e.touches[0].pageY - this.offsetTop;

                // find all points between        
                var x1 = mouseX,
                    x2 = lastX,
                    y1 = mouseY,
                    y2 = lastY;


                var steep = (Math.abs(y2 - y1) > Math.abs(x2 - x1));
                if (steep){
                    var x = x1;
                    x1 = y1;
                    y1 = x;

                    var y = y2;
                    y2 = x2;
                    x2 = y;
                }
                if (x1 > x2) {
                    var x = x1;
                    x1 = x2;
                    x2 = x;

                    var y = y1;
                    y1 = y2;
                    y2 = y;
                }

                var dx = x2 - x1,
                    dy = Math.abs(y2 - y1),
                    error = 0,
                    de = dy / dx,
                    yStep = -1,
                    y = y1;
                
                if (y1 < y2) {
                    yStep = 1;
                }
               
                lineThickness = 5 - Math.sqrt((x2 - x1) *(x2-x1) + (y2 - y1) * (y2-y1))/10;
                if(lineThickness < 1){
                    lineThickness = 1;   
                }

                for (var x = x1; x < x2; x++) {
                    if (steep) {
                        ctx.fillRect(y, x, lineThickness , lineThickness );
                    } else {
                        ctx.fillRect(x, y, lineThickness , lineThickness );
                    }
                    
                    error += de;
                    if (error >= 0.5) {
                        y += yStep;
                        error -= 1.0;
                    }
                }

                lastX = mouseX;
                lastY = mouseY;

            }
        }

    }
  }
})
.directive('attView', function($rootScope,DocService,UrlService,$http) {
  return {
      restrict: 'EA',
      templateUrl: 'app/mail/attview.html',
      controller:function($scope,$ionicSlideBoxDelegate,$ionicScrollDelegate,$attrs,$state,$ionicLoading,$timeout,$element){  
             $element.append("<style>.attSlideWidth{width:"+$element[0].offsetWidth+"px}</style>")//slideg改变重画width造成闪烁，给个初始宽度
             var  defpages=15;//默认显示页数
             var  totalpages;//总页码

             $scope.statename = $state.current.name;
             $scope.attform = {};
               $scope.attform.handleid=$attrs.handleid
             $scope.attform.attViewershow="attlist";
             $scope.attform.htmlsforshowcached={};//将看过的附件cached下来，
            $scope.$watch($attrs.catnum, function(newVal, oldVal) {
                if (!newVal) return;
                if($attrs.catnum=="-1"){
                  $scope.openFile($scope.zwurl,"-1")
                }
            });
            $scope.$watch($attrs.flesh, function(newVal, oldVal) {//从正文切到附件或相反，返回后原版预览slidbox width会0，记个标记，update一下
                if (!newVal) return;
                $ionicSlideBoxDelegate.update();
                $ionicSlideBoxDelegate.enableSlide(false);
            });
            $scope.openFile = function(ref,catnum) {
                    if (!ref) {
                       $scope.attform.thisattname="" ;//附件名    
                        return;
                    }
                    $scope.attform.thisattname=ref.split("/")[ref.split("/").length-1] ;//附件名
                  
                    if(localStorage["fileShow"]&&localStorage["fileShow"]=="republishing"){//默认配置预览方式
                                $scope.attform.docViewerType = "reflow";
                    }else{
                                $scope.attform.docViewerType = "img";
                    }
                    if(["txt"].indexOf($scope.attform.thisattname.split(".")[1])>=0){//如果是txt重拍版方法
                                $scope.attform.docViewerType = "reflow";
                    }
                    if(["doc","docx","txt"].indexOf($scope.attform.thisattname.split(".")[1])<0){//其他的则用图片方式
                                $scope.attform.docViewerType = "img";
                    }
                    $scope.attform.pagecode=1;
                    $scope.attform.attViewershow="";//不显示列表
                    if(["jpg","png","gif","bmp"].indexOf($scope.attform.thisattname.split(".")[1])>=0){
                      $scope.attform.docViewer={};

                      $scope.attform.docViewer.pagesforshow=[{"imgURI":UrlService.transform(ref)}];
                      $scope.attform.docViewer.pages=[{"imgURI":UrlService.transform(ref)}];
                      $ionicSlideBoxDelegate.update();
                      $ionicSlideBoxDelegate.enableSlide(false);
                      $ionicScrollDelegate.resize();
                      return;
                    }             
                    $scope.attform.docViewer = DocService(ref, {filetype:$scope.attform.docViewerType=='reflow'?'html':'png'}, function(){

                      $scope.attform.initialized=true;
                      if( $scope.attform.docViewerType =="reflow"){

                            if(!$scope.attform.htmlsforshowcached[$scope.attform.thisattname]){
                                  $http({
                                    method: 'GET',
                                    url: $scope.attform.docViewer.htmls[0].htmlURI,
                                    timeout:60000
                                  }).then(function(result){
                                    $scope.attform.noMoreItemsAvailable = false;
                                    $scope.attform.htmlsforshowcached[$scope.attform.thisattname]=[{htmlURI:result.data}];
                                  })                              
                            }
                      }else{
                            totalpages=$scope.attform.docViewer.pages.length;
                            $scope.attform.docViewer.pagesforshow=fnpreSildeboxs(totalpages,1)//第一次进来画框框
                            angular.forEach([0,1],function(i){//加载当前页和预加载一页
                                if($scope.attform.docViewer.pages[i]){
                                  $scope.attform.docViewer.pagesforshow[i].imgURI=$scope.attform.docViewer.pages[i].imgURI;
                                }
                            })
                            $ionicSlideBoxDelegate.update();
                            $ionicSlideBoxDelegate.enableSlide(false);
                      }              
                      $ionicScrollDelegate.resize();
                    });
              };  
            $scope.$watch('attform.docViewerType', function(newVal, oldVal) {//切换时加载原声版或重拍版

                if (!newVal||!$scope.attform.initialized) return;
                if($scope.attform.docViewerType =="reflow"){
                    if(!$scope.attform.htmlsforshowcached[$scope.attform.thisattname]){//如果没有就是第一次加载
                               $http({
                                  method: 'GET',
                                  url: $scope.attform.docViewer.htmls[0].htmlURI,
                                  timeout:60000
                                }).then(function(result){
                                  console.log(result.data)
                                  $scope.attform.noMoreItemsAvailable = false;//第一次运行时loadmore会先将其置为true，放在回调里延迟处理
                                  $scope.attform.htmlsforshowcached[$scope.attform.thisattname]=[{htmlURI:result.data}];
                                  $ionicScrollDelegate.resize();     
                                })  
                    }
                    $scope.attform.noMoreItemsAvailable = false;
                }else{
                    if(!$scope.attform.docViewer.pagesforshow){//初始化原始版
                            totalpages=$scope.attform.docViewer.pages.length;
                            $scope.attform.docViewer.pagesforshow=fnpreSildeboxs(totalpages,1)//第一次进来画框框
                            $http({
                                   method: 'GET',
                                   url: $scope.attform.docViewer.pages[0].imgURI,
                                   timeout:60000
                            }).then(function(result){
                                   if(result.status == 200&& $scope.attform.docViewer.pagesforshow){
                                        angular.forEach([0,1],function(i){//加载当前页和预加载一页
                                              if($scope.attform.docViewer.pages[i]){
                                                $scope.attform.docViewer.pagesforshow[i]=$scope.attform.docViewer.pages[i];
                                              }
                                        }) 
                                        $ionicSlideBoxDelegate.update();
                                        $ionicSlideBoxDelegate.enableSlide(false); 

                                   }
                            }) 
                    }
                }    
            });
            var adding = false;
            var oldIndex ;
            var slideAarry 
            var fnpreSildeboxs=function(all,index){//返回区段内的slidebox数组
                 slideAarry=[];         
                  var statr=index%15==0?index-14:Math.floor(index/15)*15+1
                  var end=index%15==0?index:Math.floor(index/15)*15+15
                  end=end>all?all:end;
                  for(var i=statr;i<=end;i++){
                      slideAarry[i-statr]={pagecode:i}
                  }
                return slideAarry
            }
            $scope.setOldIndex=function(index){
              oldIndex = index;
            }
            $scope.addright = function(index){  

                      if($scope.attform.docViewer.pagesforshow[index+1]){//预加载下一页
                              $scope.attform.docViewer.pagesforshow[index+1].imgURI=$scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[index].pagecode].imgURI;
                      }else{//下一页没有，如果不是最后一页再加15页
                         if($scope.attform.docViewer.pagesforshow[index].pagecode<$scope.attform.docViewer.pages[totalpages-1].pagecode){
                              console.log("addright");
                              $scope.attform.docViewer.pagesforshow=$scope.attform.docViewer.pagesforshow.concat(fnpreSildeboxs(totalpages,$scope.attform.docViewer.pagesforshow[index].pagecode+1))
                              $http({
                                  method: 'GET',
                                  url: $scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[index].pagecode].imgURI,
                                  timeout:60000
                              }).then(function(result){
                                  if(result.status == 200){
                                    $scope.attform.docViewer.pagesforshow[index+1].imgURI=$scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[index].pagecode].imgURI;
                                    $ionicSlideBoxDelegate.update(); 
                                  }
                              })      
                         }

                      }
                      
            }
            $scope.addleft = function(index){
                      if($scope.attform.docViewer.pagesforshow[index-1]){//预加载前一页
                              console.log("预加载left")
                             
                              $scope.attform.docViewer.pagesforshow[index-1].imgURI=$scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[index-1].pagecode-1].imgURI;
                      }else{//上一页没有，如果不是第一页再加15页,临界点
                         if($scope.attform.docViewer.pagesforshow[index].pagecode>1){
                              console.log("发请求加载前面的");
                              adding = true;
                              var prel=fnpreSildeboxs(totalpages,$scope.attform.docViewer.pagesforshow[index].pagecode-1).length
                              $scope.attform.docViewer.pagesforshow=fnpreSildeboxs(totalpages,$scope.attform.docViewer.pagesforshow[index].pagecode-1).concat($scope.attform.docViewer.pagesforshow);
                             
                             $ionicSlideBoxDelegate.update();   
                             $timeout(function(){
                                  $ionicSlideBoxDelegate.slide(prel,[0]);
                             },200)            
                              $http({
                                  method: 'GET',
                                  url: $scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[prel-1].pagecode-1].imgURI,
                                  timeout:60000
                              }).then(function(result){
                                  adding = false;
                                  if(result.status == 200){
                                   //  console.log("请求返回加了第"+$scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[prel-1].pagecode-1].imgURI);
                                    $scope.attform.docViewer.pagesforshow[prel-1].imgURI=$scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[prel-1].pagecode-1].imgURI;
                                    $ionicSlideBoxDelegate.update(); 
                                  }
                              })      
                         }

                      }
            }
            $scope.slideChanged = function(index){
                       if(adding) return;
                                 console.log('slideChanged')
                       $scope.attform.pagecode=$scope.attform.docViewer.pagesforshow[index].pagecode;                             
                      if(!$scope.attform.docViewer.pagesforshow[index].imgURI){//直接跳到该页或临界点取消加载造成该页没有的情况               
                             $http({
                                   method: 'GET',
                                   url: $scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[index].pagecode-1].imgURI,
                                   timeout:60000
                               }).then(function(result){
                                   if(result.status == 200&& $scope.attform.docViewer.pagesforshow){
                                    $scope.attform.docViewer.pagesforshow[index].imgURI=$scope.attform.docViewer.pages[$scope.attform.docViewer.pagesforshow[index].pagecode-1].imgURI;
                                    $scope.addright(index);                               
                                    $scope.addleft(index);                              
                                    $ionicSlideBoxDelegate.update();                                    
                                   }
                               }) 
                      }else{
                           if(index>oldIndex){
                                $scope.addright(index);
                            }else{
                                $scope.addleft(index);
                            }   
                          $timeout(function(){                          
                            $ionicSlideBoxDelegate.update(); 
                          },50)
                      }
                      if($scope.attform.docViewer.pagesforshow[index-2]){ //只保留3页
                       $scope.attform.docViewer.pagesforshow[index-2]={pagecode:$scope.attform.docViewer.pagesforshow[index-2].pagecode}
         
                      }
                      if($scope.attform.docViewer.pagesforshow[index+2]){
                     $scope.attform.docViewer.pagesforshow[index+2]={pagecode:$scope.attform.docViewer.pagesforshow[index+2].pagecode}
              
                      }
                     $ionicSlideBoxDelegate.enableSlide(false);
                      [index-1, index+1].forEach(function(i){
                              var handle = $ionicScrollDelegate.$getByHandle("page"+i);
                              if(i>0 && i<$scope.attform.docViewer.pagesforshow.length){
                                $timeout(function(){
                                   handle.zoomTo(1);
                                   handle.scrollTop();
                                },250)
                              }
                      });         
              };
              
              $scope.pageOnScroll = function(index){
                  $ionicSlideBoxDelegate.enableSlide(false);
                  var max = $ionicScrollDelegate.$getByHandle("page"+index).getScrollView()&&$ionicScrollDelegate.$getByHandle("page"+index).getScrollView().__maxScrollLeft
                  var cur = $ionicScrollDelegate.$getByHandle("page"+index).getScrollPosition()&&$ionicScrollDelegate.$getByHandle("page"+index).getScrollPosition().left;
                  if(cur>=max || cur<=0 || !cur){
                    $ionicSlideBoxDelegate.enableSlide(true);
                  }
              };
              $scope.showpagecode=function(index){
                  $scope.attform.showpagecode=true;
              }
              $scope.hidepagecode=function(index){//快速跳转

                        $scope.attform.docViewer.pagesforshow=fnpreSildeboxs(totalpages,index);                     
                        $ionicSlideBoxDelegate.update();  
                        $ionicSlideBoxDelegate.slide(index%15==0?14:(index%15-1));  
                         $ionicSlideBoxDelegate.update();  
                        $scope.attform.showpagecode=false;
                        $ionicSlideBoxDelegate.enableSlide(false);
                        $ionicScrollDelegate.resize();


              }
              $scope.updatescroll=function(){
                  $ionicScrollDelegate.resize();
              }
              $scope.loadMoreHtml = function() {//下拉加载更多 
                        console.log("laodmore...");                    
                         if($scope.attform.htmlsforshowcached[$scope.attform.thisattname]&&$scope.attform.docViewer.htmls[$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length]){
                              $http({
                                method: 'GET',
                                url: $scope.attform.docViewer.htmls[$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length].htmlURI,
                                timeout:60000
                              }).then(function(result){
                                    $scope.attform.htmlsforshowcached[$scope.attform.thisattname].push({htmlURI:result.data});
                                    $timeout(function(){
                                       $scope.$broadcast('scroll.infiniteScrollComplete');
                                    },50)                                  
                              })  
                              //$scope.attform.htmlsforshowcached[$scope.attform.thisattname].push($scope.attform.docViewer.htmls[$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length])                                     
                          }
                        if($scope.attform.docViewerType == "img"||!$scope.attform.htmlsforshowcached[$scope.attform.thisattname]||$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length>=$scope.attform.docViewer.htmls.length){
                          $scope.attform.noMoreItemsAvailable =true; 
                          $scope.$broadcast('scroll.infiniteScrollComplete');                   
                        }
                              
               };  
               $scope.exit=function(){
                $ionicSlideBoxDelegate.select(0);//退出后会记录之前slidebox的位置，退出前置为第一页
                $scope.attform.docViewer={};
                $scope.attform.attViewershow='attlist';
                $scope.attform.docViewerType='';
                $scope.attform.initialized=false
               }

      }
  }
})
.directive('myTouch', function() {
    return {
        restrict: 'A',
        replace: true,
        link:function(scope,element,attrs){
            var initparam = {
                getStyle:function(ele,attr){
                    if(window.getComputedStyle){
                        return parseFloat(getComputedStyle(ele,null)[attr]);
                    }else{
                        return parseFloat(ele.currentStyle[attr]);
                    }
                }
            }
            element.bind('touchstart', function(event) {
                initparam.parentwidth = 
                    initparam.getStyle(element[0].parentNode,'width');//容器宽度，每次滑动都要计算（防止用户横竖屏切换）
                initparam.selfwidth = 
                    initparam.selfwidth === undefined ?
                    initparam.getStyle(element[0],'width') :
                    initparam.selfwidth;//表格自身宽度
                initparam.startpoi = event.touches[0].clientX;//开始滑动横坐标
            });
            element.bind('touchmove', function(event) {
                var movepoi = event.touches[0].clientX;
                var startpoi = initparam.startpoi;
                var moveX = movepoi - startpoi;//移动距离
                var parentwidth = initparam.parentwidth;
                var selfwidth = initparam.selfwidth;
                var currentLeft = initparam.getStyle(element[0],'left');//table当前left
                if(parentwidth < selfwidth && moveX > 0){//表格大于容器宽度并向右拖动
                    if(currentLeft < 0 && currentLeft + moveX < 0){
                        element[0].style['left'] = currentLeft + moveX + "px";
                        initparam.startpoi = movepoi;
                    }else{
                        element[0].style['left'] = "0";
                    }
                }else if(parentwidth < selfwidth && moveX < 0){//表格大于容器宽度并向左拖动
                    if(currentLeft + moveX > parentwidth - selfwidth){
                        element[0].style['left'] = currentLeft + moveX + "px";
                        initparam.startpoi = movepoi;
                    }else{
                        element[0].style['left'] = parentwidth - selfwidth  - 8 + "px";
                    }
                }
            });
            element.bind('touchend', function(event) {
                initparam.startpoi = undefined;
            });
        }
    }
})
.directive('showSelectPeople', function($rootScope) {
  return {
    restrict: 'A',
    template: function(scope, element, attrs, ctrl) {
//console.info(angular.element(element);
var source=element.selectedsource;
var selectDiv='<span ng-repeat="mitto in '+source+'"><span ng-show="$index>0">,</span><span >{{mitto|domUser}}</span></span>'
        return selectDiv;
    }
  }
})
.directive('clearInput', function($rootScope,$timeout,$window) {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope,element,attrs,ngModel) {
        ngModel = ngModel || {
            "$setViewValue" : angular.noop
        }
        var x=angular.element('<i  class="icon ion-ios-close-empty"></i>');  
        element.parent().after(x);
        $win = angular.element($window);
        $win.bind('resize',function(){
          resizex();
        })
        x.bind('click',function(e){
          ngModel.$setViewValue("");
          ngModel.$render();
        })
        var resizex=function(){
           $timeout(function(){
            x[0].style['left']=element.parent()[0].offsetLeft+element.parent()[0].offsetWidth-22+"px";
            x[0].style['position']="absolute";
            x[0].style['font-size']="30px";
            x[0].style['top']=element.parent()[0].offsetTop+(element.parent()[0].offsetHeight-x[0].offsetHeight)/2+"px";
            x[0].style['z-index']=111;
          },100)
        }
        resizex();
    }
  }
})
.directive('autoFocus', function($timeout) {
  return {
      restrict: 'A',
      link: function(scope,element) {
        // $timeout(function(){
        //     element[0].focus();
        // })
        element.bind('keypress',function(evt){
            if(evt.keyCode==13){
                element[0].blur();
            }
        })
      }
  }
})
.directive('attTubiao', function($timeout) {
  return {
      restrict: 'A',
      scope:{
        attTubiao:'='
      },
      link: function(scope,element) {
        if(['docx','doc'].indexOf(scope.attTubiao.split(".")[scope.attTubiao.split(".").length-1])>=0){
              element.addClass('indi-word');
              element[0].style.color='rgb(45, 167, 231)';
        }else if(['ppt','pptx'].indexOf(scope.attTubiao.split(".")[scope.attTubiao.split(".").length-1])>=0){
              element.addClass('indi-ppt');
              element[0].style.color='rgb(230, 30, 20)';
        }else if (['xls','xlsx'].indexOf(scope.attTubiao.split(".")[scope.attTubiao.split(".").length-1])>=0){
              element.addClass('indi-excel');
              element[0].style.color='rgb(69, 168, 54)';
        }else if(['pdf'].indexOf(scope.attTubiao.split(".")[scope.attTubiao.split(".").length-1])>=0){
              element.addClass('indi-pdf');
              element[0].style.color='rgb(237, 111, 26)';
        }
         else {
              element.addClass('indi-file');
        }
      }
  }
})
.directive('range', function($timeout) {
  var moving=false;
  var allpage;
  var perPageWidth;
  var finalPage;
  var rangeline;
  var rangebutton;
  var pageContianer
  return {
      restrict: 'A',
      require: '?ngModel',
      link:function(scope,element,attrs,ngModel){
          ngModel = ngModel || {
              "$setViewValue" : angular.noop
          }
          rangeline=element;
          rangebutton=element[0].lastElementChild; 
          // $timeout(function(){
          //    allpages=scope.attform.docViewer.pages.length;
          //     perPageWidth=(rangeline[0].offsetWidth-rangebutton.offsetWidth)/(allpages-1);
          //     pageContianer.style['width'] = (String(allpages).length + 1) * 15 + "px";
          //   },500)
          rangeline.bind('touchstart',function(evt){
              moving=true;
              allpages=scope.attform.docViewer.pages.length;
              perPageWidth=(rangeline[0].offsetWidth-rangebutton.offsetWidth)/(allpages-1);
          
              if(evt.touches[0].clientX-rangebutton.offsetWidth/2>=rangeline[0].offsetLeft&&(rangeline[0].offsetLeft+rangeline[0].offsetWidth)>=(evt.touches[0].clientX+rangebutton.offsetWidth/2)){
                 rangebutton.style['left']=evt.touches[0].clientX-rangebutton.offsetWidth/2+'px';
                 var reallength=evt.touches[0].clientX-rangebutton.offsetWidth/2-rangeline[0].offsetLeft;
                  ngModel.$setViewValue(Math.round(reallength/perPageWidth)+1);
                  finalPage=Math.round(reallength/perPageWidth)+1;
                  pageContianer.style['width'] = (String(allpages).length + String(finalPage).length) * 15 + "px";
                  ngModel.$render();
                  $timeout(function(){
                      scope.showpagecode(Math.round(reallength/perPageWidth)+1);
                  })
              }
 
          })
          rangeline.bind('touchmove',function(evt){
              moving=true;
              if(evt.touches[0].clientX-rangebutton.offsetWidth/2>=rangeline[0].offsetLeft&&(rangeline[0].offsetLeft+rangeline[0].offsetWidth)>=(evt.touches[0].clientX+rangebutton.offsetWidth/2)){
                 rangebutton.style['left']=evt.touches[0].clientX-rangebutton.offsetWidth/2+'px';

                  var reallength=evt.touches[0].clientX-rangebutton.offsetWidth/2-rangeline[0].offsetLeft;
                  perPageWidth=(rangeline[0].offsetWidth-rangebutton.offsetWidth)/(allpages-1);
                  ngModel.$setViewValue(Math.round(reallength/perPageWidth)+1);
                  ngModel.$render();
                  scope.showpagecode(Math.round(reallength/perPageWidth)+1);
                  finalPage=Math.round(reallength/perPageWidth)+1;
                  pageContianer.style['width'] = (String(allpages).length + String(finalPage).length) * 15 + "px";
              }
          })
          rangeline.bind('touchend',function(evt){
                  scope.hidepagecode(finalPage);
                  moving=false;
          })
   
      },
      controller:function($scope,$element,$attrs){
       $scope.$watch($attrs.pagecode,function(newVal,oldVal){
                  if(!newVal||moving||rangeline[0].offsetLeft==0) return;
                   pageContianer.style['width'] = (String(allpages).length + String(newVal).length) * 15 + "px";
                   perPageWidth=(rangeline[0].offsetWidth-rangebutton.offsetWidth)/(allpages-1);
                   rangebutton.style['left']=(newVal-1)*perPageWidth+rangeline[0].offsetLeft+"px";

        })
       $scope.$watch($attrs.pagecount,function(newVal,oldVal){
                  if(!newVal) return;
                  pageContianer= $element.parent()[0].lastElementChild;   
                  allpages=newVal;
                  pageContianer.style['width'] = (String(allpages).length + 1) * 15 + "px";
                  perPageWidth=(rangeline[0].offsetWidth-rangebutton.offsetWidth)/(allpages-1);
        })
      }
  }
})
.directive('yjShow', function (CONFIG,UrlService) {
  var yjdom;
return {
  restrict: "EA",
  template: function(cope, element, attrs, ctrl){
    return '<div ng-include="template" class="html-viewer"></div>'
  },
  controller: function($scope, $element, $attrs, $http, $templateCache,$timeout,$filter) {
          var templateId = "templateYjViewer"+Math.random().toString(16).substring(2)+".html"
          var res = document.createElement("div");
         $scope.$watch($attrs.yjShow,function(newVal,oldVal){
                  if(!newVal) return;
                    newVal.forEach(function(tb){//处理每个意见table
                           tb=angular.element(tb);
                           angular.forEach(tb.find('td'),function(i){
                               if(i.innerHTML.trim() == ""){
                                 if( i.parentNode.childNodes.length == 1){
                                   i.parentNode.remove();
                                 }
                                 i.remove();
                                }
                            })
                           angular.forEach(tb.find('a'),function(a){//处理附件和图片
                              if(a.attributes.href&&~a.attributes.href.value.indexOf('OpenMyFile')){
                                var yjurl=$scope.yjs.filter(function(yj){//从意见里找出匹配附件
                                  return yj.yjatt&&yj.yjatt.attname==a.attributes.title.value                         
                                })[0].yjatt.url
                                var attnode='<div  class="att" ng-click="openFile(\''+yjurl+'\',\'0\');attform.attViewershow=\'\'"><i class="icon" att-tubiao="\''+a.attributes.title.value+'\'" "></i><span class="ng-binding">'+a.attributes.title.value+'</span></div>'
                                a.parentNode.appendChild(angular.element(attnode)[0]);
                                a.remove();
                              }  
                              if(a.attributes.onclick&&~a.attributes.onclick.value.indexOf('$file')){

                                var imgpath=a.attributes.onclick.value.match(/"\/.*?"/)[0].split("\"")[1];
                                imgpath=UrlService.transform("http://"+$scope.fileinfo.domain+imgpath);
                                var attnode='<img  ng-src='+imgpath+'>'
                                  a.parentNode.appendChild(angular.element(attnode)[0]);
                                  a.remove();
                              }  
                          })
                          angular.forEach(tb[0].querySelectorAll(".userName"),function(span){//用户名
                                span.parentNode.style['padding-right']="5px";
                                span=angular.element(span);
                                span[0].innerHTML=$filter('domUser')(span[0].innerHTML)
                                span.after("<br>");

                          })
                          angular.forEach(tb.find('img'),function(img){////手签名
                              if(img.attributes.src&&img.attributes.src.value.indexOf('signature')>0){
                                  img=angular.element(img);
                                 img.attr('ng-src',UrlService.transform("http://"+$scope.fileinfo.domain+img.attr('src')));
                                 img.after("<br>");
                              }

                          })
                            
                          res.appendChild(tb[0]);
                    })
                    $templateCache.put(templateId, res.innerHTML);
                    $scope.template = templateId;
                
        })
   
  }
}
})