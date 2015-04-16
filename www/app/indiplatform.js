angular.module('indiplatform', [
  'ionic', 
  'DominoSoap',
  'x2js',
  'ngCordova',
  'indiplatform.common', 
  'indiplatform.workspace', 
  'indiplatform.todo', 
  'indiplatform.webflow', 
  'indiplatform.mail', 
  'indiplatform.contact',
  'indiplatform.new',
  'indiplatform.search',
  'indiplatform.setup'
]).value("CONFIG", {
	"DOM_ROOT": "/_api",
  "APP_NAME":"Indi.Mobile"
});