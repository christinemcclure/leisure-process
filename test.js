var fs = require('fs');
var util = require('util'); // to inspect objects



var test={};
test[0]=[];
test[1]=[];
test[0][0]='aaa';
test[0][1]='bbb';
test[1][0]='ccc';


console.log(util.inspect(test, showHidden=true, depth=6, colorize=true));
console.log(typeof test);
