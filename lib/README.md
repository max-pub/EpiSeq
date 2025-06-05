# About
this application correlates MDRO-typing-data and patient-location-data
to evaluate the connection between these data-sets
and derive reproducible transmission thresholds per species


🔒 Local data processing — no uploads, privacy guaranteed  
⚙️ Customizable parameters for spatial and temporal analysis  
🧫 Supports any cgMLST-typed bacterial species  
🔁 Reproducible method used in published study  

You can find the application here: 
https://mdro-correlation.uni-muenster.de/2506/  


## Application Modes
you can either supply your own data for analysis. This will start the application with step 1.  
you can alternatively use the data from our publication, which is preprocessed for data-safety reasons and will thus start from step 5 (Typing Filter)  
The following sections describe each step of the application in detail.



# Part 1 - filter raw data and caluclate distance matrices
Supplying and filtering of raw data and calculation of distance matrices.   
This is necessary if you supply you own data.  

## 1. Source Data 
please use tab-separated-values (tsv) with the following structure

### 1.1. Typing Data
| sequenceID  | patientID  | sampleDate | allele 1 | allele 2 | allele 3 | allele 4 | ... |
| ----------- | ---------- | ---------- | -------- | -------- | -------- | -------- | --- |
| sequence 1  | patient 1  | 2022-07-03 | 47       | ?        | 78       | 65       | ... |
| sequence 2  | patient 2  | 2022-07-05 | 32       | 41       | 15       | 17       | ... |
| sequence 3  | patient 2  | 2022-07-05 | 32       | ?        | ?        | 17       | ... |
| ...         | ...        | ...        | ...      | ...      | ...      | ...      | ... |


### 1.2. Location Data
| locationID | patientID | from | till | clinic | ward | room |
| ---------- | --------- | ---- | ---- | ------ | ---- | ---- |  
| location1  | patient1  | 2022-05-02 | 2022-06-14 | Dermatology | Ward B | Room 23 |
| location2  | patient1  | 2022-06-14 | 2022-07-23 | Dermatology | Ward C | Room 12 |
| ...        | ...       | ...        | ...        | ...         | ...    | ...     |




## 2. Source Filter
The following filters can be applied to the source - data   
**from** all typing and location data **before** that date will be removed  
**till** all typing and location data **after** that date will be removed  
**rows** filter out rows that have less than a given percentage of correctly decoded alleles. in the typing-data-example above (1.1), "sequence 3" has only 50% correctly decoded alleles,  it would be filtered out by a "row = 51%" setting or above.   
**columns** filter out columns that have less than a given percentage of correctly decoded alleles. in the typing-data-example above (1.1), "allele 2" as only 33% correctly decoded values, "column = 34%" would remove that column from further processing  
**rooms** location records without room-data will be removed  
**wards** location records without ward-data will be removed  
**open-ends** location records without **till**-date will be removed  
**pseudonymize** location-IDs, sequence-IDs, patient-IDs and room,ward,clinic-names will be replaced with random strings  



## 3. Calculate Typing Distance Matrix
All pairs of typing data will be compared to each other for number of different alleles and the result will be stored in a distance-matrix of size n * (n-1) / 2. A sample-date-distance distance matrix of the same size is also calculated to allow for filtering in a later step (5.)

### 3.1. Count Unknown
if "null"-values are set to "count", sequence 2 and 3 in the example above (1.1) will result in a distance of 2.
if "null-values are set to *not* "count", sequence 2 and 3 in the example above (1.1) will result in a distance of 0.




## 4. Calculate Location Distance Matrix
All pairs of location data will be compared to each other for spacial and temporal distance and the result will be stored in two distance-matrices, each of size n * (n-1) / 2.  
There are no adjustable parameters for this step


# Part 2 - filter and correlate the distance-matrices
Filtering typing and location distance matrices by the parameters described in our publication and correlating the filtered matrices to derive transmission thresholds.  
if you use the preprocessed data from our publication, the web-application starts here.


## 5. Typing Filter
The typing-distance-matrix can be filtered by distance of sample-dates.  
**Typing Temporal (TT)** sets the upper limit of days between any two samples.   
A histogram showing the distribution of typing distances is also created during this step.  


## 6. Location Filter
The location-distance-matrix can be filtered spacially and temporally.  
**Contact Spacial (CS)** allows filtering of the level of contact (clinic, ward, room or any).  
**Contact Temporal (CT)** allows filtering by time of stay between any two patients; negative numbers can be used for distance between non-overlapping stays.  


## 7. Correlation
Correlation between cgMLST-typing-matrix and contact-matrix happens in this step. You have three parameters to adjust the outcome.   
**Typing Distance (TD)** sets the upper limit for calculation and thus the "width" of the chart. Higher values will lead to longer calculation times.
**Contact Depth (CD)** sets the number of allowed intermediary contacts. Calculation of second and third-degree connections will also lead to longer calculation times.
**Mutation Rate (MR)** sets the upper limit of allowed deviation from the currently calculated typing distance. For example: Patients A & B with TypingDistance=3 and MutationRate=2 allows for PatientLink "A-X-B" to have "A-X" and "X-B" distances of up to 5. This is used for indirect contacts only.


## Overview of All Available Parameters
| Parameter | Full Name | Description | Default |
|-----------|-----------|-------------|---------|
| **TT** | Typing Temporal | Maximum days between samples | 365 days |
| **CS** | Contact Spatial | Spatial granularity level | room, ward, clinic |
| **CT** | Contact Temporal | Temporal gap between stays | e.g., -3 days |
| **CD** | Contact Depth | Number of intermediary contacts allowed | 0 (direct only) |
| **MR** | Mutation Rate | Allowed deviation for intermediary contacts | - |