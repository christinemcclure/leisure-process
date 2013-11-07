

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
- [ ] Get OCLC record from WorldCat Search API by ISBN
- [ ] Check for bad data
- [ ] Convert to JSON
- [ ] Write to file
- [ ] Add ISBN to processed array
- [ ] Get next line


# ISBN  examples

    1579549489 (alk. paper) 
    0345295706 : 
    9780670020836 
    159420229X 




