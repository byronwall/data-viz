# Data Viz

Tool for exploratory and interactive data analysis.

![](docs/main-image.png)

## Features

Will be updated when done...

## Major work remaining

### Core data viz

- Add calculation engine on raw data - create derived fields - show in summary table
- Add support for faceting
- Top level filter + steps = ability to quickly segment data and work on slices
- Improve UX everywhere
  - Settings needs a numeric input that works
  - Field picker at top needs to improve
  - Add keyboard shortcuts + a guide
- Allow controlling settings better
  - Grid layout
- Add a filter summary + filter controller
- Wire up "load examples" buttons for main data sets - get rid of current default state
- Improve handling of times stamps

### Packaging and usages

- Get an initial page created to test on GitHub pages
- Export the core data viewer as a component to be installed elsewhere
- Allow the comp to export the current config so it can be brought into code easily

### Docs and help

- Write up the motivation for the project
- Create a full doc site with helper images
- Create some videos showing usage

## Nice to haves

- Add GPS maps + data display
  - Figure out how to do chloropleth maps
- Add supporting for multiple data sources and relationships
- Add data isolation + "fork" modes - create tabbed interfaces for these
- Create a SPLOM comp that renders scatter plot matrices
- Add a UMAP or TSNE comp that shows clusters from embeddings
- Global color themes

## Small problems

- Scatter plot needs to allow new drag filter on off-click if already brushed
- Charts are all missing consistent gridlines
- Bools should be shown as `true`/`false` not `1`/`0`
- Clicking on a numerical bar chart should filter by the width of the bar
- ChartActions - tooltip is annoying - slow down or remove (add a legend?)
- Debounce the slider on the summary table to prevent too many re-renders
- Show the total row count somewhere on the summary table
- Verify that null detection is working correctly
- Add filtering to the summary table
- Bar chart needs a bunch of visual tweaks
  - Give option to render label on top of bar (instead of to left; affects the axis def)
  - Set a max length on that label
  - Allow ordering by label
  - Allow keeping 0 count items in display to avoid layout shift when filtering
- Need to swap out the multi select comp with good one from Plantasktic
- Add button to create blank chart by choosing type
