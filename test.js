var fs = require('fs');
var util = require('util'); // to inspect objects



var test={};
test[0]=[];
test[1]=[];
test[0][0]='aaa';
test[0][1]='bbb';
test[1][0]='ccc';


// Define the callback function.
function ShowResults(value, index, ar) {
    console.log(" index: " + index + " value: " + value);
}

// Create an array.
var letters = ['ab', 'cd', 'ef'];

// Call the ShowResults callback function for each
// array element.
letters.forEach(ShowResults);

// Output:
//  value: ab index: 0
//  value: cd index: 1
//  value: ef index: 2 