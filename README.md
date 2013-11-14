# Project Summary Notes
This project is complete and can be used to process all of the leisure reading items at Galvin Library (one a production-level API key is granted).
I had some difficulty getting accustomed to the asynchronous nature of Node.js, and this program would be benefited by a code review to identify and correct unnecessary functions. I had 
tried several different approaches to ensure that the ISBN file was processed prior to sending off XML requests, so there
is probably some overly-complicated code that can be removed. A future version of this app would include console interaction that would
allow the user to select which text file to process and what to name the log/data files. 

I think including some concrete exercises of async functions and how to handle them in code logic would benefit future students. I know that was where
I had trouble: all of the examples I found online were for web servers listening for HTTP traffic and I found it hard to correlate to my situation. But I
did enjoy the class, and am going to work on the front end version of this program: I hope to have it ready for students to use at the semester break. 


# Logic
##Preprocessing
1. Get output from Voyager client (all records with holdings in the leisure reading collection)
2. Save ISBN column only as text file

##Code

- [x] Open file (use only ISBN column of spreadsheet)
- [x] Read line
- [x] Split into array by space
- [x] Ensure alpha-numeric only (hyphens are added in display logic)
- [x] Check if ISBN is in processed array (skip duplicates)
- [x] Get OCLC record from WorldCat Search API by ISBN
- [x] Check for bad data
- [x] Convert to JSON
- [x] Write to file
- [ ] Add ISBN to processed array -- not needed
- [x] Get next line


# ISBN  examples

    1579549489 (alk. paper) 
    0345295706 : 
    9780670020836 
    159420229X 

