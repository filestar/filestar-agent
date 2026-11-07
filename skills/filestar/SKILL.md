---
name: filestar
description: Convert, resize, compress, merge, OCR and inspect files on this computer with Filestar (1,600+ file types: CAD, 3D, video, audio, images, documents, embroidery, legacy formats). Use when the user wants a file in another format (HEIC to JPG, DOCX to PDF, video to MP3...), images resized or compressed, PDFs merged, text extracted, a file's type identified, or a file you cannot read opened (.dwg, .step, .jt, .heic, .psd, .dst and the like).
---

# Filestar

**How to call it.** If the `filestar` MCP tools are available (`detect_file`, `list_skills`, `describe_skill`, `convert`, `account_status`, `account_upgrade`), use them. Otherwise run the command line: `filestarcli` when it is installed, or else `npx -y filestar@30.7.0` in its place (every `filestarcli …` below becomes `npx -y filestar@30.7.0 …`). The first run registers this computer anonymously with 50 free conversions; no account is needed.

Filestar converts, resizes, compresses and inspects files (images, documents, audio, video, 3D, CAD and more) with one command line, filestarcli. Thousands of skills, found by describing what you want: -c "convert to jpg".

Local by default: most skills run on this computer and files never leave it. A few skills run in Filestar's cloud, and export skills (HTTP post, email, print) send files where they are told. --cloud Disallowed refuses both, so no skill sends a file off this computer; Filestar's licence check and skill catalogue still use the network, without your files. Through MCP, cloud defaults to Disallowed (the CLI's default is Allowed) and export skills are never available.

## The loop

1. **Detect**: `filestarcli detect <file> --json`. The file type Filestar sees (id, name, why). No network, nothing converted.
2. **List skills**: `filestarcli skills -i <file> --json`. What Filestar can do with that file type: commands like "convert to jpg", local or cloud.
3. **Describe a skill**: `filestarcli skills describe "<command>" -i <file> --json`. The parameters of one command: names, types, defaults, allowed values.
4. **Run**: `filestarcli -i <file> -c "<command>" --json --user-agent <agent>/<version>`. Runs it. Pass the skill's parameters as --Name value (or --parameters-json '{"Name":value}'), --output-dir <folder>, --dry-run to check first.
5. **Read the result**: One JSON document: outputs[] are absolute paths of every file written; check status and the exit code.

--user-agent: Pass --user-agent <agent>/<version> on every command (or set FILESTAR_USER_AGENT once). The name is lowercase with dashes; the version is the agent's own. It tells Filestar which agents people use; it is never shown to anyone else. Examples: `--user-agent claude-code/2.1.4`, `--user-agent codex/0.48.0`, `--user-agent cursor/1.7`, `--user-agent gemini-cli/0.9.0`, `--user-agent copilot-cli/0.0.340`, `--user-agent opencode/0.15.0`, `--user-agent my-script/1.0`.

## Recipes

Command names vary by file type: confirm with `filestarcli skills -i <file>` when unsure.

- Convert an image: `filestarcli -i photo.heic -c "convert to jpg" --json`
- Convert every file of a type in a folder (needs a plan; the free conversions take one file per run): `filestarcli -i "./photos/*.heic" -c "convert to jpg" --output-dir ./jpg --json`
- Batch a folder tree (needs a plan; the free conversions take one file per run): `filestarcli -i "./scans/*.tif" -r -c "convert to pdf" --json`
- Resize an image to 800 x 600 pixels: `filestarcli -i photo.png -c "resize" --ImageResize 800,600,Fit,Pixels,false --json`
- Pass a skill's parameter by name: `filestarcli -i document.pdf -c "compress" --ImageQuality 60 --json`
- Resize and convert in one go: `filestarcli -i photo.png -c "resize to 50% and convert to webp" --json`
- Compress: `filestarcli -i video.mp4 -c "compress" --json`
- Merge PDFs into one: `filestarcli -i a.pdf b.pdf c.pdf -c "merge" --json`
- Extract the audio of a video: `filestarcli -i talk.mp4 -c "convert to mp3" --json`
- Make a scan searchable (OCR; needs a plan): `filestarcli -i scan.png -c "ocr png to pdf" --json`
- Check before running: `filestarcli -i drawing.dwg -c "convert to pdf" --dry-run --json`
- The person says they are buying a plan now: wait for the purchase: `filestarcli upgrade --wait --json`
- The person already has a plan: `filestarcli login person@example.com --wait --json`

## Rules

- Always pass --json and --user-agent <agent>/<version>, and read outputs[] from the result instead of guessing file names.
- The CLI's default is --cloud Allowed. Never use --cloud Forced unless the person asked for it; use --cloud Disallowed when the files must not leave the computer (it refuses cloud and export skills).
- On CliAllowanceUsed (exit 5), PlanRequired or NotEnoughCredits (exit 4): show the person error.forUser and the link (error.url), then stop. Do not retry or work around it. Run error.next ('filestarcli upgrade --wait') only if they say they are buying now: it waits for the purchase.
- Do not guess commands or parameter names: take them from 'filestarcli skills' and 'filestarcli skills describe'.
- Outputs never overwrite existing files unless you pass --overwrite; a number is added to the name instead.
- Never run the desktop app (Filestar.exe / Filestar.app) or an installer; 'filestarcli update' is the only command that updates.
- On Windows always call filestarcli, never filestar: with the desktop app installed, 'filestar' runs Filestar.exe, the desktop app, not the command line.
- On Windows in Git Bash (or another POSIX shell), a .NET tool install's command is filestarcli.cmd: 'filestarcli' alone is not found there. cmd and PowerShell find either.

## More

- `filestarcli agent readme` prints every command, the JSON shapes, exit codes and error codes, and the plan on this computer.
- `filestarcli account --json` shows the plan and how many free conversions are left.
- Exit codes: 0 ok, 1 some jobs failed (see jobs[].error), 2 usage: a wrong option or parameter, 3 unknown file type, or no skill does that for it, 4 a paid plan (or credits) is required: more than one file in a run, a cloud skill, 5 the free conversions on this computer are used up, 6 network or Filestar service problem, 7 cancelled or timed out.
- Help: https://filestar.com/help/ai-agents

