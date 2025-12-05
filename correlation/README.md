this README provides an overview of the correlation analysis module, detailing the parameters used for filtering typing and location distance matrices, as well as the methods for correlating these matrices to identify potential epidemiological links between patients based on genetic similarity and contact history.


# Parameter Overview

| Parameter | Full Name          | Default             | Description                                                    |
| :-------- | :----------------- | :------------------ | :------------------------------------------------------------- |
| **TD** | Typing Distance    | 100            | Upper limit for genetic distance in correlation analysis       |
| **TT** | Typing Temporal    | 365 days            | Maximum allowed days between samples                           |
| **TV** | Typing Variation   | 2                   | Allowed deviation for intermediary contacts (indirect only)    |
| **CS** | Contact Spatial    | CWR  | Spatial granularity level (**C**linic, **W**ard, **R**oom)                 |
| **CT** | Contact Temporal   | -3 days             | Temporal gap between stays                                     |
| **CD** | Contact Depth      | 1     | Number of allowed intermediary contacts                        |

<br><br><br><br>



# Typing Distance Filtering
The Typing Distance matrix can be filtered temporally to include only those sample-pairs that were collected within a defined time window. Also, a maximum genetic distance can be set to limit the range of genetic comparisons included in the correlation analysis, as well as a variation allowance for indirect contacts.

* **Typing Temporal (TT):** This parameter sets the upper limit for the number of days allowed between any two samples when considering them for correlation. For instance, setting TT to 30 days would mean that the analysis only considers pairs of MDRO isolates that were collected from patients within a month of each other. This is particularly important for identifying acute transmission events or outbreaks, as isolates with very distant collection dates are less likely to represent direct transmission within a hospital setting. A larger TT value might capture more prolonged colonization or environmental persistence, while a smaller TT value focuses on very recent acquisition events. The choice of this threshold can significantly impact the observed correlation patterns, allowing researchers to fine-tune the analysis to specific hypotheses regarding the temporality of transmission.

* **Typing Variation (TV):** This parameter is exclusively used for indirect contacts! It sets the maximum allowed variation from the currently calculated typing distance for intermediary contacts, providing crucial flexibility when assessing potential indirect transmission routes. For example, if Patients A & B have Typing Distance = 3 and Typing Variation = 2, a Patient Link "A-X-B" allows "A-X" and "X-B" distances of up to 5 (i.e., the sum of the direct distance and the typing-variation).

* **Typing Distance (TD):** This parameter sets the upper limit for genetic distance in correlation analysis, directly influencing the "width" of the resulting chart that visualizes genetic similarity and contact patterns. A higher TD allows for investigating broader transmission dynamics, incorporating more genetically divergent isolates. Increasing this limit processes a wider range of genetic comparisons, leading to increased computation time. 




<br>
<br>
<br>
<br>
<br>


# Location Distance Filtering

The location distance matrix can be filtered both spatially and temporally for precise analysis of patient interactions. A third parameter allows for the inclusion of indirect contacts through intermediary patients.

* **Contact Spatial (CS):** This parameter defines the spatial granularity for considering patient contacts. Options typically include room-level, ward-level, or clinic-level contacts. For example, setting CS to "room" means that only patients who shared the same room at overlapping times are considered to have had contact. This level of detail is crucial for accurately identifying potential transmission events, as closer spatial proximity generally increases the likelihood of pathogen spread. Conversely, setting CS to "clinic" would consider any patients within the same clinic, which may capture broader transmission patterns but with less specificity.

* **Contact Temporal (CT):** This parameter sets the temporal window for defining patient contacts based on their stays in healthcare locations. Overlapping stays are expressed as positive integers (indicating the number of overlapping days), while consecutive stays are expressed as negative integers (indicating the gap in days between stays). This parameter is vital for capturing both direct and near-direct transmission opportunities, reflecting real-world scenarios where pathogens can persist in environments for short periods after a patient has left. For instance, if CT is set to -3 days, it means that if Patient A was in a location and Patient B entered that same location up to 3 days later, they are considered to have had contact.

* **Contact Depth (CD):** This parameter allows for the inclusion of indirect contacts through intermediary patients. It defines how many layers of patient connections are considered when assessing potential transmission routes. For example, a CD of 0 means only direct contacts are considered (i.e., patients who were in the same location at the same time). A CD of 1 would include patients who had contact with a common intermediary patient, thus expanding the network of potential transmission events. This parameter is particularly useful for understanding complex transmission dynamics in healthcare settings, where pathogens may spread through multiple hosts before reaching a final patient.




<br>
<br>
<br>
<br>
<br>




# Data Correlation 

The core of the analysis involves correlating the filtered typing distance matrix with the filtered location distance matrix to identify potential epidemiological links between patients based on genetic similarity and contact history.
The x-axis represents the genetic distance (cgMLST distance) between pairs of isolates, while the y-axis indicates the proportion of patient-pairs that have an epidemiological link (as defined by the location distance filtering parameters) at each genetic distance level.
The y-axis value at each cgMLST distance is calculated by dividing the number of patient-pairs with an epidemiological link by the total number of patient-pairs at that specific cgMLST distance.  
We call the share of patient-pairs with epidemiological link out of all patient-pairs at a given cgMLST-distance "pair-connectivity".   
The plot shows how the likelihood of an epidemiological link changes with increasing genetic distance.

We then calculate the arithmetic mean and standard deviation of these y-values across all cgMLST distances to establish a cutoff for significant epidemiological linkage.
> χ = μ + 2 x σ

|symbol|meaning||
|-|-|-|
|μ|   arithmetic mean		| |
|σ|   standard deviation	| |
|χ|   cutoff				| = y-value at which the horizontal cutoff line intersects the y-axis |
|τ|   threshold				| = x-value at which the vertical threshold line intersects the x-axis |



![image](demoPics/pairConn.png)




<br>
<br>
<br>
<br>
<br>




# Typing Histogram

We also generate a histogram showing the distribution of pairwise genetic distances (cgMLST distances) among all isolates in the dataset. This histogram provides insights into the overall genetic diversity of the bacterial population under study and helps identify clusters of closely related isolates that may indicate recent transmission events.

![image](demoPics/typeHist.png)






<br>
<br>
<br>
<br>
<br>


