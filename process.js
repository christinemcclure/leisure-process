//
//  Create a log file of YYYY-MM-DD format. Delete any file if it exists
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

