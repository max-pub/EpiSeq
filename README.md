# EpiSeq

This application analyzes the relationship between **genomic sequencing** data (of bacteria) and **location data** (of patients).  
It was specifically created for correlating [cgMLST](https://en.wikipedia.org/wiki/Multilocus_sequence_typing) data of [MDRO](https://en.wikipedia.org/wiki/Multidrug-resistant_bacteria)s with patient location data at our [university hospital](https://www.ukm.de/institute/hygiene).  
Its primary objective is to assess the relationship between these datasets and derive **reproducible transmission thresholds** per bacterial species that might support clinical practice.

**Key Features:**

* **Local Data Processing:** Ensures strict privacy with no data uploads; all processing occurs locally.
* **Customizable Parameters:** Offers flexible spatial and temporal analysis configurations.
* **Broad Species Support:** Compatible with any cgMLST-typed bacterial species.
* **Reproducible Methodology:** Implements a method validated and used in a peer-reviewed publication.

The application is available at: [https://mdro-correlation.uni-muenster.de/](https://mdro-correlation.uni-muenster.de/)


## Application Modes

The application offers two distinct operational modes:

1.  **Preparation:**
    <!-- * **If you have raw typing and patient movement data, start here** -->
    * Filter, clean, and pseudonymize your raw data
    * Calculate distance matrices for typing and location data
    * Export the resulting distance-matrices for correlation analysis

2.  **Correlation:**
    <!-- * **If you want to reproduce the results of our study, start here** -->
    * Load pre-processed data from our publication or use your own prepared data
    * Correlate typing and location distance matrices
    * Visualize correlation with charts
    * Derive epidemiological thresholds for transmission events







## Legal Notice

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