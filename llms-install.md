# Installing the Filestar MCP server (for AI agents)

You are installing Filestar, a local MCP server that converts and opens 1,600+ file types on this computer.

## Requirements

- Node.js 18 or later (`node --version`). Nothing else: npm fetches the Filestar command line for this platform
  (Windows x64/x86, macOS Intel and Apple silicon, Linux x64).
- No account and no API key. The first run registers this computer anonymously with 50 free conversions.

## Add the server

Add this entry to the MCP settings file (for Cline: `cline_mcp_settings.json`; for Roo Code: `mcp_settings.json`).
Keep the exact version: do not change it to `latest`.

```json
{
  "mcpServers": {
    "filestar": {
      "command": "npx",
      "args": ["-y", "filestar@30.8.0", "mcp"]
    }
  }
}
```

On Windows, if `npx` is not found by the client, use `"command": "cmd"` and
`"args": ["/c", "npx", "-y", "filestar@30.8.0", "mcp"]`.

## Check it

The server should list six tools: `detect_file`, `list_skills`, `describe_skill`, `convert`, `account_status`,
`account_upgrade`. Try `detect_file` on any file the user has; it needs no network.

## Use it

1. `detect_file` on the user's file, 2. `list_skills` to see what can be done, 3. `describe_skill` for parameters,
4. `convert` with the command (for example "convert to jpg"). Outputs are absolute paths.

Through MCP, files stay on this computer: cloud skills are refused unless the user agrees and `cloud` is set to
`Allowed`. If a result has `isError` with code `CliAllowanceUsed`, `PlanRequired` or `NotEnoughCredits`, show the user
`forUser` and the link, then stop.

More: https://filestar.com/help/ai-agents/mcp-server
