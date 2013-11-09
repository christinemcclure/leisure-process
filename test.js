var testKey = process.env.OCLC_DEV_KEY;

console.log(testKey);
series2();

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