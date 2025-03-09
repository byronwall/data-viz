## Filter rework notes

### Pivot Table

- Should highlight the active filters in the pivot table - use a yellow background on cells that meet the filter conditions - the filters affect other charts, not the pivot table, so all live data shoudl be renderered - no change
- Pivot table row header needs to use the raw value with type and not a string
- PivotCell needs to build a key with the approriate typed value for the column field + value
- Need to apply an OR to the columns and an OR to the rows if there are multiple entries

### Related to Data Table

- Should include option to filter only the component or to filter the entire crossfilter context
- Global search seems to not work - does it search all fields? or just those involved in the display
- Add highlighter when using the global search or other filters
- Show filter as a row below the header - add option to change type
- Add a popover for quick access to advanced filtering options
