# MDRO Correlation Application

This application analyzes the **correlation between Multi-Drug Resistant Organism (MDRO) typing data and patient location data**. Its primary objective is to assess the relationship between these datasets and derive **reproducible transmission thresholds** per bacterial species.

---

**Key Features:**

* **🔒 Local Data Processing:** Ensures strict privacy with no data uploads; all processing occurs locally.
* **⚙️ Customizable Parameters:** Offers flexible spatial and temporal analysis configurations.
* **🧫 Broad Species Support:** Compatible with any cgMLST-typed bacterial species.
* **🔁 Reproducible Methodology:** Implements a method validated and used in a peer-reviewed publication.

---

The application is available at: [https://mdro-correlation.uni-muenster.de/2506/](https://mdro-correlation.uni-muenster.de/2506/)

## Application Modes

The application offers two distinct operational modes:

1.  **Custom Data Analysis:** Initiate the process with your own raw data, starting at [Part 1](#part-1).
2.  **Publication Data Analysis:** Utilize pre-processed, anonymized data from our publication, commencing directly at [Part 2](#part-2).

The following sections detail each step of the application workflow.

<br><br><br><br>

<a id="part-1"></a>
# Part 1: Raw Data Filtering and Distance Matrix Calculation

This section covers the submission and filtering of raw data, followed by the calculation of necessary distance matrices. This step is mandatory when providing your own datasets.

## 1. Source Data Requirements

Input data must be provided in **tab-separated values (TSV) format** with the specified structures.

<a id="part-1-1"></a>
#### 1.1. Typing Data

| sequenceID | patientID | sampleDate | allele 1 | allele 2 | allele 3 | allele 4 | ... |
| ---------- | --------- | ---------- | ---------- | -------- | -------- | -------- | --- |
| sequence 1 | patient 1 | 2022-07-03 | 47 | ? | 78 | 65 | ... |
| sequence 2 | patient 2 | 2022-07-05 | 32 | 41 | 15 | 17 | ... |
| sequence 3 | patient 2 | 2022-07-05 | 32 | ? | ? | 17 | ... |
| ... | ... | ... | ... | ... | ... | ... | ... |

<a id="part-1-2"></a>
#### 1.2. Location Data

| locationID | patientID | from | till | clinic | ward | room |
| ---------- | --------- | ---- | ---- | ------ | ---- | ---- |
| location1 | patient1 | 2022-05-02 | 2022-06-14 | Dermatology | Ward B | Room 23 |
| location2 | patient1 | 2022-06-14 | 2022-07-23 | Dermatology | Ward C | Room 12 |
| ... | ... | ... | ... | ... | ... | ... |

---

## 2. Source Data Filtering Options

The following filters can be applied to refine the source data:

* **From:** Excludes all typing and location data recorded **before** the specified date.
* **Till:** Excludes all typing and location data recorded **after** the specified date.
* **Rows:** Filters out typing data rows where the percentage of correctly decoded alleles falls below a given threshold. For instance, in the example above ([Part 1.1](#part-1-1)), "sequence 3" has 50% correctly decoded alleles; a setting of "row = 51%" or higher would remove this row.
* **Columns:** Filters out typing data columns where the percentage of correctly decoded alleles falls below a given threshold. In the example above ([Part 1.1](#part-1-1)), "allele 2" has only 33% correctly decoded values; "column = 34%" would remove this column.
* **Rooms:** Removes location records lacking room-specific data.
* **Wards:** Removes location records lacking ward-specific data.
* **Open-ends:** Removes location records without a specified **till**-date.
* **Pseudonymize:** Replaces location IDs, sequence IDs, patient IDs, and clinic/ward/room names with random strings to ensure data anonymity.

---

## 3. Typing Distance Matrix Calculation

All pairs of typing data undergo comparison to determine the number of differing alleles. The results are stored in a distance matrix of size $n \times (n-1)/2$. Concurrently, a sample-date distance matrix of the same dimensions is computed for subsequent filtering (Step 5).

* **Null Values:** "Undeciphered" values can either be counted as differences or disregarded:
    * If "null" values are set to **"count,"** sequence 2 and 3 in the example (1.1) will result in a distance of 2.
    * If "null" values are set to **"not count,"** sequence 2 and 3 in the example (1.1) will result in a distance of 0.

---

## 4. Location Distance Matrix Calculation

All pairs of location data are compared to calculate their spatial and temporal distances. The results are stored in two separate distance matrices, each of size $n \times (n-1)/2$. This step does not require adjustable parameters.

<br><br><br><br>

<a id="part-2"></a>
# Part 2: Distance Matrix Filtering and Correlation

This section focuses on filtering the typing and location distance matrices according to parameters described in our publication, followed by their correlation to derive transmission thresholds. If you use the pre-processed publication data, the web application initiates here.

---

## 5. Typing Distance Filtering

The typing distance matrix can be filtered based on the temporal distance between sample dates.

* **Typing Temporal (TT):** Sets the upper limit for the number of days allowed between any two samples.

A histogram illustrating the distribution of typing distances is generated during this step:

![image](docs/typeHist.png)

---

## 6. Location Distance Filtering

The location distance matrix can be filtered both spatially and temporally.

* **Contact Spatial (CS):** Allows filtering based on the level of contact granularity (clinic, ward, room, or any).
* **Contact Temporal (CT):** Allows filtering by the duration of overlap or separation between patient stays. Negative values can be used to define distances between non-overlapping stays.

---

## 7. Correlation Analysis

This step performs the correlation between the cgMLST typing matrix and the contact matrix. Three parameters allow for adjustment of the correlation outcome:

* **Typing Distance (TD):** Defines the upper limit for calculation, influencing the "width" of the resulting chart. Higher values may increase computation time.
* **Contact Depth (CD):** Specifies the number of allowed intermediary contacts. Calculating second and third-degree connections will also result in longer computation times.
* **Mutation Rate (MR):** Sets the maximum allowed deviation from the currently calculated typing distance. For example, if Patients A & B have a Typing Distance = 3 and a Mutation Rate = 2, a Patient Link "A-X-B" allows "A-X" and "X-B" distances of up to 5. This parameter is exclusively used for indirect contacts.

Results can be downloaded as raw data or visualized in a chart, as shown in the example below:

![image](docs/pairConn.png)

<br><br><br><br>

---

## Overview of All Available Parameters

| Parameter | Full Name          | Description                                                    | Default             |
| :-------- | :----------------- | :--------------------------------------------------------------- | :------------------ |
| **TT** | Typing Temporal    | Maximum allowed days between samples                             | 365 days            |
| **CS** | Contact Spatial    | Spatial granularity level (room, ward, clinic)                 | room, ward, clinic  |
| **CT** | Contact Temporal   | Temporal gap between stays                                       | -3 days             |
| **CD** | Contact Depth      | Number of allowed intermediary contacts                          | 0 (direct only)     |
| **MR** | Mutation Rate      | Allowed deviation for intermediary contacts (applies to indirect contacts only) | 2 |

<br><br><br><br>

---

# Legal Notice

### Responsible Entity:
Institut für Hygiene
Robert-Koch-Straße 41
48149 Münster
[www.ukm.de/institute/hygiene](https://www.ukm.de/institute/hygiene)

### Head of the Institute:
Univ.-Prof. Dr. med. Alexander Mellmann
alexander.mellmann@ukmuenster.de

### Application Development:
Dr. med. univ. Maximilian Fechner
max.fechner@uni-muenster.de

### Raw Data Extraction:
Dr. med. Hauke Tönnies
hauke.toennies@ukmuenster.de