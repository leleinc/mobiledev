angular.module('indiplatform.common.filter', [])
.filter('domUser', function() {
  // 处理Domino用户名的显示，包含多值的处理
	return function(input) {
    return [].concat(input).map(function(str){
      str = str || "";
      return str.split("/")[0].replace("CN=","");
    }).join(",");
	};
})
.filter('list', function() {
  return function(input) {
    return [].concat(input).join(", ");
  };
})
/*
.filter('amCalendar2', function($filter){    
    var am = $filter('amCalendar');
    return function(){
    	var result = am.apply(this, arguments);
    	return result + "zz";
    }    
})
*/
.filter('escape2Html',function() {
    return function(str){
        str = (str instanceof String) ? str : str.toString();
        var arrEntities = {'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"','apos':"'"};
        return str.replace(/&(lt|gt|nbsp|amp|quot|apos);/ig,function(all,t){
            return arrEntities[t];
        });
    } 
})
.filter('removeEnter',function() {
    return function(str){
        str = (str instanceof String) ? str : str.toString();
        return str.replace(/\r?\n/g,"");
    } 
})
.filter('unique',function(){
    return function(input){
        var newArr=[],obj={};
        for(var i=0,len=input.length;i<len;i++){
            if(!obj[input[i]]){ 
                newArr.push(input[i]);
                obj[input[i]]=true;
            }
        }
        return newArr;
    }
})
.filter('filterUsrNameNumber',function(){ //
  return function (str){
	str = str || "";
    str = str.replace(/;|\^/g,",");
    var astrName = str.split(",");
    var strResult = "";
    for(var i=0;i<astrName.length;i++){
      var tmpName = astrName[i].replace(/(CN|OU|O|C)=/gi,"");
      strResult += (strResult==""?"":",") + (tmpName.split("/")[0].replace(/\d+$/g,''));
    }
    return strResult;
  }
})