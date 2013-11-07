var fs = require('fs'),
  xml2js = require('xml2js');
var main = require('./index.js');
var moment = require('moment');
var request = require('request');
var moment = require('moment');

var parserPrefix = 'oclc';
var key = process.env.OCLC_DEV_KEY;
var logFile = './'+moment().format("YYYY-MM-DD")+'.log';
var isbnFile = 'isbns-sample.txt';
var parserPrefix = 'oclc';
var url;

exports.startLogging = function(){
  var debug=true;
  fs.exists(logFile, function (exists) {
    if (exists){
      fs.unlink(logFile, function (error) {
        if (error) throw error;
        if (debug) console.log('successfully deleted log file before processing: ' + logFile + '\n');
      });
    }
    exports.logMsg('Processing started. Using Input file name: '+isbnFile);
  });
}

// From howtonode.org
// You call async functions like this.
//someAsyncFunction(param1, param2, callback);

// And define your callback like this
//function callback(err, result) {...}

// but can you have a callback functio that takes parameters?

exports.logMsg = function(msg){
  var now = moment().format('YYYY-MM-DD HH:mm');
  fs.appendFile(logFile, now + ' ' + msg + '\n', function (error) {
    if (error) throw error;
  });
}


exports.checkISBN = function(isbn) {
// not a true validation, just ensuring that the split worked correctly
  var exp, ret;
  var debug = false; // set to true to do additional logging
  if  (isbn.length === 10) {
    exp = new RegExp(/\b(^\d{10}$|^\d{9}x)$\b/i); // ISBN-10 can be 10 digits, or 9 digits + x (checksum of 10)
    if (debug) console.log('\n the length of '+isbn +' is '+ isbn.length +'\n');
  }
  else if (isbn.length === 13){
    exp = new RegExp(/^978\d{10}$/); // ISBN-13 has different checksum logic. only digits
  }
  else {
    console.log('\n"'+isbn+'" is a not valid isbn. \n');
    return false; // quick check for length
    //
  }
    ret=exp.test(isbn);
    if (debug) console.log('\n regex returns '+ret +'\n');
    return ret;
}


exports.readISBNFile = function (fileName){
  fs.exists(fileName, function(exists) {
  if (exists) {
    var rt=main.processISBNFile(fileName);
  }
  else {
    console.log(fileName + ' file not found.');
  }
  });
}


exports.getInput = function (){
  prompt.start();
  prompt.get({
      name: 'file',
      required: true
    }, function (err, result) {
    fileName=textFiles[result.file];
    console.log('\n\n Processing file # ' + result.file + ': '+fileName+'\n');
    prompt.pause();
  });

}

exports.listFiles = function(){
  fs.readdir('./', function (error, files) { // '/' denotes the root folder
    if (error) throw error;
    var debug=true;
    var exp = new RegExp (/.txt$/);
    var rc;
    var i=0;
     console.log('\n\nEnter number of the file to process: \n');
     files.forEach( function (file) {
       rc=exp.test(file);
       if (rc===true){
        i++;
        textFiles[i]=file;
        if (debug) console.log('     ' +i + '.) - '+textFiles[i]+'\n');
       }
     });

  });
}


exports.createURL = function(isbn){
  var debug=true;
  if (!isbn){ // while testing and not processing a file
    isbn='9780439023481';
  }
  url = 'http://www.worldcat.org/webservices/catalog/content/isbn/' + isbn + '?wskey='+key;
  // use oaiauth later
  url = encodeURI(url);// necessary?
  if(debug) console.log('url is '+url+'\n');
  return url;
}



exports.sendRequest = function(url){
  url = exports.createURL();
  request(url, function (error, response, xmlData) {
    if (!error && response.statusCode == 200) {
  //    console.log(xmlData);
      jsonData = parser.parseString(xmlData);
    }
  })
}


exports.checkIfInArray = function(arr, item){
  var flag = false;
  for (var i = 0; i < arr.length; i++){
    if (arr[i]==item){
      flag = true;
      break;
    }
  }
  return flag;
}
