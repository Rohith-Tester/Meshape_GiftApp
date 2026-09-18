/**
 * Verifies that the unsigned Cloudinary upload preset actually enforces
 * the restrictions this project depends on.
 *
 * WHY THIS EXISTS
 * ---------------
 * The upload preset name is public — it ships inside the client bundle,
 * because unsigned uploads are the only option without a paid Firebase
 * plan (see src/utils/cloudinaryUpload.js). That is an accepted risk,
 * but it is only acceptable while the preset itself is locked down in
 * the Cloudinary dashboard.
 *
 * For a long time the code claimed those restrictions were in place.
 * They were not: a QA probe on 2026-09-18 uploaded a GIF and a BMP
 * successfully, into the account root, with a 10 MB ceiling instead of
 * 5 MB. Nothing in the app can detect that — which is exactly why it
 * went unnoticed. This script turns it into something you can check.
 *
 * WHAT IT DOES
 * ------------
 * Attempts four small uploads and reports what the preset allows. Files
 * that are ACCEPTED become real assets in your Cloudinary account — they
 * are tiny (a few hundred bytes) and named so you can find and delete
 * them, but be aware they are created.
 *
 * USAGE
 * -----
 *   node admin-scripts/verify-cloudinary-preset.js
 *
 * Reads VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET
 * from .env.local, or takes them as arguments:
 *
 *   node admin-scripts/verify-cloudinary-preset.js <cloudName> <preset>
 *
 * Exits non-zero if any restriction is missing, so it can gate a deploy.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const cloudName = process.argv[2] || env.VITE_CLOUDINARY_CLOUD_NAME;
const preset = process.argv[3] || env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !preset) {
  console.error('Missing cloud name or preset. Pass them as arguments, or set them in .env.local.');
  process.exit(2);
}

/** Minimal valid files, built in memory — no fixtures needed. */
const FILES = {
  jpg: Buffer.from(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a' +
      'HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAA' +
      'AAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==',
    'base64'
  ),
  gif: Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'),
  bmp: Buffer.from(
    'Qk1aAAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABgAAAAAAAAAAADEDgAAxA4AAAAAAAAAAAAA////AA==',
    'base64'
  ),
};

async function attempt(label, buffer, filename, type) {
  const form = new FormData();
  form.append('file', new Blob([buffer], { type }), filename);
  form.append('upload_preset', preset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });
  const body = await res.json().catch(() => ({}));
  if (body.error) return { label, accepted: false, reason: body.error.message };
  return {
    label,
    accepted: true,
    folder: body.public_id.includes('/') ? body.public_id.split('/').slice(0, -1).join('/') : '(root)',
    url: body.secure_url,
  };
}

(async () => {
  console.log(`Probing preset "${preset}" on cloud "${cloudName}"…\n`);
  const problems = [];

  const jpg = await attempt('JPG (should be ACCEPTED)', FILES.jpg, 'qa-probe.jpg', 'image/jpeg');
  const gif = await attempt('GIF (should be REJECTED)', FILES.gif, 'qa-probe.gif', 'image/gif');
  const bmp = await attempt('BMP (should be REJECTED)', FILES.bmp, 'qa-probe.bmp', 'image/bmp');

  for (const r of [jpg, gif, bmp]) {
    console.log(`  ${r.accepted ? 'ACCEPTED' : 'rejected'}  ${r.label}`);
    if (r.accepted) console.log(`            folder: ${r.folder}  ${r.url}`);
    else console.log(`            ${r.reason}`);
  }

  if (!jpg.accepted) problems.push('JPG uploads are failing — the preset may be misconfigured or disabled.');
  if (gif.accepted) problems.push('Allowed formats are NOT restricted: a GIF was accepted.');
  if (bmp.accepted) problems.push('Allowed formats are NOT restricted: a BMP was accepted.');
  if (jpg.accepted && jpg.folder === '(root)') {
    problems.push('No fixed folder: uploads land in the account root.');
  }

  console.log('\n' + '-'.repeat(60));
  if (problems.length === 0) {
    console.log('PASS — the preset enforces the expected restrictions.');
    console.log('Note: delete the qa-probe asset(s) this script just created.');
    process.exitCode = 0;
    return;
  }
  console.log('FAIL — the preset is more permissive than the project assumes:\n');
  problems.forEach((p) => console.log('  • ' + p));
  console.log('\nFix in the Cloudinary dashboard:');
  console.log('  Settings → Upload → Upload presets → ' + preset + ' → Edit');
  console.log('    Allowed formats: jpg, png, webp');
  console.log('    Max file size:   5000000');
  console.log('    Folder:          meshape/products');
  console.log('\nThen delete any qa-probe assets this script created, and re-run it.');
  process.exitCode = 1;
  return;
})().catch((e) => {
  console.error('Probe failed to run:', e.message);
  process.exitCode = 2;
});
