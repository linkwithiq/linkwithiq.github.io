#!/usr/bin/env python3
"""
Sets each sitemap <lastmod> from the page's real last commit date in git, so dates
stay accurate without hand-editing.   Usage: python3 scripts/update_lastmod.py
Pages with no git history are left unchanged.
"""
import os, re, subprocess
from urllib.parse import urlparse

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
xml = open('sitemap.xml', encoding='utf-8').read()


def last_commit_date(path):
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', path], capture_output=True, text=True, check=True).stdout.strip()
        return out or None
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def fix(match):
    loc = match.group(1)
    path = urlparse(loc).path.lstrip('/') or 'index.html'
    date = last_commit_date(path)
    if not date or not os.path.exists(path):
        return match.group(0)
    return f'<loc>{loc}</loc>\n    <lastmod>{date}</lastmod>'


new = re.sub(r'<loc>([^<]+)</loc>\s*<lastmod>[^<]*</lastmod>', fix, xml)
if new != xml:
    open('sitemap.xml', 'w', encoding='utf-8').write(new)
    print('sitemap.xml updated')
else:
    print('sitemap.xml already up to date (or no git history found)')
