<p align="center"><img src="assets/logo.png" width="96" height="96" alt="Filestar"></p>

# Filestar for AI agents

**Filestar lets your agent open and convert 1,600+ file types (CAD, 3D, video, audio, images, documents, embroidery,
legacy formats) locally on your machine. One MCP server instead of ten.**

Your agent hits a `.dwg`, a `.jt`, a `.heic` or a `.dst` it can't read. With Filestar it asks what the file is, sees
what can be done with it, and converts it, on your computer. 50 free conversions per computer, no account.

<!-- install-links:start (written by scripts/bump-version.cjs) -->
[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=filestar&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsImZpbGVzdGFyQDMwLjcuMCIsIm1jcCJdfQ%3D%3D)
[![Install in VS Code](https://img.shields.io/badge/VS_Code-Install_Filestar-0098FF?logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%257B%2522name%2522%253A%2522filestar%2522%252C%2522type%2522%253A%2522stdio%2522%252C%2522command%2522%253A%2522npx%2522%252C%2522args%2522%253A%255B%2522-y%2522%252C%2522filestar%254030.7.0%2522%252C%2522mcp%2522%255D%257D)
[![Add to Kiro](https://kiro.dev/images/add-to-kiro.svg)](https://kiro.dev/launch/mcp/add?name=filestar&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22filestar%4030.7.0%22%2C%22mcp%22%5D%7D)
[![LM Studio, Goose and more](https://img.shields.io/badge/More-LM_Studio,_Goose,_Claude_Desktop-555)](https://filestar.com/agents#install)
<!-- install-links:end -->

This repository holds the open parts: the plugin manifests for Claude Code, Cursor, Codex and Gemini CLI, the skill,
the MCP configuration and the examples, under the MIT licence. They start the Filestar command line from npm
(`filestar`), which is proprietary software by Bosma Interactive AB.

## Install

**Claude Code**, as a plugin (MCP server and skill):

```
/plugin marketplace add filestar/filestar-agent
/plugin install filestar@filestar
```

or the MCP server alone: `claude mcp add filestar -- npx -y filestar@30.7.0 mcp`

**Any agent with MCP** (Claude Desktop, Cursor, Windsurf, Junie, Kiro, Cline, Roo Code, LM Studio, Goose...):

```json
{
  "mcpServers": {
    "filestar": { "command": "npx", "args": ["-y", "filestar@30.7.0", "mcp"] }
  }
}
```

VS Code uses `servers` instead of `mcpServers`: `code --add-mcp '{"name":"filestar","type":"stdio","command":"npx","args":["-y","filestar@30.7.0","mcp"]}'`

**Gemini CLI:** `gemini extensions install https://github.com/filestar/filestar-agent`

**Codex:** `codex plugin marketplace add filestar/filestar-agent`

**Let Filestar do it:** `npx -y filestar@30.7.0 agent install` finds the agents on this computer (Claude Code, Codex,
Claude Desktop, Cursor, Gemini CLI, GitHub Copilot CLI, opencode, Windsurf, VS Code) and adds Filestar to each, as a
skill or an MCP server. `agent uninstall` takes it out again.

Needs Node.js 18 or later. Runs on Windows (x64, x86), macOS (Intel and Apple silicon) and Linux (x64). Also as a .NET
tool: `dotnet tool install -g Filestar`.

## What your agent gets

Six MCP tools:

| Tool | What it does |
|---|---|
| `detect_file` | The file type of one or more files, and why. No network. |
| `list_skills` | What Filestar can do with a file: "convert to glb", "compress", "merge"... |
| `describe_skill` | The parameters of one command, with types, defaults and allowed values. |
| `convert` | Runs a command on files and returns the absolute path of every output. |
| `account_status` | The plan, and how many free conversions are left. |
| `account_upgrade` | A link for the person to buy a plan for this computer. |

Agents with a shell can use the skill instead ([`skills/filestar/SKILL.md`](skills/filestar/SKILL.md)), which drives
`filestarcli` with `--json`. Either way the agent learns everything from `filestarcli agent readme`.

## Why not pandoc, LibreOffice or FFmpeg?

Use them when you have them. Filestar is for when the agent shouldn't have to know which tool reads a format, install
it, and guess its flags: one `detect` and one `convert` cover documents, images, audio and video, and the formats none
of them read, such as CAD (DWG, STEP, JT), 3D, embroidery (DST, PES), camera RAW and retro and legacy formats.

## What leaves your computer

- **Your files, only when a cloud skill runs.** Most skills, including the common conversions, run on your computer.
  Through MCP, cloud skills are refused unless the agent sets `cloud` to `Allowed` (it should ask you first). On the
  command line the default is `--cloud Allowed`; `--cloud Disallowed` refuses cloud skills and skills that send files
  elsewhere (HTTP post, email, print). Through MCP those export skills are never available.
- **A licence check and a count for each run:** which skill, the file types, how many files and how large, this
  computer's registration, whether it worked, and how it was started: surface (`mcp`), channel (`npm`) and the agent's
  name (`claude-code/2.1`). Never the contents of a file for a local skill.
- **Usage events and crash reports**, as the Filestar app sends them.

Every host the command line talks to, all run by Bosma Interactive AB:

| Host | Why |
|---|---|
| `license.filestar.com` | Licence check, the free-conversion count, run records |
| `meta.filestar.com` | The skill catalogue, file-type data, usage events |
| `nuget.filestar.com`, `cdn.filestar.com` | Downloading a plugin or tool the first time a skill needs it |
| `gateway.filestar.com` | Cloud skills only: the file is uploaded and the result downloaded |
| `bugsink.filestar.com` | Crash reports |
| `registry.npmjs.org` | npm itself, fetching the `filestar` package |

Details: [filestar.com/help/ai-agents/privacy](https://filestar.com/help/ai-agents/privacy) ·
Privacy policy: [filestar.com/privacy-policy](https://filestar.com/privacy-policy)

## What it costs

50 free conversions on each computer with no account: local skills, one file per run. After that, or for cloud skills
and batches, a Filestar plan is needed. When the free conversions are used up the agent shows you a link to choose a
plan; nothing is sold through the agent. See
[Plans and Limits](https://filestar.com/help/ai-agents/plans-and-limits).

## Try it

[Ten example prompts](examples/prompts.md), such as:

- "What is `drawing.dwg`? Make me a PDF of it."
- "Turn `part.step` into a glTF I can open in a browser."
- "Convert this embroidery file `logo.dst` to a PNG so I can see the design."

## In this repository

| Path | For |
|---|---|
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `.mcp.json` | Claude Code plugin and marketplace |
| `plugin.json`, `mcp.json` | [Agent Plugins](https://agent-plugins.org) (Cursor, Codex) |
| `.cursor-plugin/plugin.json` | Cursor Marketplace |
| `.agents/plugins/marketplace.json` | Codex marketplace |
| `gemini-extension.json`, `GEMINI.md` | Gemini CLI extension |
| `server.json` | The [MCP Registry](https://registry.modelcontextprotocol.io) entry `com.filestar/filestar` |
| `skills/filestar/SKILL.md` | The Agent Skill |
| `llms-install.md` | Setup steps for Cline and Roo Code |
| `mcpb/` | A Claude Desktop extension (`.mcpb`) |
| `scripts/bump-version.cjs` | Pins every file to one npm version |

Every manifest pins one exact version of the npm package. `node scripts/bump-version.cjs --latest` moves them all.

## Help

[filestar.com/help/ai-agents](https://filestar.com/help/ai-agents) · Issues with the plugin files:
[GitHub issues](https://github.com/filestar/filestar-agent/issues) · Anything else: [filestar.com/help](https://filestar.com/help)

Published by Bosma Interactive AB, Saltsjö-Boo, Sweden.
