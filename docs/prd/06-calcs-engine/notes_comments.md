# Notes and comments

- Want to use a discriminated union for the expression types and settings - don't dump in one object/type
- Ideally don't need to track/store deps - just calculate on demand
- Swap any for datum
- Review `keyword` for ohm - looks not used
- How does the registry interact with the parser + calculator?
  - The registry seems like it will be deleted -- not clear what it's purpose was
- Need to think through how to handle vector vs. scalar calcs
  - basically all calcs will run row wise eventually... except those that must process an entire column at once
  - teh current `Context` is trying to split data from variables - likely want getter funcs instead
- Need better organization around calc defs -- cannot all be in one big file
