#!/usr/bin/env python3
"""
Checks that catch the kinds of regressions found by hand in this repo's history:
broken internal links and anchors, a sitemap that has fallen out of sync with the
real pages, inline scripts not covered by the CSP, malformed feed/sitemap/manifest
files, and files that have grown too heavy.

Run locally with: python3 scripts/check_site.py
Exits non-zero (and fails CI) if any check fails.
"""
import glob
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse, unquote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
sys.path.insert(0, os.path.join(ROOT, 'scripts'))
from csp_hashes import PAGES, inline_scripts, digest  # noqa: E402

errors = []
# pages intentionally left out of the sitemap (client-rendered template / error page / placeholder)
SITEMAP_EXCLUDED = {'project.html', '404.html', 'now.html'}


def read(path):
    with open(path, encoding='utf-8') as fh:
        return fh.read()


def check_internal_links():
    anchors = {f: set(re.findall(r'\sid="([^"]+)"', read(f))) for f in PAGES()}
    for f in PAGES():
        content = read(f)
        here = os.path.dirname(f)
        for href in re.findall(r'(?:href|src)="([^"]+)"', content):
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'data:', 'javascript:')):
                continue
            path, _, anchor = href.partition('#')
            path = path.split('?')[0]
            if path == '':
                target = f
            elif path.startswith('/'):
                target = path.lstrip('/') or 'index.html'
            else:
                target = os.path.normpath(os.path.join(here, path))
            target = unquote(target)
            if os.path.isdir(target):
                target = os.path.join(target, 'index.html')
            if not os.path.exists(target):
                errors.append(f'{f}: href="{href}": target "{target}" not found')
                continue
            if anchor and target.endswith('.html') and target in anchors and anchor not in anchors[target]:
                errors.append(f'{f}: href="{href}": anchor #{anchor} not found in {target}')


def check_csp_covers_inline_scripts():
    for f in PAGES():
        html = read(f)
        m = re.search(r'script-src([^;]*);', html)
        policy = m.group(1) if m else ''
        if "'unsafe-inline'" in policy:
            errors.append(f'{f}: script-src allows unsafe-inline; use hashes (python3 scripts/csp_hashes.py)')
        for body in inline_scripts(html):
            if digest(body) not in policy:
                errors.append(f'{f}: an inline script is not covered by the CSP; run python3 scripts/csp_hashes.py')


def check_weight_budget():
    budgets = [('*.html', 200_000), ('blog/*.html', 200_000), ('research/*.html', 200_000), ('styles.css', 150_000),
               ('script.js', 60_000), ('assets/fonts/*.woff2', 60_000), ('assets/og/*.png', 150_000)]
    for pattern, limit in budgets:
        for f in glob.glob(pattern):
            size = os.path.getsize(f)
            if size > limit:
                errors.append(f'{f}: {size:,} bytes exceeds the {limit:,}-byte budget')


def check_sitemap_freshness():
    if not os.path.exists('sitemap.xml'):
        errors.append('sitemap.xml is missing entirely')
        return
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    listed = set()
    for url in ET.parse('sitemap.xml').getroot().findall('s:url', ns):
        path = urlparse(url.find('s:loc', ns).text).path.lstrip('/')
        listed.add(path if path else 'index.html')
    for page in set(PAGES()) - SITEMAP_EXCLUDED:
        if page not in listed:
            errors.append(f'sitemap.xml: "{page}" exists but is not listed')
    for path in listed:
        if not os.path.exists(path):
            errors.append(f'sitemap.xml: lists "{path}" but that file does not exist')


def check_xml_json_validity():
    for f in ['sitemap.xml', 'feed.xml']:
        if os.path.exists(f):
            try:
                ET.parse(f)
            except ET.ParseError as e:
                errors.append(f'{f}: invalid XML: {e}')
    if os.path.exists('feed.json'):
        try:
            fj = json.load(open('feed.json', encoding='utf-8'))
            if not fj.get('version', '').startswith('https://jsonfeed.org/version/'):
                errors.append('feed.json: missing or wrong "version"')
            if not isinstance(fj.get('items'), list) or not fj['items']:
                errors.append('feed.json: "items" is empty')
        except json.JSONDecodeError as e:
            errors.append(f'feed.json: invalid JSON: {e}')
    if os.path.exists('manifest.json'):
        try:
            for icon in json.load(open('manifest.json', encoding='utf-8')).get('icons', []):
                if not os.path.exists(icon['src']):
                    errors.append(f'manifest.json: icon "{icon["src"]}" does not exist')
        except json.JSONDecodeError as e:
            errors.append(f'manifest.json: invalid JSON: {e}')


def check_jsonld_validity():
    for f in PAGES():
        for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', read(f), re.DOTALL):
            try:
                json.loads(block)
            except json.JSONDecodeError as e:
                errors.append(f'{f}: invalid JSON-LD block: {e}')


def check_no_stale_claims():
    # things that were removed on purpose and must not creep back in
    banned = [('hello@linkwithiq.dev', 'old email address'), ('fonts.googleapis.com', 'Google Fonts (fonts are self-hosted)'),
              ('data-theme', 'theme toggle remnant')]
    for f in PAGES() + ['script.js', 'styles.css']:
        text = read(f)
        for needle, why in banned:
            if needle in text:
                errors.append(f'{f}: contains "{needle}": {why}')


check_internal_links()
check_csp_covers_inline_scripts()
check_weight_budget()
check_sitemap_freshness()
check_xml_json_validity()
check_jsonld_validity()
check_no_stale_claims()

if errors:
    print(f'{len(errors)} issue(s) found:\n')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
print('All checks passed: links, anchors, CSP, sitemap, feeds, JSON-LD, weight budget, removed features.')
