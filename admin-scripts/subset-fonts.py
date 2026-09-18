#!/usr/bin/env python3
"""
Rebuilds the self-hosted webfonts in public/fonts (NEW-23).

WHY THIS EXISTS
---------------
The files Google Fonts serves are already subset by unicode range, but
they are still full variable fonts. Fraunces carries an `opsz` (optical
size) axis spanning 9-144 and a `wght` axis spanning 100-900, and the
per-glyph deltas for all of that are most of the file: the two Fraunces
files alone were 149 kB, on a page whose entire JavaScript bundle is
about 100 kB gzipped.

This script pins `opsz` and narrows `wght` to the range the site
actually uses, then drops the glyphs it never renders. That takes all
six files from 320 kB to 168 kB with no visible change to headings at
the sizes this site sets them.

THE TRADE-OFF, STATED PLAINLY
-----------------------------
Pinning `opsz` disables CSS `font-optical-sizing`. Fraunces will no
longer subtly adjust its stroke contrast between a 72px hero headline
and an 18px card title — every size gets the design drawn for 36pt.
Side by side at large sizes the difference is visible to someone
looking for it. It was judged worth 78 kB on the critical path; if you
disagree, raise OPSZ or remove it from FRAUNCES_AXES and re-run.

REQUIREMENTS
------------
    pip install fonttools brotli

USAGE
-----
    python admin-scripts/subset-fonts.py            # rebuild in place
    python admin-scripts/subset-fonts.py --check    # verify, change nothing

Run it from the repository root. It reads and writes public/fonts, and
it needs the ORIGINAL Google Fonts files to work from — once a file has
been subset, re-running this against it gains nothing, because the axes
are already pinned. Keep the originals if you expect to re-tune;
otherwise re-download them from Google Fonts first.
"""
import argparse
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / 'public' / 'fonts'

# The optical size Fraunces is instanced at. 36pt sits between the hero
# headline (roughly 31-54pt) and the section/card headings (16-26pt).
OPSZ = 36

# Weight range the stylesheets actually request. src/styles/fonts.css
# declares `font-weight: 400 700` for both families; keep these in step.
WEIGHT_RANGE = '400:700'

# Basic Latin, Latin-1, the punctuation the copy uses (en/em dashes,
# curly quotes, ellipsis) and the rupee sign. Product names come from
# Firestore, so this is deliberately wider than the strings in the repo.
UNICODES_LATIN = ','.join([
    'U+0020-007E', 'U+00A0-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC',
    'U+02C6', 'U+02DA', 'U+02DC', 'U+2000-206F', 'U+20AC', 'U+20B9',
    'U+2122', 'U+2190-2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD',
])

# The `-ext` files only ever need to cover what the Latin files do not.
UNICODES_EXT = ','.join([
    'U+0100-017F', 'U+0180-024F', 'U+1E00-1EFF', 'U+2020-2021',
    'U+20A0-20BF', 'U+2113', 'U+2C60-2C7F', 'U+A720-A7FF',
])


def run(cmd):
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit(f'Command failed: {" ".join(str(c) for c in cmd)}\n{result.stderr[-1000:]}')


def rebuild(source: pathlib.Path, workdir: pathlib.Path) -> pathlib.Path:
    """Instance the variable axes, subset the glyphs, return the new file."""
    # fontTools' instancer will not read woff2, so decompress first.
    decompressed = workdir / 'decompressed.ttf'
    run([
        sys.executable, '-c',
        f"from fontTools.ttLib import TTFont; f = TTFont(r'{source}'); "
        f"f.flavor = None; f.save(r'{decompressed}')",
    ])

    axes = [f'wght={WEIGHT_RANGE}']
    if 'fraunces' in source.name:
        axes.insert(0, f'opsz={OPSZ}')

    instanced = workdir / 'instanced.ttf'
    run([sys.executable, '-m', 'fontTools.varLib.instancer', str(decompressed), *axes, '-o', str(instanced)])

    subset = workdir / source.name
    unicodes = UNICODES_EXT if '-ext' in source.name else UNICODES_LATIN
    run([
        'pyftsubset', str(instanced),
        f'--output-file={subset}',
        '--flavor=woff2',
        f'--unicodes={unicodes}',
        '--layout-features=*',
        '--no-hinting',
        '--desubroutinize',
    ])
    return subset


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true',
                        help='report the sizes that would result, write nothing')
    args = parser.parse_args()

    sources = sorted(FONT_DIR.glob('*.woff2'))
    if not sources:
        raise SystemExit(f'No .woff2 files found in {FONT_DIR}')

    total_before = total_after = 0
    with tempfile.TemporaryDirectory() as tmp:
        workdir = pathlib.Path(tmp)
        for source in sources:
            rebuilt = rebuild(source, workdir)
            before, after = source.stat().st_size, rebuilt.stat().st_size
            total_before += before
            total_after += after
            verb = 'would be' if args.check else '->'
            print(f'{source.name:45s} {before:7d} {verb} {after:7d}')
            if not args.check:
                shutil.move(str(rebuilt), str(source))

    saved = total_before - total_after
    percent = round(100 * saved / total_before) if total_before else 0
    print(f'{"TOTAL":45s} {total_before:7d} -> {total_after:7d}  ({percent}% smaller)')
    if args.check:
        print('\n--check: nothing was written.')


if __name__ == '__main__':
    main()
