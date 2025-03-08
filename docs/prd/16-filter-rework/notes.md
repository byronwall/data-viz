# Filter rework notes

- Scatter chart isFiltered has filter logic in the chart comp - need to pull out and use one of the helpers
- BarChart and RowChart both need to use the `applyFilter` function to determine if data is filtered
- How will bar chart differentiate between value and range filters?
- Replace summary table chart settins creator call in DataLayerProvider with a new function using the definition file
- Update DataLayerProvider to use the new filter functions
- Update useChartExtent to use the new filter functions
- Need to inline the createSummaryChartSettings function in DataLayerProvider
- Data table needs to be case insensitive
- Data table should include option to globally filter vs. just local table
- Data table global search seems to not work
- Pivot table - not clear how to activate filters

## Questions

- Curious how the create + update + apply functions will work
- DataTable got wrecked by filter updates - will need to revert and do manually
