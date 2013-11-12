var fs = require('fs');
var util = require('util'); // to inspect objects

var str = "<!DOCTYPE html>httpversisdf skad<script text=jf l;skd<est=j fsdklj";
isbn='9999999';
var alertMsg=''
function checkResult(data){
  var testForXML = new RegExp(/^\<\?xml/);
  var testForScripts = new RegExp(/\<script/);
  var good = testForXML.test(data);
  var bad = testForScripts.test(data);
  if (bad===true){
    alertMsg='WARNING -- script tag found in response for ISBN '+isbn;
    return -1;
  }
  if (good===false){
    alertMsg='WARNING -- xml not returned for ISBN '+isbn;
    return -1;
  }
  return 0;
}

checkResult(str);
console.log(alertMsg);