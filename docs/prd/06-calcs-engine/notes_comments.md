# Notes and comments

- Want to use a discriminated union for the expression types and settings - don't dump in one object/type
- Ideally don't need to track/store deps - just calculate on demand
- Swap any for datum
- Review `keyword` for ohm - looks not used
- How does the registry interact with the parser + calculator?
- Adjust test command to not watch - stalls cursor
- Need to think through how to handle vector vs. scalar calcs -- basically all calcs will run row wise eventually... except those that must process an entire column at once
