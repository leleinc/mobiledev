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
        wrapper.innerHTML = val;
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
            $node.attr("src",  UrlService.transform(baseURI + $node.attr("src")));
          }

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
             var $node = angular.element(node);
            var href = $node.attr("href");
            if(!href) return;
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
    $delegate[0].template = $delegate[0].template.replace('class="action-sheet-wrapper"','class="action-sheet-wrapper" ng-class="{\'activity-style\': activityStyle}"'); 
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
.directive('attView', function($rootScope,DocService,UrlService) {
  return {
      restrict: 'EA',
      // scope: {
      //   ref:"=ref",
      //   catnum:"=catnum"
      // },
      templateUrl: 'app/mail/attview.html',
      controller:function($scope,$ionicSlideBoxDelegate,$ionicScrollDelegate,$attrs,$state,$ionicLoading,$timeout,$element){  
             var  defpages=5;//默认显示页数
             $scope.statename = $state.current.name;
             $scope.attform = {};
             $scope.attform.attViewershow="attlist";
             console.log($attrs.catnum);
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
                    if(["doc","docx"].indexOf($scope.attform.thisattname.split(".")[1])<0){//其他的则用图片方式
                                $scope.attform.docViewerType = "img";
                    }
                    $scope.attform.pagecode=1;
                    $scope.attform.attViewershow="";//不显示列表
                            
                    if(catnum=="-1"){
                      $scope.attform.attisfj=false;
                    }else{
                      $scope.attform.attisfj=true;
                    }
                    // if(["txt"].indexOf($scope.attform.thisattname.split(".")[1])>=0){
                    //   $scope.attform.htmlsforshowcached[$scope.attform.thisattname]=[{"htmlURI":ref}];
                    //   $ionicSlideBoxDelegate.update();
                    //   $ionicSlideBoxDelegate.enableSlide(false);
                    //   $ionicScrollDelegate.resize();
                    //   return;
                    // }
                    if(["jpg","png","gif","bmp"].indexOf($scope.attform.thisattname.split(".")[1])>=0){
                      $scope.attform.docViewer={};

                      $scope.attform.docViewer.pagesforshow=[{"imgURI":UrlService.transform(ref)}];
                      $scope.attform.docViewer.pages=[{"imgURI":UrlService.transform(ref)}];
                      $ionicSlideBoxDelegate.update();
                      $ionicSlideBoxDelegate.enableSlide(false);
                      $ionicScrollDelegate.resize();
                      return;
                    }                    
                    $scope.attform.docViewer = DocService(ref, {}, function(){
                      $scope.attform.noMoreItemsAvailable = false;
                      if(!$scope.attform.htmlsforshowcached[$scope.attform.thisattname]&&["doc","docx"].indexOf($scope.attform.thisattname.split(".")[1])>=0){
                          $scope.attform.htmlsforshowcached[$scope.attform.thisattname]=[$scope.attform.docViewer.htmls[0]];
                      }
                      $scope.attform.docViewer.pagesforshow=[];//定义空内容的图片数组，翻页用
                     
                      for (var i = 0;i < defpages;i++) {
                              if($scope.attform.docViewer.pages[i]){
                                 $scope.attform.docViewer.pagesforshow.push($scope.attform.docViewer.pages[i]);
                              }        
                      };
                      $ionicSlideBoxDelegate.update();
                      $ionicSlideBoxDelegate.enableSlide(false);
                      $ionicScrollDelegate.resize();
                      // $ionicSlideBoxDelegate.slide(2);
                    });
              };  
            // $scope.$watch("ref", function(newVal, oldVal) {
            //       if (!newVal) return;
            //       var ref=newVal;
            //        $scope.attform.thisattname=ref.split("/")[ref.split("/").length-1] ;//附件名    
            //        $scope.attform.docViewer = DocService(newVal, {}, function(){
            //         $scope.attform.noMoreItemsAvailable = false;
            //           if(!$scope.attform.htmlsforshowcached[$scope.attform.thisattname]){
            //               $scope.attform.htmlsforshowcached[$scope.attform.thisattname]=[$scope.attform.docViewer.htmls[0]];
            //           }
            //           $ionicSlideBoxDelegate.update();
            //           $ionicSlideBoxDelegate.enableSlide(false);
            //           $ionicScrollDelegate.resize();    
            //         });
                 
            // });
           
            // $scope.$watch("catnum", function(newVal, oldVal) {
            //     if (!newVal) return;
            //     if(newVal=="-1"){
            //       $scope.attform.attisfj=false;
            //     }else{
            //       $scope.attform.attisfj=true;
            //     }
            // });
            var adding = false;
            var oldIndex = 0;
            $scope.addright = function(realmaxcode){                   
                  $scope.attform.docViewer.pagesforshow.push($scope.attform.docViewer.pages[realmaxcode]);
                  $ionicSlideBoxDelegate.update();
            }
            $scope.addleft = function(realmincode){
                      var ss=$ionicSlideBoxDelegate.currentIndex()
                      $scope.attform.docViewer.pagesforshow.splice(0,0,$scope.attform.docViewer.pages[realmincode-2]);
                      $ionicSlideBoxDelegate.update();
                      adding = true;
                      $ionicSlideBoxDelegate.slide(ss+1, [0]);//头部增加了一页坐标会变，又走回去，不用next有延时
                      $timeout(function(){
                            adding = false;
                      },200);
            }
            $scope.slideChanged = function(index){
                      if(adding) return;
                      $scope.attform.pagecode=$scope.attform.docViewer.pagesforshow[index].pagecode;             
                      var realmaxcode=$scope.attform.docViewer.pagesforshow[$scope.attform.docViewer.pagesforshow.length-1].pagecode;
                      var realmincode=$scope.attform.docViewer.pagesforshow[0].pagecode;
                      if(index > oldIndex && realmaxcode<$scope.attform.docViewer.pages.length){ //往前加
                              $timeout(function(){  
                                      $scope.addright(realmaxcode);
                              },200);
                      }else{      //往后加
                             $timeout(function(){
                                      if (realmincode>1) {
                                          $scope.addleft(realmincode);
                                      };
                            },200)
                      }
                      oldIndex = index;
                      $ionicSlideBoxDelegate.enableSlide(false);
                      [index-1, index+1].forEach(function(i){
                              var handle = $ionicScrollDelegate.$getByHandle("page"+i);
                              if(i>0 && i<$scope.attform.docViewer.pagesforshow.length){
                                handle.zoomTo(1);
                                handle.scrollTop();
                              }
                      });
              };
              
              $scope.pageOnScroll = function(index){
                  $ionicSlideBoxDelegate.enableSlide(false);
                  var max = $ionicScrollDelegate.$getByHandle("page"+index).getScrollView().__maxScrollLeft
                  var cur = $ionicScrollDelegate.$getByHandle("page"+index).getScrollPosition().left;
                  if(cur>=max || cur<=0){
                    $ionicSlideBoxDelegate.enableSlide(true);
                  }
              };
              $scope.showpagecode=function(index){
                  $scope.attform.showpagecode=true;
              }
              $scope.hidepagecode=function(index){
                  $timeout(function(){ 

                          $scope.attform.docViewer.pagesforshow=[];

                          $ionicSlideBoxDelegate.update();
                          $scope.attform.showpagecode=false;
                          $scope.attform.docViewer.pagesforshow.push($scope.attform.docViewer.pages[index-1]);
                          $timeout(function(){
                               $element[0].querySelector('ion-slide').style['-webkit-transform']='translate(0px, 0px) translateZ(0px)';
                               $timeout(function(){
                                    if(index<$scope.attform.docViewer.pages.length){
                                        $scope.addright($scope.attform.docViewer.pages[index-1].pagecode);
                                    }
                                    $timeout(function(){
                                        if(index>1){
                                            $scope.attform.docViewer.pagesforshow.splice(0,0,$scope.attform.docViewer.pages[index-2]);
                                            $ionicSlideBoxDelegate.slide(1, [50]);//头部增加了一页坐标会变，又走回去，不用next有延时 
                                        }                                       
                                    },200)
                              },100)    
                          },100)
                          $ionicSlideBoxDelegate.update();
                          $ionicSlideBoxDelegate.enableSlide(false);
                          $ionicScrollDelegate.resize();
                  },100)
                  $timeout(function(){
                   // $ionicSlideBoxDelegate.slide(1,[50]);
                  },200)

              }
              $scope.updatescroll=function(){
                  $ionicScrollDelegate.resize();
              }
              $scope.loadMoreHtml = function() {//下拉加载更多 
                        console.log("正在加载...");                  
                        $timeout(function(){
                           if($scope.attform.htmlsforshowcached[$scope.attform.thisattname]&&$scope.attform.docViewer.htmls[$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length]){
                                $scope.attform.htmlsforshowcached[$scope.attform.thisattname].push($scope.attform.docViewer.htmls[$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length])                                     
                            }
                        },10)
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        if($scope.attform.docViewerType == "img"||!$scope.attform.htmlsforshowcached[$scope.attform.thisattname]||$scope.attform.htmlsforshowcached[$scope.attform.thisattname].length>=$scope.attform.docViewer.htmls.length){
                          $scope.attform.noMoreItemsAvailable =true; 
                           console.log($scope.attform.noMoreItemsAvailable);
                          $scope.$broadcast('scroll.infiniteScrollComplete');                   
                        }
                              
               };  

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
              element.addClass('indi-fujian');
        }
      }
  }
})
.directive('range', function($timeout) {
  return {
      restrict: 'A',
      link:function(scope,element){

          rangeline=element;
          rangebutton=element[0].lastElementChild;
          rangeline.bind('touchstart',function(evt){
              if(evt.touches[0].clientX-rangebutton.offsetWidth/2>=rangeline[0].offsetLeft&&(rangeline[0].offsetLeft+rangeline[0].offsetWidth)>=(evt.touches[0].clientX+rangebutton.offsetWidth/2)){
                 rangebutton.style['left']=evt.touches[0].clientX-rangebutton.offsetWidth/2+'px';
              }
              console.log(scope.attform.pagecode);
          })
          rangeline.bind('touchmove',function(evt){
              if(evt.touches[0].clientX-rangebutton.offsetWidth/2>=rangeline[0].offsetLeft&&(rangeline[0].offsetLeft+rangeline[0].offsetWidth)>=(evt.touches[0].clientX+rangebutton.offsetWidth/2)){
                 rangebutton.style['left']=evt.touches[0].clientX-rangebutton.offsetWidth/2+'px';
              }
              
          })
          rangeline.bind('touchend',function(evt){
              console.log('end')
          })

      }
  }
})
   