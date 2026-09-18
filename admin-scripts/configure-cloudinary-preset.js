/**
 * Locks down the unsigned Cloudinary upload preset (bug NEW-22).
 *
 * THE PROBLEM
 * -----------
 * The preset name ships inside the public client bundle, because unsigned
 * uploads are the only option without a paid Firebase plan. That is an
 * accepted trade-off ONLY while the preset itself is restricted, since
 * the browser-side checks in src/utils/validation.js can be skipped with
 * a single curl call.
 *
 * A QA probe on 2026-09-18 found none of those restrictions configured:
 * a GIF and a BMP were both accepted, uploads landed in the account root,
 * and the ceiling was Cloudinary's 10 MB default rather than 5 MB.
 *
 * WHAT THIS DOES
 * --------------
 * Sets all three in one step, so they cannot be mistyped:
 *
 *     allowed_formats  jpg, png, webp
 *     max_file_size    5000000  (5 MB)
 *     folder           meshape/products
 *
 * CREDENTIALS
 * -----------
 * The Admin API needs your Cloudinary API key and secret. Supply them as
 * environment variables so they are never typed into a file, never
 * committed, and never pasted into a chat:
 *
 *   Windows (PowerShell):
 *     $env:CLOUDINARY_API_KEY="..."; $env:CLOUDINARY_API_SECRET="..."
 *     node admin-scripts/configure-cloudinary-preset.js
 *
 *   macOS / Linux:
 *     CLOUDINARY_API_KEY=... CLOUDINARY_API_SECRET=... \
 *       node admin-scripts/configure-cloudinary-preset.js
 *
 * Find both under Settings → API Keys in the Cloudinary console. The
 * SECRET is sensitive: treat it like a password, and do not put it in
 * .env.local, which is committed to this repository's history.
 *
 * USAGE
 * -----
 *   node admin-scripts/configure-cloudinary-preset.js            # preview
 *   node admin-scripts/configure-cloudinary-preset.js --apply    # change
 *
 * It previews by default and changes nothing until you pass --apply, so
 * you can see the current settings before touching anything.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED = {
  allowed_formats: 'jpg,png,webp',
  max_file_size: 5000000,
  folder: 'meshape/products',
};

function readEnvLocal() {
  const file = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      })
  );
}

const env = readEnvLocal();
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || env.VITE_CLOUDINARY_CLOUD_NAME;
const presetName = process.env.CLOUDINARY_UPLOAD_PRESET || env.VITE_CLOUDINARY_UPLOAD_PRESET;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const apply = process.argv.includes('--apply');

if (!cloudName || !presetName) {
  console.error('Could not determine the cloud name or preset. Check .env.local.');
  process.exit(2);
}
if (!apiKey || !apiSecret) {
  console.error('Missing credentials.\n');
  console.error('  Set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, then re-run.');
  console.error('  Both are under Settings → API Keys in the Cloudinary console.');
  console.error('  See the comment at the top of this file for the exact command.\n');
  console.error('If you would rather not use the API, set these three by hand instead:');
  console.error(`  Settings → Upload → Upload presets → ${presetName} → Edit`);
  console.error('    Allowed formats: jpg, png, webp');
  console.error('    Max file size:   5000000');
  console.error('    Folder:          meshape/products');
  process.exit(2);
}

const auth = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
const base = `https://api.cloudinary.com/v1_1/${cloudName}/upload_presets`;

async function callApi(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: auth, ...(options.headers || {}) },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 200) };
  }
  if (!res.ok) {
    const msg = body?.error?.message || body?.raw || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return body;
}

function describe(settings) {
  return {
    allowed_formats: Array.isArray(settings?.allowed_formats)
      ? settings.allowed_formats.join(',')
      : settings?.allowed_formats || '(any)',
    max_file_size: settings?.max_file_size ?? '(Cloudinary default, 10 MB)',
    folder: settings?.folder || '(account root)',
  };
}

(async () => {
  console.log(`Preset "${presetName}" on cloud "${cloudName}"\n`);

  let current;
  try {
    current = await callApi(`${base}/${encodeURIComponent(presetName)}`);
  } catch (e) {
    console.error('Could not read the preset: ' + e.message);
    if (String(e.message).startsWith('401')) {
      console.error('That usually means the API key or secret is wrong.');
    }
    process.exitCode = 1;
    return;
  }

  const before = describe(current.settings);
  console.log('  current settings');
  console.log(`    allowed_formats  ${before.allowed_formats}`);
  console.log(`    max_file_size    ${before.max_file_size}`);
  console.log(`    folder           ${before.folder}`);
  console.log(`    unsigned         ${current.unsigned}`);

  const drift = [];
  if (before.allowed_formats !== REQUIRED.allowed_formats) drift.push('allowed_formats');
  if (Number(current.settings?.max_file_size) !== REQUIRED.max_file_size) drift.push('max_file_size');
  if ((current.settings?.folder || '') !== REQUIRED.folder) drift.push('folder');

  if (drift.length === 0) {
    console.log('\nAlready correct — nothing to change.');
    process.exitCode = 0;
    return;
  }

  console.log(`\n  needs changing: ${drift.join(', ')}`);
  console.log('  target settings');
  console.log(`    allowed_formats  ${REQUIRED.allowed_formats}`);
  console.log(`    max_file_size    ${REQUIRED.max_file_size}`);
  console.log(`    folder           ${REQUIRED.folder}`);

  if (!apply) {
    console.log('\nPreview only — nothing was changed.');
    console.log('Re-run with --apply to write these settings.');
    process.exitCode = 0;
    return;
  }

  const form = new URLSearchParams({
    allowed_formats: REQUIRED.allowed_formats,
    max_file_size: String(REQUIRED.max_file_size),
    folder: REQUIRED.folder,
    // Keep it unsigned: the client has no way to sign, and flipping this
    // would break every admin image upload.
    unsigned: 'true',
  });

  try {
    await callApi(`${base}/${encodeURIComponent(presetName)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    });
  } catch (e) {
    console.error('\nUpdate failed: ' + e.message);
    process.exitCode = 1;
    return;
  }

  const after = describe((await callApi(`${base}/${encodeURIComponent(presetName)}`)).settings);
  console.log('\n  applied — settings are now');
  console.log(`    allowed_formats  ${after.allowed_formats}`);
  console.log(`    max_file_size    ${after.max_file_size}`);
  console.log(`    folder           ${after.folder}`);
  console.log('\nNow confirm it actually enforces them:');
  console.log('  node admin-scripts/verify-cloudinary-preset.js');
  process.exitCode = 0;
  return;
})().catch((e) => {
  console.error('Failed to run: ' + e.message);
  process.exitCode = 2;
});
