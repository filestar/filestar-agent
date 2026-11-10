#!/usr/bin/env node
// Pins every manifest in this repository to one version of the npm package `filestar`.
//
//   node scripts/bump-version.cjs 30.7.1      pin to that version
//   node scripts/bump-version.cjs --latest    pin to what npm calls latest
//   node scripts/bump-version.cjs --check     exit 1 when any file is not pinned to npm's latest
//
// Plugin directories refuse `npx filestar` and `npx filestar@latest`: every entry names an exact version.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const files = [
  '.mcp.json',
  'mcp.json',
  'plugin.json',
  'server.json',
  'gemini-extension.json',
  '.claude-plugin/plugin.json',
  '.claude-plugin/marketplace.json',
  '.cursor-plugin/plugin.json',
  '.codex-plugin/plugin.json',
  '.agents/plugins/marketplace.json',
  'mcpb/manifest.json',
  'mcpb/server/index.js',
  'skills/filestar/SKILL.md',
  'llms-install.md',
  'README.md',
].filter((f) => fs.existsSync(path.join(root, f)));

const semver = /^\d+\.\d+\.\d+$/;

function latest() {
  return execSync('npm view filestar version', { encoding: 'utf8' }).trim();
}

function pinned() {
  return JSON.parse(fs.readFileSync(path.join(root, 'server.json'), 'utf8')).version;
}

function rewrite(file, version) {
  const full = path.join(root, file);
  let text = fs.readFileSync(full, 'utf8');
  const before = text;
  // filestar@30.7.0 in commands and links
  text = text.replace(/filestar@\d+\.\d+\.\d+/g, `filestar@${version}`);
  // Filestar@30.7.0 (the .NET tool through dnx)
  text = text.replace(/Filestar@\d+\.\d+\.\d+/g, `Filestar@${version}`);
  // the .mcpb launcher's pinned version
  text = text.replace(/const VERSION = '\d+\.\d+\.\d+'/, `const VERSION = '${version}'`);
  if (file.endsWith('.json')) {
    const json = JSON.parse(text);
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if (k === 'version' && typeof v === 'string' && semver.test(v)) node[k] = version;
          else walk(v);
        }
      }
    };
    walk(json);
    text = JSON.stringify(json, null, 2) + '\n';
  }
  if (text !== before) fs.writeFileSync(full, text);
  return text !== before;
}

/** One-click install links for a version; GitHub only keeps https links, so every one here is https. */
function installLinks(version) {
  const args = ['-y', `filestar@${version}`, 'mcp'];
  const config = { command: 'npx', args };
  const b64 = Buffer.from(JSON.stringify(config)).toString('base64');
  const vscode = 'vscode:mcp/install?' + encodeURIComponent(JSON.stringify({ name: 'filestar', type: 'stdio', ...config }));
  return {
    cursor: `https://cursor.com/en/install-mcp?name=filestar&config=${encodeURIComponent(b64)}`,
    vscode: `https://vscode.dev/redirect?url=${encodeURIComponent(vscode)}`,
    kiro: `https://kiro.dev/launch/mcp/add?name=filestar&config=${encodeURIComponent(JSON.stringify(config))}`,
    page: 'https://filestar.com/agents#install',
  };
}

function renderLinks(version) {
  const l = installLinks(version);
  return [
    '<!-- install-links:start (written by scripts/bump-version.cjs) -->',
    // One badge per agent we support (assets/badges, made from each agent's own mark): a one-click link
    // where the agent has one, the install picker on filestar.com otherwise. Spaces keep them on a row.
    [
      ['Claude Code', 'claude-code', l.page],
      ['Claude Desktop', 'claude-desktop', l.page],
      ['Codex', 'codex', l.page],
      ['Cursor', 'cursor', l.cursor],
      ['Gemini CLI', 'gemini-cli', l.page],
      ['GitHub Copilot', 'github-copilot', l.vscode],
      ['VS Code', 'vs-code', l.vscode],
      ['Windsurf', 'windsurf', l.page],
      ['Kiro', 'kiro', l.kiro],
      ['Junie', 'junie', l.page],
      ['LM Studio', 'lm-studio', l.page],
      ['Goose', 'goose', l.page],
      ['Cline', 'cline', l.page],
    ].map(([name, file, href]) => `[![${name}](assets/badges/${file}.svg)](${href})`).join('\n'),
    '<!-- install-links:end -->',
  ].join('\n');
}

function rewriteLinks(version) {
  const full = path.join(root, 'README.md');
  if (!fs.existsSync(full)) return false;
  const text = fs.readFileSync(full, 'utf8');
  const next = text.replace(/<!-- install-links:start[\s\S]*?<!-- install-links:end -->/, renderLinks(version));
  if (next !== text) fs.writeFileSync(full, next);
  return next !== text;
}

module.exports = { installLinks };
if (require.main !== module) return;

const arg = process.argv[2];
if (arg === '--check') {
  const want = latest();
  const have = pinned();
  if (want !== have) {
    console.error(`pinned ${have}, npm latest ${want}`);
    process.exit(1);
  }
  console.log(`pinned to npm latest ${have}`);
  process.exit(0);
}

const version = arg === '--latest' ? latest() : arg;
if (!version || !semver.test(version)) {
  console.error('usage: bump-version.cjs <x.y.z> | --latest | --check');
  process.exit(2);
}
const changed = files.filter((f) => rewrite(f, version));
if (rewriteLinks(version) && !changed.includes('README.md')) changed.push('README.md');
console.log(changed.length ? `pinned ${version}: ${changed.join(', ')}` : `already pinned to ${version}`);
