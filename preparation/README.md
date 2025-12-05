this README provides an overview of the data preparation module, detailing the required raw data format, available filtering options, and the methods used to compute distance matrices from the provided typing and location data.

# Raw Data Format
please supply your data as tab-separated-values (TSV) with the following data-structure.

<br/>
<br/>
<br/>

## Typing Data

| sequenceID | patientID | sampleDate | allele 1 | allele 2 | allele 3 | allele 4 | ... |
| ---------- | --------- | ---------- | ---------- | -------- | -------- | -------- | --- |
| sequence 1 | patient 1 | 2022-07-03 | 47 |  | 78 | 65 | ... |
| sequence 2 | patient 2 | 2022-07-05 | 32 | 41 | 15 | 17 | ... |
| sequence 3 | patient 2 | 2022-08-09 | 32 |  |  | 17 | ... |
| ... | ... | ... | ... | ... | ... | ... | ... |

the typing data must have the following columns:
- unique **sequenceID**
- associated **patientID** 
- the **sampleDate** when the the MDRO was taken from the patient
- all further columns can have any naming of your choice and are interpreted as characteristics of the sampled MDRO. The values don't have to be numeric as shown in the example. The values are later only evaluated for beeing identical or different. Instead of a cgMLST-sequence you could also supply an antibiogram of the form 

| sequenceID | patientID | sampleDate | Vancomycin | Gentamycin | Amoxicillin | Ciprofloxacin | ... |
| ---------- | --------- | ---------- | ---------- | -------- | -------- | -------- | --- |
| sequence 1 | patient 1 | 2022-07-03 | R |  | S | S | ... |
| sequence 2 | patient 2 | 2022-07-05 | I | S | I | R | ... |
| sequence 3 | patient 2 | 2022-08-09 | S | R |  | R | ... |
| ... | ... | ... | ... | ... | ... | ... | ... |

<br/>
<br/>
<br/>

## Location Data

| locationID | patientID | from | till | clinic | ward | room |
| ---------- | --------- | ---- | ---- | ------ | ---- | ---- |
| location1 | patient1 | 2022-05-02 | 2022-06-14 | Dermatology | Ward B | Room 23 |
| location2 | patient1 | 2022-06-14 | 2022-07-23 | Dermatology | Ward C | Room 12 |
| location3 | patient2 | 2022-06-10 | 2022-07-01 | Dermatology | Ward B | Room 23 |
| location4 | patient2 | 2022-07-20 | 2022-08-05 | ICU | Ward A | Room 5 |
| location5 | patient3 | 2022-05-15 | 2022-06-01 | ICU | Ward A | Room 2 |
| location6 | patient3 | 2022-06-15 | 2022-07-10 | ICU | Ward A | Room 5 |
| ... | ... | ... | ... | ... | ... | ... |

location data fust have the following columns:
- unique **locationID**
- associated **patientID**
- **from**: date when the patient was admitted to this location
- **till**: date when the patient left this location
- **clinic**: name of the clinic
- **ward**: name of the ward
- **room**: name of the room

<br/>
<br/>
<br/>

<br/>
<br/>
<br/>


# Data Filtering Options
The following filters can be applied to the source data to improve its quality:

* **From:** Excludes all typing and location data recorded *before* the specified date.
* **Till:** Excludes all typing and location data recorded *after* the specified date.
* **Valid Dates:** Removes typing and location data entries with invalid or missing dates, when selected.

<br/>

* **Sequences:** Filters out typing sequences where the percentage of correctly decoded alleles falls below a given threshold. For instance, in the example above, "sequence 3" has 50% correctly decoded alleles; a setting of "row = 51%" or higher would remove this row. A default value of "90%" is employed to ensure data quality.
* **Alleles:** Filters out typing alleles where the percentage of correctly decoded alleles falls below a given threshold. In the example above, "allele 2" has only 33% correctly decoded values; "column = 34%" would remove this column.

<br/>

* **Clinics:** when selected, location records lacking *clinic* data will be removed.
* **Wards:** when selected, location records lacking *ward* data will be removed.
* **Rooms:** when selected, location records lacking *room* data will be removed.

<br/>

* **Pseudonymize:** when selected, location IDs, sequence IDs, patient IDs, and clinic/ward/room names will be replaced with random strings to ensure data anonymity.
* **count unknown** : When selected, unknown or missing typing values (empty cells) are treated as distinct alleles during distance calculations. For example, in the typing data above, "sequence 1" and "sequence 2" differ in "allele 2" ('' vs. '41'); with this option *enabled*, this difference contributes to their calculated distance. With this option *disabled*, such unknown values are ignored in distance calculations, potentially reducing the computed distance between sequences. The default is set to *disabled*, as is current clinical pratice.


<br/>
<br/>
<br/>

<br/>
<br/>
<br/>



# Distance Matrix Calculation
The filtered typing- and location- data will be now be processed pair-wise to create distance-matrices as described below.

<br/>
<br/>
<br/>



## Typing Distance Calculation

All typing-sequences are compared pairwise to compute the allele-distance between them ([hamming-distance](https://en.wikipedia.org/wiki/Hamming_distance)). The results are stored in a distance matrix of size $(n^2 - n)/2$. A distance matrix of sampleDate-distances in days will also be computed to allow for temporal filtering in later steps (TT). 

For example, considering the three sequences from the typing data example above: 
sequence 1 (47, -, 78, 65) and sequence 2 (32, 41, 15, 17) would have a distance of 3 (all alleles differ, empty cells are not counted per default). sequence 2 and 3 (32, -, -, 17) would have a distance of 0 (again, with undecoded alleles not counted).  

Similarly, the date-distance between sample dates 2022-07-03 and 2022-07-05 is 2 days, and between 2022-07-05 and 2022-08-09 is 35 days.

The resulting typing distance matrix would look like this:
|           | sequence 1 | sequence 2 | sequence 3 |
|-----------|------------|------------|------------|
| sequence 1|     0      |            |         |
| sequence 2|     3      |     0      |         |                   
| sequence 3|     2      |     0      |     0   |

The resulting sampleDate distance matrix would look like this:
|           | sequence 1 | sequence 2 | sequence 3 |
|-----------|------------|------------|------------|
| sequence 1|     0      |            |         |
| sequence 2|     2      |     0      |         |                   
| sequence 3|    37      |    35      |     0   |

<br/>
<br/>
<br/>



## Location Distance Calculation

we calculate three distinct distance matrices: clinic-, ward- and room-distance matrix based on the supplied location data. Each matrix is calculated by comparing all location-pairs of all patients-pairs. The location-distance is defined as the temporal distance in days between two patients at a given location level. Overlapping stays are stored as a positive integers, representing the number of overlapping days. Consecutive stays are stored as negative integers, representing the amount of days between stays.  
  
For example, if Patient A stayed in Room 23 from 2022-05-02 to 2022-06-14 and Patient B stayed in Room 23 from 2022-06-10 to 2022-07-01, they have an overlapping stay of 5 days (2022-06-10 to 2022-06-14) at room level, resulting in a room-distance of +5 days. If Patient C stayed in Room 23 from 2022-07-20 to 2022-08-05, the distance between Patient A and Patient C at room level would be -36 days (the gap between 2022-06-14 and 2022-07-20). Similar calculations are performed for ward and clinic levels, considering all relevant location entries for each patient.

The resulting room distance matrix would look like this:
|           | patient 1 | patient 2 | patient 3 |
|-----------|-----------|-----------|-----------|
| patient 1 |     0     |           |          |
| patient 2 |     +5    |     0     |         |                   
| patient 3 |    -36    |    -91    |     0    | 


The resulting ward distance matrix would look like this:
|           | patient 1 | patient 2 | patient 3 |
|-----------|-----------|-----------|-----------|       
| patient 1 |     0     |          |        |
| patient 2 |     +5    |     0     |        |                   
| patient 3 |    -21    |    -56    |     0    | 


The resulting clinic distance matrix would look like this:
|           | patient 1 | patient 2 | patient 3 |
|-----------|-----------|-----------|-----------|       
| patient 1 |     0     |         |        |
| patient 2 |     +5    |     0     |        |                   
| patient 3 |    -71    |   -126    |     0    |