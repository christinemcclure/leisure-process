// Modules
var fs = require('fs'),
  xml2js = require('xml2js');
var util = require('util'); // to inspect objects
var request = require('request');
var parser = {};
var moment = require('moment');// for date formatting
  moment().format();

// Variables
var key = process.env.OCLC_DEV_KEY;// store dev key in env variable for security
var book = {};
var debug = false;
var debug2 = true; // for when working on a single function
var path = './';
var isbnFile = 'isbns-sample.txt';
var dataFile = 'leisureBooksJSON.txt';
var logFile = moment().format("YYYY-MM-DD")+'.log';
var isbnsToProcess=[]; // used for lfow control
var isbn=''; // used between request and listener
var url= ''; // used between request and listener
var obj, prop; //used between data retrieval from OCLC json object
var summaryMsg =''; // used between processISBNfile and finishFile
var countLoop=0; // used to flag end of isbn array

// From http://blog.4psa.com/the-callback-syndrome-in-node-js/

// controlled order of processing
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
          //    - Take only title, author, summary, ISBNs, and Subjects from the results
          //    - Construct valid JSON object
          //    - Append to output file
          //    - Write success message to log file.
      ];
 
    function next() {
        var callback = callbackSeries.shift();
        if (callback) {
            callback(next);
        }

    }
    next();
};


/// MAIN PROCESSING SECTION

series();


////FUNCTIONS

function getSubjectsInfo(obj){
  var j=0;
  var tmp={};
  var subArr=[];
  for (var i=0; i<obj.length; i++){
      if (typeof obj[i]==['undefined']){// remove blank elements from the array of ojbjects
        continue;
      }
      else{
        j++;
        tmp[j]=obj[i];
      }
  }
  if (debug2) console.log(util.inspect(tmp, showHidden=true, depth=6, colorize=true)+'\n***\n');

var tmp2=[];

        for (var key in tmp) {
          i=0;
           var obj = tmp[key];
           for (var prop in obj) {
              //check that it's not an inherited property
              if(obj.hasOwnProperty(prop)){
                i++;
                console.log(' '+'obj = '+obj + ' key = '+key +' prop = '+prop)
                
              }
           }
        }
tmp2=tmp[1][0]['_'];
  if (debug2) console.log(util.inspect(tmp2, showHidden=true, depth=6, colorize=true));

  if (debug2) console.log(typeof tmp + ' ' + typeof tmp2);
}

function getSummaryInfo(){
  var summaryArray=[];
//  collectAray('520',summaryArray);
  var summaryStr = obj['subfield'][0]['_'];
  summaryStr = summaryStr.trim();
  if (debug) console.log(summaryStr);
  book['summary']=summaryStr;
}



function collectXMLdata(isbn){
  var jsonString, datafieldObj;
  parser = new xml2js.Parser({attrkey : 'oclc'});
  parser.addListener('end', function(result) {
        var subjectsObj=[];
        jsonString = JSON.stringify(result);
        var jsonObj = JSON.parse(jsonString);
        datafieldObj = jsonObj.record.datafield;
        var i=0;
        countLoop++;
        for (var key in datafieldObj) {

           obj = datafieldObj[key];
           for (prop in obj) {
              //check that it's not an inherited property
              if(obj.hasOwnProperty(prop)){
                i++;
                if (obj[prop]['tag']=='245'){
                  getTitleAndAuthorInfo();
                }
                if (obj[prop]['tag']=='520'){
                  getSummaryInfo();
                }
                if (obj[prop]['tag']=='650'){
                    subjectsObj[i] = obj['subfield'];
                }
              }
           }
        }

    getSubjectsInfo(subjectsObj);

    if (debug) console.log('i is '+i+' length is '+isbnsToProcess.length + ' count is '+countLoop);

    if (countLoop==isbnsToProcess.length){
        finishFile(function(){
          validateDataFile();
        });
    }
    else{
    logMsg(book.isbn + ' was process successfully.');
      fs.appendFile(path+dataFile, JSON.stringify(book)+',\n', function (error) {
        if (error) throw error;
      });
    }
  });
}




function getSummaryInfo(){
  var summaryArray=[];
//  collectAray('520',summaryArray);
  var summaryStr = obj['subfield'][0]['_'];
  summaryStr = summaryStr.trim();
  if (debug) console.log(summaryStr);
  book['summary']=summaryStr;
}


function validateDataFile(){
  var data, tmpObj;
  fs.readFile(path+dataFile, 'utf-8',function (err, data) {
    if (err) throw err;

    try{
     tmpObj=JSON.parse(data);
     logMsg(path+dataFile + ' has been verified as valid JSON.')
    }
    catch(e){
     console.log('An error has occurred: '+e.message)
    }
  });
}



function getAndProcessData(callback){
  loopThroughISBNfile();
  setTimeout(function() { callback(); }, 100);
}

function loopThroughISBNfile(){
  for (var i=0; i<isbnsToProcess.length; i++){
    isbn=isbnsToProcess[i];
    var url = createURL(isbn);
    sendRequest(url, isbn, function(){
    });
  }
}

function finishFile(callback){
        fs.appendFile(path+dataFile, JSON.stringify(book)+'\n]\n}', function (error) {
        if (error) throw error;
        logMsg(book.isbn + ' was process successfully.');
        logMsg('Processing complete');
        logMsg(summaryMsg);
        console.log('Finished processing. Check '+logFile+' for details.');
      });
      setTimeout(function() { callback(); }, 100);
}

function getTitleAndAuthorInfo(){
  var titleArray=[];
//  collectAray('245',titleArray);
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
  book['title']=titleStr;
  book['author']=authorStr;
  if (debug) console.log(util.inspect(book, showHidden=true, depth=6, colorize=true));
  
}


function sendRequest(url, isbn, callback){
  request(url, function (error, response, xmlData) {
    if (!error && response.statusCode == 200) {
      book = new Object;
      book['isbn']=isbn;
      collectXMLdata(isbn);
      jsonData = parser.parseString(xmlData);
    }
  });
  callback(isbn);
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
  fs.exists(path+dataFile, function (exists) {
    if (exists){
      fs.unlink(path+dataFile, function (error) {
        if (error) throw error;
      });
    }
    fs.appendFile(path+dataFile, '{"leisureBooks":[\n', function (error) {
      if (error) throw error;
    });
  });
  console.log(moment().format('YYYY-MM-DD HH:MM') + 
    '\nProcessing started.'+
    '\n  Input file: \"' + isbnFile +
    '\"\n  Log file: \"' + logFile +
    '\"\n  JSON file created: \"' +dataFile + '\"');
  setTimeout(function() { callback(); }, 100);

}


function processISBNFile(callback){
    fs.readFile(path+isbnFile, 'utf8', function(error, fileData) {
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
        summaryMsg ='There were '+isbns.length+' lines in the file. '+ isbnsToProcess.length+' were processed to collect bibliographic data. '+badISBNs +' did not contain a valid ISBN, and ' + dupeISBNs +' were duplicates.';

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
