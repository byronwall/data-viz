# Summary table improvements

Overall goal is to add a "chart" comp type for calculating and viewing pivot tables.

## Requirements

- Add a new chart type for pivot tables
- Core settings + selectors
  - Row fields - multi select on the field names
  - Column fields - multi select on the field names
  - Value fields - define a list of field + agg functions to calculate
  - Agg functions - sum, count, avg, min, max, median, mode, stddev, variance, count unique, single value
  - Special agg function = derived value - allows the user to enter a formula that uses the already computed agg values as variables
- Add logic to gather the data and perform the calcs
- If choosing single value, throw an error if there is more than one unique value
- Add a new pivot table button to all categorical field types in the summary table
  - This will create a simple table that only has a single row field defined
- Build the visuals for the pivot table - they should basically match Excel
- Add logic to the row and column headers which allows the user to filter the data - click to filter on value
- UX considerations
  - Allow user to drag a field from the summary table to the pivot table to use as a row field or column field

## Plan
