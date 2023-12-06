# mro-epi


## required input data structure
please use tsv-files (tab separated values) with the following structure

### typing data

| sequenceID | patientID | typingDate | allele1 | ... | alleleX |
| ---------- | --------- | ---------- | ------- | --- | ------- |  
| sequence1  | patient1  | 2022-07-03 | 47      | ... | 78      |
| sequence2  | patient2  | 2022-07-05 | 32      | ... | 15      |
| ...        | ...       | ...        | ...     | ... | ...     |


### location data
| locationID | patientID | from | till | clinic | ward | room |
| ---------- | --------- | ---- | ---- | ------ | ---- | ---- |  
| location1  | patient1  | 2022-05-02 | 2022-06-14 | Dermatology | Ward B | Room 23 |
| location2  | patient1  | 2022-06-14 | 2022-07-23 | Dermatology | Ward C | Room 12 |
| ...        | ...       | ...        | ...        | ...         | ...    | ...     |
