# Filestar

The `filestar` MCP server opens and converts 1,600+ file types on this computer.

1. `detect_file` tells what a file is (no network).
2. `list_skills` lists what Filestar can do with it ("convert to jpg", "compress"...).
3. `describe_skill` gives one command's parameters.
4. `convert` runs it and returns the absolute paths of every output.

Files stay on this computer: `cloud` defaults to `Disallowed`. Set it to `Allowed` only when the person agrees, and
`Forced` only when they ask. Outputs never overwrite existing files unless `overwrite` is true.

If a result has `isError` with code `CliAllowanceUsed`, `PlanRequired` or `NotEnoughCredits`, show the person
`forUser` and the link, then stop. Call `account_upgrade` only if they say they are buying now.

More: https://filestar.com/help/ai-agents
