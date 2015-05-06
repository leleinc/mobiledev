(function(angular){
    'use strict';

    var myModule = angular.module('DominoSoap', ['x2js']);

    myModule.factory('SoapService', function($http,x2js) {
      var noop = angular.noop,
        forEach = angular.forEach,
        extend = angular.extend,
        copy = angular.copy,
        isFunction = angular.isFunction;

      function shallowClearAndCopy(src, dst) {
        dst = dst || {};

        angular.forEach(dst, function(value, key) {
          delete dst[key];
        });

        for (var key in src) {
          if (src.hasOwnProperty(key) && !(key.charAt(0) === '$' && key.charAt(1) === '$')) {
            dst[key] = src[key];
          }
        }

        return dst;
      }

      function Resource(value) {
        shallowClearAndCopy(value || {}, this);
      }


      return {
        invoke : function(url,soapAction,data,config) {
          var httpConfig = {
                method: 'POST',
                url: url,
                headers: {
                    'SOAPAction' : soapAction
                },
                transformResponse: appendTransform($http.defaults.transformResponse,function(value,headers){
                    try{
                        return getSoapResult(value,x2js)
                    }catch(e){
                        e.config = {
                            url:url,
                            headers:headers
                        };
                        throw e;
                    }
                }),
                data: addSoapEnvelope(soapAction,data,"")
            };
            var promise = $http(httpConfig);
            return promise;
        },
        invokeSync : function(url,soapAction,data,config,success) {
            config = extend({}, config);
            success = success || noop;
            var httpConfig = {
                method: 'POST',
                url: url,
                headers: {
                    'SOAPAction' : soapAction
                },
                transformResponse: appendTransform($http.defaults.transformResponse,function(value){
                    return getSoapResult(value,x2js)
                }),
                data: addSoapEnvelope(soapAction,data,"")
            };
            var data;
            var value = config.isArray ? [] : new Resource(data);
            var promise = $http(httpConfig);

            promise = promise.then(
              function(response) {
                var value = (config.transformResponse || noop)(response.data, response.headers);
                response.data = value || response.data;
                return response;
              }
            );

            promise = promise.then(function(response){
              var data = response.data;
              if (data) {
                success(copy(data));
                if (config.isArray) {
                  value.length = 0;
                  forEach(data, function(item) {
                    if (typeof item === "object") {
                      value.push(new Resource(item));
                    } else {
                      // Valid JSON values may be string literals, and these should not be converted
                      // into objects. These items will not have access to the Resource prototype
                      // methods, but unfortunately there
                      value.push(item);
                    }
                  });
                } else {
                  shallowClearAndCopy(data, value);
                }
              }

              response.resource = value;

              return response;
            });            

            return value;
        }
      }
    });
    
    function _toString(src) {
        var ret = src;
        if (Array.isArray(src)) {
            ret = src.map(function(item) {
                return _toString(item);
            });
        } else if (src && src.constructor == Object) {
            var keys = Object.keys(src);
            for (var i = 0; i < keys.length; i++) {
                if(keys[i]==="__cdata") {
                    ret = src[keys[i]];
                    break;
                }else {
                    ret[keys[i]] = _toString(src[keys[i]]);
                }
            };
        }
        return ret;
    }

    function getSoapResult(value,x2js) {
        if(!value) return value;
        var parser=new DOMParser();
        var xmlDoc=parser.parseFromString(value,"text/xml");
        var fault = xmlDoc.querySelector("Body > Fault");
        if(fault){
            throw new Error(fault.textContent);
        }
        var strResult = xmlDoc.querySelector("Body > * > *").textContent;
        var firstStr = strResult.substr(0,1);
        if(firstStr === "<"){
            // return x2js.parseXmlString(strResult);
            
            var ret = x2js.xml_str2json(strResult);
            ret = _toString(ret);
            return ret;
        }else if(firstStr === "[" || firstStr === "{"){
            try{
                return angular.fromJson(strResult);
            }catch(e){
                return angular.fromJson(strResult.replace(/("[^"]*?"):\s*,/, '$1: "",'));
            }
        }else{
            return strResult;
        }
    }

    function appendTransform(defaults, transform) {
        // We can't guarantee that the default transformation is an array
        defaults = angular.isArray(defaults) ? defaults : [defaults];
        // Append the new transformation to the defaults
        return defaults.concat(transform);
    }
    function addSoapEnvelope(soapAction,parameter,namespace){
        var result =
        '<?xml version="1.0" encoding="utf-8"?>' +
            '<soap:Envelope ' +
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
            'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' +
            'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" ' +
            'xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">' +
            '<soap:Body>' +
            '<' + soapAction + ' xmlns="' + namespace + '">' +
            soapSerializeParameter(parameter) +
            '</' + soapAction + '></soap:Body></soap:Envelope>';
        return result;
    }

    function soapSerializeParameter(parameter){
        var result = '';
        switch(typeof(parameter))
        {
            case 'string':
                result += parameter.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');break; 
            case 'number':
            case 'boolean':
                result += parameter.toString(); break;
            case 'object':
                // Date
                if(parameter.constructor.toString().indexOf('function Date()') > -1)
                {

                    var year = parameter.getFullYear().toString();
                    var month = (parameter.getMonth() + 1).toString(); month = (month.length === 1) ? '0' + month : month;
                    var date = parameter.getDate().toString(); date = (date.length === 1) ? '0' + date : date;
                    var hours = parameter.getHours().toString(); hours = (hours.length === 1) ? '0' + hours : hours;
                    var minutes = parameter.getMinutes().toString(); minutes = (minutes.length === 1) ? '0' + minutes : minutes;
                    var seconds = parameter.getSeconds().toString(); seconds = (seconds.length === 1) ? '0' + seconds : seconds;
                    var milliseconds = parameter.getMilliseconds().toString();
                    var tzminutes = Math.abs(parameter.getTimezoneOffset());
                    var tzhours = 0;
                    while(tzminutes >= 60)
                    {
                        tzhours++;
                        tzminutes -= 60;
                    }
                    tzminutes = (tzminutes.toString().length === 1) ? '0' + tzminutes.toString() : tzminutes.toString();
                    tzhours = (tzhours.toString().length === 1) ? '0' + tzhours.toString() : tzhours.toString();
                    var timezone = ((parameter.getTimezoneOffset() < 0) ? '+' : '-') + tzhours + ':' + tzminutes;
                    result += year + '-' + month + '-' + date + 'T' + hours + ':' + minutes + ':' + seconds + '.' + milliseconds + timezone;
                }
                // Array
                else if(parameter.constructor.toString().indexOf('function Array()') > -1)
                {
                    for(var p in parameter)
                    {
                        if(!isNaN(p))   // linear array
                        {
                            (/function\s+(\w*)\s*\(/ig).exec(parameter[p].constructor.toString());
                            var type = RegExp.$1;
                            switch(type)
                            {
                                case '':
                                    type = typeof(parameter[p]);
                                /* falls through */
                                case 'String':
                                    type = 'string'; break;
                                case 'Number':
                                    type = 'int'; break;
                                case 'Boolean':
                                    type = 'bool'; break;
                                case 'Date':
                                    type = 'DateTime'; break;
                            }
                            result += '<' + type + '>' + soapSerializeParameter(parameter[p]) + '</' + type + '>';
                        }
                        else{
                            // associative array
                            result += '<' + p + '>' + soapSerializeParameter(parameter[p]) + '</' + p + '>';
                        }
                    }
                }
                // Object or custom function
                else{
                    for(var property in parameter){

                        if(property!="indiatts"){
                            result += '<' + property + '>' + soapSerializeParameter(parameter[property]) + '</' + property + '>';
                        }else{
                            result += parameter[property];
                        }
                        
                    }
                }
                break;
            default:
                break; // throw new Error(500, 'serviceInstance.soapSerializeParameter: type "' + typeof(o) + '" is not supported');
        }
        return result;
    };

}(angular));
