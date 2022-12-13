# Pattern
## Website
* This project is a visualization of PTEN expression data. 
* It explores bar chart to present the data. The median of each tissue is shown as a bar with color assigned in the chart. 
* To sort the data in different ways, two buttons are added, one for sorting by ascending alphabet, the other for sorting by median value.
* For a responsive website for diffferent screen sizes, it used @media rule in CSS to change the font size and position of text and a function named "responsivefy" in JS to preserve aspect ratio of svg.  
* Explore: https://albatross97.github.io/pattern/

## Documentation
* Line 1-3 Assign data path to variables (PREN and TISSUE)
* Line 5-9 Find the default sorting option (which button is checked)
* Line 22-49 Create a reponsive svg for bar chart and a div for its tooltip 
* Line 51-91 Use Promise.all to load the two data sets. Apply d3.rollup to calculate the median expression value of each tissue in PTEN_gene_expression.json, and then use map to combine two data sets. Once the merged data is ready, run function "updateChart". To update the chart when changing the sorting method, addEventListener is added.
* Line 93-164 Create a function named "updateChart" with two parameters: tissueMedianWithColor (the merged dataset) and sortTag (the checked sorting method)
  1. Sort data based on sortTag (alphabet or median value) using d3.ascending or d3.descending.
  2. Create axis
  3. Add hover animation using mouseover and mouseout
  4. Add settings for bars

## Resource
* D3 v7: https://cdnjs.cloudflare.com/ajax/libs/d3/7.1.1/d3.min.js
* Bootstrap v5: https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css
