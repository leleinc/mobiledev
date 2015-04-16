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