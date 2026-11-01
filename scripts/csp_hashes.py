#!/usr/bin/env python3
"""
Re-computes the CSP hashes for inline <script> blocks on every page and writes
them into each page's Content-Security-Policy meta tag. Run this after you edit
any inline script:   python3 scripts/csp_hashes.py
(check_site.py fails if a page's inline script isn't covered by its CSP.)
"""
import base64, glob, hashlib, os, re

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def PAGES():
    return sorted(glob.glob('*.html') + glob.glob('blog/*.html') + glob.glob('research/*.html'))


def inline_scripts(html):
    return [body for attrs, body in re.findall(r'<script(?![^>]*\ssrc=)([^>]*)>(.*?)</script>', html, re.S)
            if 'ld+json' not in attrs]


def digest(body):
    return "'sha256-" + base64.b64encode(hashlib.sha256(body.encode()).digest()).decode() + "'"


if __name__ == '__main__':
    for f in sorted(PAGES()):
        html = open(f, encoding='utf-8').read()
        hashes = ' '.join(dict.fromkeys(digest(b) for b in inline_scripts(html)))
        new = re.sub(r"script-src 'self'[^;]*;", "script-src 'self'" + (' ' + hashes if hashes else '') + ';', html, count=1)
        if new != html:
            open(f, 'w', encoding='utf-8').write(new)
            print('updated', f)
