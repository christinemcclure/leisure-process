// Modules
var fs = require('fs'),
  xml2js = require('xml2js');
var util = require('util'); // to inspect objects
var request = require('request');
var parser = {};
var moment = require('moment');// for date formatting
  moment().format();

// Variables
var debug2 = true;
var debug = false;
var logFile = './'+moment().format("YYYY-MM-DD")+'.log';
var isbn='';
var isbnFile = 'isbns-sample.txt';
var isbnsToProcess=[];
var key = process.env.OCLC_DEV_KEY;// store dev key in env variable for security
var url= '';
var jsonData = '';
var jsonString = "";
var jsonObj, testStr;
var datafieldObj, obj, prop;
var subjectArray=[], titleArray=[],summaryArray=[], testArr=[];

// From http://blog.4psa.com/the-callback-syndrome-in-node-js/
function series() {
    var callbackSeries =  
      [
        init, //  Create a log file of YYYY-MM-DD format. Delete any file if it exists
        processISBNFile,
          // Open ISBN file
          //  For each line of the file:
          //    - Split line into an array by spaces
          //    - Trim leading/trailing spaces from array[0]
          //    - Verify array[0] is a valid ISBN. If not valid, write to log file and go to next line.
          //    - Check to see if this ISBN is in the "to be processed" array. If not, add it.
        getAndProcessData
          //  For each element of the "to be processed" array:
          //    - Send API request to OCLC for that ISBN
          //    - Receive request. If error, write to log file        
      ];
 
    function next() {
        var callback = callbackSeries.shift();
        if (callback) {
            callback(next);
        }
        else {
            finish();
        }
    }
    next();
};

//    - Take only title, author, summary, ISBNs, and Subjects from the results
//    - Construct valid JSON object
//    - Append to output file
//    - Write success message to log file.
//    - Remove ISBN from array.
//
  



/// MAIN PROCESSING SECTION

series();
//collectXMLdata();
//sendRequest(9780670020836);

//// FUNCTIONS


function finish() { 
  logMsg('Processing complete');
  console.log('Finished processing. Check '+logFile+' for details.');
}

function getAndProcessData(callback){
  loopThroughISBNfile();
  setTimeout(function() { callback(); }, 100);
}

function loopThroughISBNfile(){
  for (var i=0; i<isbnsToProcess.length; i++){
    isbn=isbnsToProcess[i];
    var url = createURL(isbn);
    sendRequest(url);
  }
}


function collectXMLdata(){
  jsonString='';
  parser = new xml2js.Parser({attrkey : 'oclc'});
  parser.addListener('end', function(result) {
        jsonString = JSON.stringify(result);
        jsonObj = JSON.parse(jsonString);
        datafieldObj = jsonObj.record.datafield;
        i=0;
        for (var key in datafieldObj) {

          var titleStr='';

           obj = datafieldObj[key];
           for (prop in obj) {
              //check that it's not an inherited property
              if(obj.hasOwnProperty(prop)){

                getTitleAndAuthorInfo();

                collectAray('650',subjectArray);
                collectAray('520',summaryArray);
                if (debug){
                  console.log(util.inspect(datafieldObj, showHidden=true, depth=6, colorize=true));
                  console.log('  TITLE');
                  console.log(util.inspect(titleArray, showHidden=true, depth=6, colorize=true));
                  console.log('  SUMMARY ');
                  console.log(util.inspect(summaryArray, showHidden=true, depth=6, colorize=true));
                  console.log('  SUBJECTS ');
                  console.log(util.inspect(subjectArray, showHidden=true, depth=6, colorize=true));
                }

              }
           }
        }

  });
}

function getTitleAndAuthorInfo(){
  collectAray('245',titleArray);
  if (obj[prop]['tag']=='245'){ // find
      var typeA=obj['subfield'];
      if (typeA.length == 3){
        var titleStr = obj['subfield'][0]['_'] + ' ' + obj['subfield'][1]['_'];// get title and subtitle
        var authorStr = obj['subfield'][2]['_'];//
      }
      else {
        var titleStr = obj['subfield'][0]['_'];// otherwise only title
        var authorStr = obj['subfield'][1]['_'];
      }
      var exp = new RegExp(/ \/$/); // strip training ' /' from title
      titleStr = titleStr.replace(exp,'');
      exp = new RegExp(/.$/);
      authorStr = authorStr.replace(exp,'');
      if (debug2) console.log('***'+titleStr + '***'+ authorStr);
  }
}


function collectAray(tag,tmpArray){
  if (obj[prop]['tag']==tag){ // find
    if (debug) console.log('found a '+tag+' item.');
    i++;
    tmpArray[i]=obj['subfield'];
  }
}


function getTitle(){
  title=titleArray[1][0]._;

}

function sendRequest(url){
  request(url, function (error, response, xmlData) {
    if (!error && response.statusCode == 200) {
  //    console.log(xmlData);
      collectXMLdata();
      jsonData = parser.parseString(xmlData);
    }
  });
}


function createURL(isbn){
  url = 'http://www.worldcat.org/webservices/catalog/content/isbn/' + isbn + '?wskey='+key;
  // use oaiauth later
  url = encodeURI(url);// necessary?
  if(debug) console.log('url is '+url);
  return url;
}


function init(callback){
  fs.exists(logFile, function (exists) {
    if (exists){
      fs.unlink(logFile, function (error) {
        if (error) throw error;
        if (debug) console.log('successfully deleted log file before processing: ' + logFile);
      });
    }
    logMsg('Processing started. Using Input file name: '+isbnFile);
  });
  console.log(moment().format('YYYY-MM-DD HH:MM') + '\nProcessing started. Using ' + isbnFile + ' and writing messages to "'+ logFile +'".');
  setTimeout(function() { callback(); }, 100);
}


function processISBNFile(callback){
    fs.readFile(isbnFile, 'utf8', function(error, fileData) {
      // the data is passed to the callback in the second argument
      if(error){
        throw error;
      }
      //console.log('The file data is \n'+ fileData);
      var isbns=fileData.split('\n');
      var badISBNs=0;
      var dupeISBNs = 0;
      for (var i=0; i< isbns.length; i++){
        var isbnArr=isbns[i].split(' ');
        var tempISBN = isbnArr[0].trim().replace(/(\r\n|\n|\r)/gm,"");;// isbn will be first element in the array. Ignore spaces and line breaks
        var rt = checkISBN(tempISBN);
        if (rt==true){
          rt = checkIfInArray(isbnsToProcess,tempISBN);
          if (rt != true) {
            isbnsToProcess.push(tempISBN); // only add if not already in array
          }
          else {
            dupeISBNs += 1;
          }
          if (debug) console.log('here is the array of ISBNS to process '+isbnsToProcess.toString());
        }
        else{
          logMsg('"' +tempISBN + '" is not a valid ISBN');
          badISBNs += 1;
        }
      }
      logMsg('There were '+isbns.length+' lines in the file. '+ isbnsToProcess.length+' will be processed to collect bibliographic data. '+badISBNs +' did not contain a valid ISBN, and ' + dupeISBNs +' were duplicates.');
    });
  setTimeout(function() { callback(); }, 100);
 }

function logMsg(msg){
  var moment = require('moment');
  moment().format();
  var now = moment().format('YYYY-MM-DD HH:mm');
  fs.appendFile(logFile, now + ' ' + msg + '\n', function (error) {
    if (error) throw error;
  });
}

function checkISBN(isbn) {
// not a true validation, just ensuring that the split worked correctly
  var exp, ret;
  if  (isbn.length === 10) {
    exp = new RegExp(/\b(^\d{10}$|^\d{9}x)$\b/i); // ISBN-10 can be 10 digits, or 9 digits + x (checksum of 10)
    if (debug) console.log('the length of '+isbn +' is '+ isbn.length);
  }
  else if (isbn.length === 13){
    exp = new RegExp(/^978\d{10}$/); // ISBN-13 has different checksum logic. only digits
  }
  else {
    if (debug) console.log('"'+isbn+'" is a not valid isbn.');
    return false; // quick check for length
    //
  }
    ret=exp.test(isbn);
    if (debug) console.log('regex returns '+ret);
    return ret;
}

function checkIfInArray(arr, item){
  var flag = false;
  for (var i = 0; i < arr.length; i++){
    if (arr[i]==item){
      flag = true;
      break;
    }
  }
  return flag;
}
