# mro-epi
this application correlates MDRO-typing-data and patient-location-data
to evaluate the connection between these data-sets




## required source data structure
please use tsv-files (tab separated values) with the following structure

### typing data

| sequenceID  | patientID  | sampleDate | allele 1 | allele 2 | allele 3 | allele 4 | ... |
| ----------- | ---------- | ---------- | -------- | -------- | -------- | -------- | --- |
| sequence 1  | patient 1  | 2022-07-03 | 47       | ?        | 78       | 65       | ... |
| sequence 2  | patient 2  | 2022-07-05 | 32       | 41       | 15       | 17       | ... |
| sequence 3  | patient 2  | 2022-07-05 | 32       | ?        | ?        | 17       | ... |
| ...         | ...        | ...        | ...      | ...      | ...      | ...      | ... |


### location data
| locationID | patientID | from | till | clinic | ward | room |
| ---------- | --------- | ---- | ---- | ------ | ---- | ---- |  
| location1  | patient1  | 2022-05-02 | 2022-06-14 | Dermatology | Ward B | Room 23 |
| location2  | patient1  | 2022-06-14 | 2022-07-23 | Dermatology | Ward C | Room 12 |
| ...        | ...       | ...        | ...        | ...         | ...    | ...     |





## filter options
various filters can be applied to the source - data given above

### rows
filter out rows that have less than a given percentage of correctly decoded alleles.
in the typing-data-example above, "sequence 3" has only 50% correctly decoded alleles, 
it would be filtered out by a "row = 51%" setting or above.

### columns
"allele 2" as only 33% correctly deciphered values, "column = 34%" would remove that column





## distance options
the typing - distance - matrix will be computed based on the option below

### countNull
if "null"-values are set to "count", sequence 2 and 3 in the example above will result in a distance of 2.
if "null-values are set to *not* "count", sequence 2 and 3 in the example above will result in a distance of 0.
