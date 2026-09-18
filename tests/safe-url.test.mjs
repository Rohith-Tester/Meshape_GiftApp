/**
 * Tests for the stored-URL guard (security audit 2026-09-18, finding
 * SEC-04). Run with:
 *
 *   npm test
 *
 * These are the payloads that matter: `instagramUrl` and the entries of
 * `images` are written by an admin into Firestore and then rendered into
 * an <a href> and an <img src> on pages every customer sees. React
 * escapes text but does NOT sanitize href values, so a stored
 * `javascript:` URL renders as a working script link. safeExternalUrl
 * and safeImageUrl are the single chokepoint every one of those render
 * paths goes through.
 */
import { safeExternalUrl, safeImageUrl } from '../src/utils/safeUrl.js';

let pass = 0;
let fail = 0;

/**
 * @param label     what the case demonstrates
 * @param input     the value as it would arrive from Firestore
 * @param wantExt   expected safeExternalUrl result (null = refuse)
 * @param wantImg   expected safeImageUrl result (null = refuse)
 */
function check(label, input, wantExt, wantImg) {
  const gotExt = safeExternalUrl(input);
  const gotImg = safeImageUrl(input);
  const ok = gotExt === wantExt && gotImg === wantImg;
  if (ok) {
    console.log(`  PASS  ${label}`);
    pass += 1;
  } else {
    console.log(`  FAIL  ${label}`);
    console.log(`          external: got ${JSON.stringify(gotExt)}, want ${JSON.stringify(wantExt)}`);
    console.log(`          image:    got ${JSON.stringify(gotImg)}, want ${JSON.stringify(wantImg)}`);
    fail += 1;
  }
}

console.log('\n--- Script-bearing URLs are refused ---');
check('javascript: scheme', 'javascript:alert(1)', null, null);
check('javascript: with mixed case', 'JaVaScRiPt:alert(1)', null, null);
check('javascript: padded with whitespace', '  javascript:alert(1)  ', null, null);
check('javascript: with an embedded newline', 'java\nscript:alert(1)', null, null);
check('vbscript: scheme', 'vbscript:msgbox(1)', null, null);
check('data: carrying HTML', 'data:text/html,<script>alert(1)</script>', null, null);
check('data: carrying base64 HTML', 'data:text/html;base64,PHNjcmlwdD4=', null, null);
check('data: image (refused too - keeps what loads predictable)', 'data:image/png;base64,iVBORw0KGgo=', null, null);
check('blob: scheme', 'blob:https://example.com/abc', null, null);
check('file: scheme', 'file:///etc/passwd', null, null);

console.log('\n--- Genuine links still work ---');
check('https Instagram post', 'https://www.instagram.com/p/abc/', 'https://www.instagram.com/p/abc/', 'https://www.instagram.com/p/abc/');
check('plain http', 'http://example.com/a.jpg', 'http://example.com/a.jpg', 'http://example.com/a.jpg');
check('Cloudinary delivery URL', 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/a.jpg');
check('https with query and fragment', 'https://example.com/a?b=1#c', 'https://example.com/a?b=1#c', 'https://example.com/a?b=1#c');

console.log('\n--- Relative paths: images only, never external links ---');
check("the app's own placeholder asset", '/meshape-logo.png', null, '/meshape-logo.png');
check('protocol-relative URL is refused as ambiguous', '//evil.com/x.jpg', null, null);
check('bare relative path is not a valid URL', 'images/a.jpg', null, null);

console.log('\n--- Junk and wrong types degrade safely ---');
check('empty string', '', null, null);
check('whitespace only', '   ', null, null);
check('not a URL at all', 'not a url', null, null);
check('null', null, null, null);
check('undefined', undefined, null, null);
check('a number', 42, null, null);
check('an object', {}, null, null);
check('an array', [], null, null);

console.log(`\n==== ${pass} passed, ${fail} failed ====`);
process.exit(fail ? 1 : 0);
