// Modules
var fs = require('fs'),
  xml2js = require('xml2js');
var util = require('util'); // to inspect objects



// Variables
var debug = true;
var moment = require('moment');
moment().format();
var logFile = './'+moment().format("YYYY-MM-DD")+'.log';
var isbnFile = 'isbns-sample.txt';
var isbnsToProcess=[];

//  Create a log file of YYYY-MM-DD format. Delete any file if it exists


// From http://blog.4psa.com/the-callback-syndrome-in-node-js/
function series() {
    var callbackSeries =  
      [
        init,
        processISBNFile
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

 
  //
//  Open ISBN file
//  For each line of the file:
//    - Split line into an array by spaces
//    - Trim leading/trailing spaces from array[0]
//    - Verify array[0] is a valid ISBN. If not valid, write to log file and go to next line.
//    - Check to see if this ISBN is in the "to be processed" array. If not, add it.
//  For each element of the "to be processed" array:
//    - Send API request to OCLC for that ISBN
//    - Receive request. If error, write to log file
//    - Take only title, author, summary, ISBNs, and Subjects from the results
//    - Construct valid JSON object
//    - Append to output file
//    - Write success message to log file.
//    - Remove ISBN from array.
//
  



/// MAIN PROCESSING SECTION

series();


//// FUNCTIONS


function finish() { 
  logMsg('Processing complete');
  console.log('Finished processing. Check '+logFile+' for details.'); 
}


function init(callback){
  fs.exists(logFile, function (exists) {
    if (exists){
      fs.unlink(logFile, function (error) {
        if (error) throw error;
        if (debug) console.log('successfully deleted log file before processing: ' + logFile + '\n');
      });
    }
    logMsg('Processing started. Using Input file name: '+isbnFile);
  });
  console.log('\n'+ moment().format('YYYY-MM-DD HH:MM') + '\nProcessing started. Using ' + isbnFile + ' and writing messages to "'+ logFile +'".\n');
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
      var badISBNs = 0;
      for (var i=0; i< isbns.length; i++){
        var isbnArr=isbns[i].split(' ');
        var tempISBN = isbnArr[0].trim().replace(/(\r\n|\n|\r)/gm,"");;// isbn will be first element in the array. Ignore spaces and line breaks
        var rt = checkISBN(tempISBN);
        if (rt==true){
          rt = checkIfInArray(isbnsToProcess,tempISBN);
          if (rt != true) isbnsToProcess.push(tempISBN); // only add if not already in array
          if (debug) console.log('here is the array of ISBNS to process '+isbnsToProcess.toString());
        }
        else{
          logMsg('"' +tempISBN + '" is not a valid ISBN');
          badISBNs += 1;
        }
      }
      logMsg('There were '+isbns.length+' lines in the file. '+badISBNs +' did not contain a valid ISBN.');
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