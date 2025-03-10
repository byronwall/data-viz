# Box Plot Implementation Comments

- Need to have the filter use the color variable - could also consider a range filter on the y value with brushing?
- Clicking on a box should filter by the color group (if grouped)
- Need an axis label for the x and y axis - this should be handled globally - the chart settings should be an override
- Need to actually color the rect by the color field
- Violin and bee swarm do not work
- Add a setting to display text on the boxes for the values (maybe at the bottom or top or in the box?)
- Give control over sorting - sort by median, sort by x label
- Consider a bandwidth setting for the violin plot
- Bee swarm needs to do a random sample of points if more than 1000
- Remove the tooltip from bee swarms - too many of them
- Render bee swarms points on top of the boxes

## SVG icon

Source = <https://iconbuddy.com/carbon/box-plot>

```html
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="200"
  height="200"
  viewBox="0 0 32 32"
>
  <path
    fill="currentColor"
    d="M22 6V4H12v2h4v2h-4v12h4v2h-4v2h10v-2h-4v-2h4V8h-4V6Zm-8 12v-3h6v3Zm6-5h-6v-3h6Z"
  />
  <path fill="currentColor" d="M30 30H4a2 2 0 0 1-2-2V2h2v26h26Z" />
</svg>
```
