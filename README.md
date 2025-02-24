# Data Viz

## Major work remaining

- Add pivot tables
- Add calculation engine
- Add support for faceting
- Improve UX everywhere
  - Settings needs a numeric input that works
  - Field picker at top needs to improve
- Allow controlling settings better
  - Grid layout
- Add a filter summary + filter controller
- Wire up "load examples" buttons for main data sets - get rid of current default state
- Improve handling of times stamps
- Add a data summary table to the available fields - data type, min, max, mean, etc. first couple of unique values - buttons to quickly create a scatter or other plot - small distribution plots for numerical data - limit to 1000 row random sample
- Export the core data viewer as a component to be installed elsewhere
- Allow the comp to export the current config so it can be brought into code easily
- Global color themes

## Nice to haves

- Add GPS maps + data display
  - Figure out how to do chloropleth maps
- Add supporting for multiple data sources and relationships
- Add data isolation + "fork" modes - create tabbed interfaces for these
- Create a SPLOM comp that renders scatter plot matrices
- Add a UMAP or TSNE comp that shows clusters from embeddings

## Small problems

- Scatter plot needs to allow new drag filter on off-click if already brushed
- Charts are all missing consistent gridlines
- Bools should be shown as `true`/`false` not `1`/`0`
- Clicking on a numerical bar chart should filter by the width of the bar
- ChartActions - tooltip is annoying - slow down or remove (add a legend?)
