#!/usr/bin/env node
// Filestar MCP server launcher for Claude Desktop (.mcpb), Bosma Interactive AB, MIT.
//
// Claude Desktop runs extensions with its own Node.js and no npx, so this launcher does what `npx -y filestar@<v> mcp`
// does: it fetches the Filestar CLI for this platform from npm once (the package npm itself would install), checks
// its sha512, keeps it under ~/.filestar/mcpb/<version>/, and runs `FilestarCli mcp` with this process's stdio.
// Nothing else is downloaded or sent. Uses only Node's standard library.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const zlib = require('zlib');
const crypto = require('crypto');
const { spawn } = require('child_process');

const VERSION = '30.8.0';
const PLATFORMS = { 'win32-x64': 1, 'win32-ia32': 1, 'darwin-x64': 1, 'darwin-arm64': 1, 'linux-x64': 1 };
const key = `${process.platform}-${process.arch}`;
const log = (m) => process.stderr.write(`filestar: ${m}\n`);

function get(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': `filestar-mcpb/${VERSION}`, Accept: '*/*' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects > 0) {
          res.resume();
          return resolve(get(new URL(res.headers.location, url).toString(), redirects - 1));
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${url} answered ${res.statusCode}`));
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

/** Writes a .tgz's files under `dir`, dropping npm's leading `package/`. */
function untar(tgz, dir) {
  const tar = zlib.gunzipSync(tgz);
  let longName = null;
  for (let off = 0; off + 512 <= tar.length; ) {
    const header = tar.subarray(off, off + 512);
    if (header.every((b) => b === 0)) break;
    const field = (start, len) => header.subarray(start, start + len).toString('utf8').replace(/\0.*$/s, '');
    const size = parseInt(field(124, 12).trim() || '0', 8);
    const mode = parseInt(field(100, 8).trim() || '644', 8);
    const type = String.fromCharCode(header[156] || 48);
    const prefix = field(345, 155);
    let name = longName ?? (prefix ? `${prefix}/${field(0, 100)}` : field(0, 100));
    longName = null;
    const body = tar.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
    if (type === 'L') {
      longName = body.toString('utf8').replace(/\0.*$/s, '');
      continue;
    }
    if (type !== '0' && type !== '\0' && type !== '5') continue;
    name = name.replace(/^package\//, '');
    const target = path.resolve(dir, name);
    if (!target.startsWith(path.resolve(dir) + path.sep)) throw new Error(`unsafe path in package: ${name}`);
    if (type === '5') {
      fs.mkdirSync(target, { recursive: true });
      continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, body, { mode: mode & 0o777 });
  }
}

async function ensureCli() {
  const base = path.join(os.homedir(), '.filestar', 'mcpb', VERSION, key);
  const exe = path.join(base, 'filestar', process.platform === 'win32' ? 'FilestarCli.exe' : 'FilestarCli');
  if (fs.existsSync(path.join(base, '.complete'))) return exe;

  const name = `@bosmainteractive/filestar-cli-${key}`;
  log(`first start: fetching ${name}@${VERSION} from npm (about 100 MB, once)`);
  const meta = JSON.parse((await get(`https://registry.npmjs.org/${name.replace('/', '%2f')}/${VERSION}`)).toString('utf8'));
  const tgz = await get(meta.dist.tarball);
  const [algo, want] = meta.dist.integrity.split('-');
  const have = crypto.createHash(algo).update(tgz).digest('base64');
  if (have !== want) throw new Error(`${name}@${VERSION}: ${algo} does not match npm's integrity`);

  const temp = `${base}.tmp-${process.pid}`;
  fs.rmSync(temp, { recursive: true, force: true });
  untar(tgz, temp);
  fs.rmSync(base, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(base), { recursive: true });
  fs.renameSync(temp, base);
  fs.writeFileSync(path.join(base, '.complete'), `${VERSION}\n`);
  log('ready');
  return exe;
}

async function main() {
  if (!PLATFORMS[key]) {
    log(`there is no Filestar CLI for ${key}. See https://filestar.com/help/installation/other-ways-to-install`);
    process.exit(1);
  }
  const exe = await ensureCli();
  const child = spawn(exe, ['mcp', ...process.argv.slice(2)], { stdio: 'inherit' });
  child.on('error', (e) => {
    log(e.message);
    process.exit(1);
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => child.kill(s));
}

main().catch((e) => {
  log(e.message);
  process.exit(1);
});
