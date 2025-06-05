# About
This application correlates MDRO typing data with patient location data to evaluate connections between these datasets and derive reproducible transmission thresholds per bacterial species.

🔒 Local data processing — no uploads, privacy guaranteed  
⚙️ Customizable parameters for spatial and temporal analysis  
🧫 Supports any cgMLST-typed bacterial species  
🔁 Reproducible method used in published research  

You can find the application here: 
https://mdro-correlation.uni-muenster.de/2506/  

## Application Modes
You can either supply your own data for analysis, which will start the application at step 1, or use the preprocessed data from our publication (modified for data safety), which will start from step 5 (Typing Filter).

The following sections describe each step of the application in detail.

# Part 1
Supply and filter raw data, then calculate distance matrices. This section is required when using your own data.

## 1. Source Data 
Please use tab-separated values (TSV) with the following structure:

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
The following filters can be applied to the source data:

### 2.1. Date Filter
All typing data and location data outside the specified "from" and "till" date range will be removed from the dataset.

### 2.2. Row Filter
Filter out rows that have fewer than a specified percentage of correctly decoded alleles. In the typing data example above (1.1), "sequence 3" has only 50% correctly decoded alleles and would be filtered out by a "row = 51%" setting or higher.

### 2.3. Column Filter
Filter out columns that have fewer than a specified percentage of correctly decoded alleles. In the typing data example above (1.1), "allele 2" has only 33% correctly decoded values; a "column = 34%" setting would remove that column from further processing.

### 2.4. Location Filter
Some location records might be incomplete, missing ward, room, or date values. These records can be removed to achieve a higher-quality dataset.

## 3. Calculate Typing Distance Matrix
All pairs of typing data are compared for the number of different alleles, and the results are stored in a distance matrix of size n × (n-1) / 2. A sample date distance matrix of the same size is also calculated to allow for filtering in step 5.

### 3.1. Count Unknown
If null values are set to "count," sequences 2 and 3 in the example above (1.1) will result in a distance of 2. If null values are set to *not* "count," sequences 2 and 3 will result in a distance of 0.

## 4. Calculate Location Distance Matrix
All pairs of location data are compared for spatial and temporal distance, and the results are stored in two distance matrices, each of size n × (n-1) / 2. There are no adjustable parameters for this step.

# Part 2
Filter typing and location distance matrices using the parameters described in our publication, then correlate the filtered matrices to derive transmission thresholds. If you use the preprocessed data from our publication, the web application starts here.

## 5. Typing Filter
The typing distance matrix can be filtered by sample date distance. This parameter is called "Typing Temporal" (TT) and sets the upper limit of days between any two samples. A histogram showing the distribution of typing distances is also created during this step.

## 6. Location Filter
The location distance matrix can be filtered spatially and temporally. The "Contact Spatial" (CS) parameter allows filtering by level of contact (clinic, ward, room, or any). The "Contact Temporal" (CT) parameter allows filtering by duration of stay between any two patients; negative numbers can be used for distance between non-overlapping stays.

## 7. Correlation
Correlation between the cgMLST typing matrix and contact matrix occurs in this step. You have three parameters to adjust the outcome:

**Typing Distance (TD)** sets the upper limit for calculation and thus the "width" of the chart. Higher values will lead to longer calculation times.

**Contact Depth (CD)** sets the number of allowed intermediary contacts. Calculation of second and third-degree connections will also lead to longer calculation times.

**Mutation Rate (MR)** sets the upper limit of allowed deviation from the currently calculated typing distance. For example: Patients A & B with TypingDistance=3 and MutationRate=2 allows for PatientLink "A-X-B" to have "A-X" and "X-B" distances of up to 5. This is used for indirect contacts only.

## Overview of All Available Parameters 
**TT** – Typing Temporal window (default: 365 days)  
**CS** – Contact Spatial granularity (room, ward, clinic)  
**CT** – Contact Temporal gap (e.g., -3 days)  
**CD** – Contact Depth (0 = direct contacts only)  
**MR** – Mutation Rate for intermediary contacts