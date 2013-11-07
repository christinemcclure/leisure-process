//Logic
//  Open file (use only ISBN column of spreadsheet)
//  Read line
//  Split into array by space
//  Ensure alpha-numeric only (hyphens are added in display logic)
//  Check if ISBN is in processed array (skip duplicates)
//  Get OCLC record from WorldCat Search API by ISBN
//  Check for bad data
//  Convert to JSON
//  Write to file
//  Add ISBN to processed array
//  Get next line
//  Use OAuth and delete dev kep from GitHub history

var fs = require('fs'),
  xml2js = require('xml2js');
var util = require('util'); // to inspect objects
var readline = require('readline');
var prompt = require('prompt');
var fileName;
var isbn='';

var jsonData = '';

var jsonString = "";
var jsonObj;
var datafieldObj, obj, prop;
var tempArr=[];
var subjectArray=[], titleArray=[],summaryArray=[];
var i, j;
var textFiles=[];
var func = require('./functions.js');
var isbnsToProcess=[];
//var vars = require('./vars.js');
//var logFile = vars.logFile;
//var isbnFile = vars.isbnFile;
//var parserPrefix = 'oclc';
//var parser = new xml2js.Parser({attrkey : parserPrefix});


exports.processISBNFile = function(file){
    var debug=false;
    fs.readFile(file, 'utf8', function(error, data) {
      // the data is passed to the callback in the second argument
      if(error){
        throw error;
      }
      var fileData = data;
      //console.log('The file data is \n'+ fileData);
      var isbns=fileData.split('\n');

      for (var i=0; i< isbns.length; i++){
        var isbnArr=isbns[i].split(' ');
        var tempISBN = isbnArr[0].trim();// isbn will be first element in the array
        if (debug) console.log('\n Element '+ i +' of the array= "'+tempISBN+'"\n');
        var rt = func.checkISBN(tempISBN);
        if (debug) console.log('\nrt from check ISBN='+rt+'\n');
        if (rt==true){
          rt = func.checkIfInArray(isbnsToProcess,tempISBN);
          if (rt != true) isbnsToProcess.push(tempISBN); // only add if not already in array
        }
      }
      if (debug) console.log('ISBNs to process: '+isbnsToProcess.toString());
    });
 }


function collectAray(tag,tmpArray){
  var debug=false;
  if (obj[prop]['tag']==tag){ // find
    if (debug) console.log('found a '+tag+' item \n.');
    i++;
    tmpArray[i]=obj['subfield'];
  }
}
function init(processFile, logFile){
//  var debug=true;
//  if (debug) console.log('Started processing\n');
//  if (!logFile) logFile='test.txt';
//  listFiles();
//  getInput();
  startParser();
  func.startLogging();
//  func.readISBNFile(isbnFile);
//  func.sendRequest();
}


function startParser (){
  parser.addListener('end', function(result) {
        var debug=true;
        jsonString = JSON.stringify(result);
        jsonObj = JSON.parse(jsonString);
        datafieldObj = jsonObj.record.datafield;
        i=0;
        for (var key in datafieldObj) {
           obj = datafieldObj[key];
           for (prop in obj) {
              //check that it's not an inherited property
              if(obj.hasOwnProperty(prop)){
                collectAray('650',subjectArray);
                collectAray('245',titleArray);
                collectAray('520',summaryArray);
                if (debug){
                  console.log(util.inspect(datafieldObj, showHidden=true, depth=6, colorize=true));
                  console.log('\n  TITLR \n');
                  console.log(util.inspect(titleArray, showHidden=true, depth=6, colorize=true));
                  console.log('\n  SUMMARY \n');
                  console.log(util.inspect(summaryArray, showHidden=true, depth=6, colorize=true));
                  console.log('\n  SUBJECTS \n');
                  console.log(util.inspect(subjectArray, showHidden=true, depth=6, colorize=true));
                }
              }
           }
        }
  });
}
init();

// errors here readISBNFile(fileName);
