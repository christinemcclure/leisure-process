var fs = require('fs');
var util = require('util'); // to inspect objects



fs.readFile('leisureBooksJSON.txt', 'utf-8',function (err, data) {
  if (err) throw err;
  console.log(data);
  var tempObj=JSON.parse(data);
  console.log(util.inspect(tempObj, showHidden=true, depth=8, colorize=true));
});



var testKey = process.env.OCLC_DEV_KEY;

function series2() {
    var callbackSeries =
      [
        func1, //  Create a log file of YYYY-MM-DD format. Delete any file if it exists
        func2
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

function func1(callback, parm1){
   parm1='asdfasf';
  console.log(parm1);
  setTimeout(function() {
    callback();
  }, 5000);
}


function func2(callback, parm2){
   parm2='22222';
  console.log(parm2);
  setTimeout(function() {
    callback();
  }, 100);
}

function finish(){
  console.log('done');
}


