#!/usr/bin/env python3
"""
Checks that catch the exact kind of regressions found by hand this repo's
history: broken internal links, a sitemap that's fallen out of sync with
the real pages, and malformed feed/sitemap/manifest files.

Run locally with: python3 scripts/check_site.py
Exits non-zero (and fails CI) if any check fails.
"""
import glob
import os
import re
import sys
import xml.etree.ElementTree as ET
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

errors = []


def check_internal_links():
    existing_files = set(os.path.basename(f) for f in glob.glob('*') if os.path.isfile(f))
    anchors = {}
    for f in glob.glob('*.html'):
        with open(f, encoding='utf-8') as fh:
            anchors[f] = set(re.findall(r'id="([^"]+)"', fh.read()))

    for f in glob.glob('*.html'):
        with open(f, encoding='utf-8') as fh:
            content = fh.read()
        hrefs = re.findall(r'href="([^"]+)"', content) + re.findall(r'src="([^"]+)"', content)
        for href in hrefs:
            if href.startswith(('http://', 'https://', 'mailto:', 'tel:', 'data:')):
                continue
            if href.startswith('#'):
                target_file, anchor = f, href[1:]
            elif href == '/':
                target_file, anchor = 'index.html', None
            elif '#' in href:
                target_file, anchor = href.split('#', 1)
            else:
                target_file, anchor = href, None
            target_file = target_file.lstrip('/')
            if target_file == '':
                target_file = f
            # known subpaths not necessarily present as flat files in repo root
            if target_file.startswith(('assets/', 'blog/', 'research/', 'data/')):
                continue
            if target_file not in existing_files:
                errors.append(f'{f}: href="{href}" — target "{target_file}" not found')
                continue
            if anchor and target_file.endswith('.html'):
                if target_file in anchors and anchor not in anchors[target_file]:
                    errors.append(f'{f}: href="{href}" — anchor #{anchor} not found in {target_file}')


def check_sitemap_freshness():
    if not os.path.exists('sitemap.xml'):
        errors.append('sitemap.xml is missing entirely')
        return
    from urllib.parse import urlparse
    tree = ET.parse('sitemap.xml')
    ns = {'s': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    listed = set()
    for url in tree.getroot().findall('s:url', ns):
        loc = url.find('s:loc', ns).text
        path = urlparse(loc).path.lstrip('/')
        listed.add(path if path else 'index.html')

    # pages intentionally excluded from the sitemap (dynamic template / noindex)
    excluded = {'project.html', '404.html', 'now.html'}
    real_pages = set(glob.glob('*.html')) - excluded

    for page in real_pages:
        if page not in listed:
            errors.append(f'sitemap.xml: "{page}" exists but is not listed')


def check_xml_json_validity():
    for f in ['sitemap.xml', 'feed.xml']:
        if os.path.exists(f):
            try:
                ET.parse(f)
            except ET.ParseError as e:
                errors.append(f'{f}: invalid XML — {e}')
    if os.path.exists('feed.json'):
        try:
            fj = json.load(open('feed.json'))
            if not fj.get('version', '').startswith('https://jsonfeed.org/version/'):
                errors.append('feed.json: missing or wrong "version"')
            if not isinstance(fj.get('items'), list) or not fj['items']:
                errors.append('feed.json: "items" is empty')
        except json.JSONDecodeError as e:
            errors.append(f'feed.json: invalid JSON — {e}')
    if os.path.exists('manifest.json'):
        try:
            json.load(open('manifest.json'))
        except json.JSONDecodeError as e:
            errors.append(f'manifest.json: invalid JSON — {e}')


def check_jsonld_validity():
    for f in glob.glob('*.html'):
        with open(f, encoding='utf-8') as fh:
            content = fh.read()
        for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.DOTALL):
            try:
                json.loads(block)
            except json.JSONDecodeError as e:
                errors.append(f'{f}: invalid JSON-LD block — {e}')


def check_weight_budget():
    # keeps pages light: no ad-hoc heavy files sneaking in
    budgets = [('*.html', 200_000), ('styles.css', 150_000), ('script.js', 60_000), ('assets/fonts/*.woff2', 60_000), ('assets/og/*.png', 150_000)]
    for pattern, limit in budgets:
        for f in glob.glob(pattern):
            size = os.path.getsize(f)
            if size > limit:
                errors.append(f'{f}: {size:,} bytes exceeds the {limit:,}-byte budget')


check_internal_links()
check_weight_budget()
check_sitemap_freshness()
check_xml_json_validity()
check_jsonld_validity()

if errors:
    print(f'{len(errors)} issue(s) found:\n')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
else:
    print('All checks passed: internal links, sitemap freshness, XML/JSON/JSON-LD validity, weight budget.')
