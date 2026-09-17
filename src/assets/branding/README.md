# Craft Tech logo — placement instructions

This project does **not** generate or redraw the Craft Tech logo. The
official logo (blue/cyan/purple "C" icon + white `</>` code symbol +
"Craft Tech" wordmark + tagline "Turning Ideas into Digital Solutions")
must be supplied by the client as an image file and placed at the
project root's **`public/`** folder (not here in `src/`):

```
public/craft-tech-logo.svg
```

**Phase 10 QA fix:** earlier phases instructed placing this file under
`src/assets/branding/` and referencing it as `/src/assets/branding/...`.
That path only resolves during `npm run dev` — Vite's dev server happens
to serve the whole project root, so it looked correct locally. A
production `vite build` never copies arbitrary files out of `src/` into
`dist/`; only files placed in `public/` (served as-is at the site root)
or assets explicitly `import`-ed in JS get bundled. The old setup would
have silently 404'd in production, invisibly masked by the text-fallback
in `Footer.jsx` — so the client's real logo would never have actually
appeared on the live site. `public/` is correct; this folder is now
documentation-only.

(An `.svg` is preferred for crisp scaling in the footer/admin shell; a
high-resolution `.png` with a transparent background also works — if you
use `.png`, update `agency.logoPath` in `src/config/business.js` to
match the new filename, e.g. `/craft-tech-logo.png`.)

Once the file is placed in `public/`, `Footer.jsx` and the admin shell
will pick it up automatically — no other code changes are needed.

Until the real file is added, the site renders a plain text lockup
("Craft Tech") in its place so the layout never shows a broken image.
