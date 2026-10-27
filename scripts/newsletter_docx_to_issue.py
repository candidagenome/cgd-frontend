#!/usr/bin/env python3
"""
Convert a CGD Newsletter issue written in MS Word (.docx) into a newsletter
issue page for the frontend.

Usage:
    python3 scripts/newsletter_docx_to_issue.py "path/to/Fall 2026.docx" [--force]

What it does:
  * writes src/pages/newsletter/issues/<Name>.jsx (e.g. Fall2026.jsx)
  * extracts images to public/images/newsletter/<issue-id>/figure-N.<ext>
  * registers the issue in src/pages/newsletter/issues/index.js, in date order
    (newest first), so old issues can be added in any order

How the Word document is read:
  * "CGD Newsletter, <Season Year>" (first line) gives the issue title. The
    season (Winter, Spring, Summer, Fall/Autumn) or a month name and the year
    place the issue in the archive.
  * A short paragraph that is entirely bold (or uses a Heading style) starts a
    new article. "Research Spotlight: ..." articles get the spotlight styling.
  * The "About this newsletter" article is skipped (that text is on the
    newsletter archive page).
  * Hyperlinks, italics, bold, superscript/subscript, bulleted/numbered lists
    and images are kept. Links to candidagenome.org become site-relative.
  * Empty paragraphs (often used as spacing around images) are ignored.

Review the generated page before committing it.
"""
import argparse
import calendar
import html
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
R = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
A = '{http://schemas.openxmlformats.org/drawingml/2006/main}'
WP = '{http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing}'
PKG_REL = '{http://schemas.openxmlformats.org/package/2006/relationships}'

REPO = Path(__file__).resolve().parent.parent
ISSUES_DIR = REPO / 'src' / 'pages' / 'newsletter' / 'issues'
IMAGES_DIR = REPO / 'public' / 'images' / 'newsletter'
EMU_PER_PX = 9525

CGD_HOST = re.compile(r'^https?://(www\.)?candidagenome\.org', re.I)
# Old-site paths that moved in the new site
CGD_PATH_MAP = {
    '/cgi-bin/suggestion': '/contact',
}
# Site paths served outside the single-page app (plain links, not <Link>)
NON_SPA_PREFIXES = ('/download/', '/jbrowse2/', '/jbrowse/')
# Months used to order issues titled by season
SEASON_MONTH = {'winter': 1, 'spring': 4, 'summer': 7, 'fall': 10, 'autumn': 10}
# An issue entry in index.js, as register() writes it
ISSUE_ENTRY = re.compile(r"^  \{\n    id: '[^']+',\n    title: '((?:[^'\\]|\\.)*)'", re.M)


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def issue_date(title):
    """(year, month) of an issue title like "Fall 2026" or "March 2011", or None."""
    months = {name.lower(): i for i, name in enumerate(calendar.month_name) if name}
    months.update({name.lower(): i for i, name in enumerate(calendar.month_abbr) if name})
    for word, year in re.findall(r'([A-Za-z]+)\.?\s+(\d{4})\b', title):
        month = SEASON_MONTH.get(word.lower()) or months.get(word.lower())
        if month:
            return int(year), month
    return None


def jsx_text(text):
    text = html.escape(text, quote=False)
    return text.replace('{', '&#123;').replace('}', '&#125;')


def flag_on(rpr, name):
    el = rpr.find(W + name) if rpr is not None else None
    return el is not None and el.get(W + 'val') not in ('0', 'false')


class Docx:
    def __init__(self, path):
        self.zip = zipfile.ZipFile(path)
        self.rels = {
            r.get('Id'): r.get('Target')
            for r in ET.fromstring(self.zip.read('word/_rels/document.xml.rels')).iter(PKG_REL + 'Relationship')
        }
        self.styles = {}
        if 'word/styles.xml' in self.zip.namelist():
            for s in ET.fromstring(self.zip.read('word/styles.xml')).iter(W + 'style'):
                name = s.find(W + 'name')
                self.styles[s.get(W + 'styleId')] = name.get(W + 'val') if name is not None else ''
        self.list_formats = self._read_numbering()
        self.body = ET.fromstring(self.zip.read('word/document.xml')).find(W + 'body')

    def _read_numbering(self):
        """numId -> {ilvl: 'bullet'|'decimal'|...}"""
        if 'word/numbering.xml' not in self.zip.namelist():
            return {}
        root = ET.fromstring(self.zip.read('word/numbering.xml'))
        abstract = {}
        for an in root.iter(W + 'abstractNum'):
            levels = {}
            for lvl in an.iter(W + 'lvl'):
                fmt = lvl.find(W + 'numFmt')
                levels[lvl.get(W + 'ilvl')] = fmt.get(W + 'val') if fmt is not None else 'bullet'
            abstract[an.get(W + 'abstractNumId')] = levels
        result = {}
        for num in root.iter(W + 'num'):
            ref = num.find(W + 'abstractNumId')
            result[num.get(W + 'numId')] = abstract.get(ref.get(W + 'val'), {}) if ref is not None else {}
        return result


class Paragraph:
    def __init__(self, style, list_info, parts):
        self.style = style            # paragraph style name
        self.list_info = list_info    # (ordered: bool, level: int) or None
        # [('text', str, fmt) | ('link', url, [text parts]) | ('img', target, width) | ('br',)]
        self.parts = parts

    @property
    def text(self):
        out = []
        for p in self.parts:
            if p[0] == 'text':
                out.append(p[1])
            elif p[0] == 'link':
                out.extend(t[1] for t in p[2])
        return ''.join(out)

    @property
    def images(self):
        return [p for p in self.parts if p[0] == 'img']

    def all_bold(self):
        runs = [p for p in self.parts if p[0] == 'text' and p[1].strip()]
        runs += [t for p in self.parts if p[0] == 'link' for t in p[2] if t[1].strip()]
        return bool(runs) and all('b' in fmt for _, _, fmt in runs)


def read_runs(doc, container):
    parts = []
    for child in container:
        tag = child.tag
        if tag == W + 'hyperlink':
            target = doc.rels.get(child.get(R + 'id')) or ('#' + (child.get(W + 'anchor') or ''))
            inner = [p for p in read_runs(doc, child) if p[0] == 'text']
            parts.append(('link', target, inner))
        elif tag == W + 'r':
            rpr = child.find(W + 'rPr')
            fmt = ''
            if flag_on(rpr, 'i'):
                fmt += 'i'
            if flag_on(rpr, 'b'):
                fmt += 'b'
            va = rpr.find(W + 'vertAlign') if rpr is not None else None
            if va is not None and va.get(W + 'val') in ('superscript', 'subscript'):
                fmt += 'sup' if va.get(W + 'val') == 'superscript' else 'sub'
            for el in child:
                if el.tag == W + 't':
                    parts.append(('text', el.text or '', fmt))
                elif el.tag == W + 'tab':
                    parts.append(('text', ' ', fmt))
                elif el.tag in (W + 'br', W + 'cr'):
                    parts.append(('br',))
                elif el.tag == W + 'drawing':
                    blip = el.find('.//' + A + 'blip')
                    extent = el.find('.//' + WP + 'extent')
                    if blip is not None:
                        width = round(int(extent.get('cx')) / EMU_PER_PX) if extent is not None else None
                        parts.append(('img', doc.rels[blip.get(R + 'embed')], width))
        elif tag in (W + 'smartTag', W + 'ins', W + 'sdt', W + 'sdtContent', W + 'fldSimple'):
            parts.extend(read_runs(doc, child))
    return parts


def read_paragraphs(doc):
    paragraphs = []
    for el in doc.body.iter(W + 'p'):
        ppr = el.find(W + 'pPr')
        style, list_info = '', None
        if ppr is not None:
            ps = ppr.find(W + 'pStyle')
            if ps is not None:
                style = doc.styles.get(ps.get(W + 'val'), ps.get(W + 'val'))
            num = ppr.find(W + 'numPr')
            if num is not None and num.find(W + 'numId') is not None:
                num_id = num.find(W + 'numId').get(W + 'val')
                ilvl = num.find(W + 'ilvl').get(W + 'val') if num.find(W + 'ilvl') is not None else '0'
                fmt = doc.list_formats.get(num_id, {}).get(ilvl, 'bullet')
                if num_id != '0':
                    list_info = (fmt not in ('bullet', 'none'), int(ilvl))
        paragraphs.append(Paragraph(style, list_info, read_runs(doc, el)))
    return paragraphs


# ---------------------------------------------------------------- rendering

def render_link(url, inner_jsx):
    url = url.strip()
    m = CGD_HOST.match(url)
    if m:
        path = url[m.end():] or '/'
        path = CGD_PATH_MAP.get(path.rstrip('/'), path)
        if path.startswith(NON_SPA_PREFIXES):
            return f'<a href="{path}">{inner_jsx}</a>'
        return f'<Link to="{path}">{inner_jsx}</Link>'
    if url.startswith('#'):
        return f'<a href="{url}">{inner_jsx}</a>'
    return f'<a href="{html.escape(url)}" target="_blank" rel="noopener noreferrer">{inner_jsx}</a>'


def render_runs(runs, drop_bold=False):
    """Render text runs, merging neighbours with the same formatting."""
    merged = []
    for _, text, fmt in runs:
        if drop_bold:
            fmt = fmt.replace('b', '')
        if merged and merged[-1][1] == fmt:
            merged[-1][0] += text
        else:
            merged.append([text, fmt])
    out = []
    for text, fmt in merged:
        # Keep surrounding whitespace outside the formatting tags
        lead = text[:len(text) - len(text.lstrip())]
        trail = text[len(text.rstrip()):]
        core = jsx_text(text.strip())
        if core:
            if 'sup' in fmt:
                core = f'<sup>{core}</sup>'
            if 'sub' in fmt:
                core = f'<sub>{core}</sub>'
            if 'i' in fmt:
                core = f'<em>{core}</em>'
            if 'b' in fmt:
                core = f'<strong>{core}</strong>'
        out.append(jsx_text(lead) + core + jsx_text(trail))
    return ''.join(out)


def render_inline(parts, drop_bold=False):
    out, pending = [], []

    def flush():
        if pending:
            out.append(render_runs(pending, drop_bold))
            pending.clear()
    for p in parts:
        if p[0] == 'text':
            pending.append(p)
        elif p[0] == 'link':
            flush()
            out.append(render_link(p[1], render_runs(p[2], drop_bold)))
        elif p[0] == 'br':
            flush()
            out.append('<br />')
    flush()
    text = ''.join(out)
    text = re.sub(r'(?:&#160;|\s)+', ' ', text).strip()
    # JSX collapses whitespace around line breaks; keep the space before a tag
    # that follows text explicitly so it is not lost when the line is wrapped.
    return text


def is_title(par):
    text = par.text.strip()
    if not text or par.images or par.list_info:
        return False
    if par.style.lower().startswith('heading'):
        return True
    return par.all_bold() and len(text) < 250


# ---------------------------------------------------------------- main

def convert(docx_path, force=False):
    doc = Docx(docx_path)
    paragraphs = read_paragraphs(doc)

    # Issue title from the first non-empty paragraph: "CGD Newsletter, Fall 2026"
    first = next((p for p in paragraphs if p.text.strip()), None)
    m = re.match(r'^\s*CGD Newsletter,?\s*(.+?)\s*$', first.text if first else '', re.I)
    if not m:
        sys.exit('First line must be "CGD Newsletter, <Season Year>"')
    title = m.group(1)
    if issue_date(title) is None:
        sys.exit(f'Cannot date the issue "{title}": the first line must name a season '
                 '(Winter, Spring, Summer, Fall) or a month, and a year, e.g. "CGD Newsletter, Fall 2026"')
    issue_id = slug(title)
    component = re.sub(r'[^A-Za-z0-9]', '', title.title())
    if not component or component[0].isdigit():
        component = 'Issue' + component

    out_file = ISSUES_DIR / f'{component}.jsx'
    if out_file.exists() and not force:
        sys.exit(f'{out_file} exists; use --force to overwrite')

    # Group paragraphs into articles
    articles, current = [], None
    for par in paragraphs[paragraphs.index(first) + 1:]:
        if is_title(par):
            current = {'title_parts': par.parts, 'title': par.text.strip(), 'body': []}
            articles.append(current)
        elif current is not None:
            current['body'].append(par)
    articles = [a for a in articles if not a['title'].lower().startswith('about this newsletter')]

    img_dir = IMAGES_DIR / issue_id
    img_dir.mkdir(parents=True, exist_ok=True)
    figure_no = 0
    lines = []
    registry_articles = []

    for art in articles:
        spotlight = re.match(r'^\s*research spotlight\s*:\s*', art['title'], re.I)
        title_parts = art['title_parts']
        if spotlight:
            # Drop the "Research Spotlight:" prefix from the rendered heading
            remaining = len(spotlight.group(0))
            trimmed = []
            for p in title_parts:
                if remaining > 0 and p[0] == 'text':
                    cut = min(remaining, len(p[1]))
                    remaining -= cut
                    if p[1][cut:]:
                        trimmed.append(('text', p[1][cut:], p[2]))
                else:
                    trimmed.append(p)
            title_parts = trimmed
        heading = render_inline(title_parts, drop_bold=True)
        plain_heading = re.sub(r'<[^>]+>', '', heading)
        art_id = 'research-spotlight' if spotlight else slug(html.unescape(plain_heading))
        registry_title = ('Research Spotlight: ' if spotlight else '') + html.unescape(plain_heading)
        registry_articles.append((art_id, registry_title))

        cls = 'newsletter-article newsletter-spotlight' if spotlight else 'newsletter-article'
        lines.append(f'      <section className="{cls}" id="{art_id}">')
        if spotlight:
            lines.append('        <p className="newsletter-kicker">Research Spotlight</p>')
        lines.append(f'        <h2>{heading}</h2>')

        open_lists = []  # stack of 'ul'/'ol'
        for par in art['body']:
            text_jsx = render_inline([p for p in par.parts if p[0] != 'img'])
            if par.list_info and text_jsx:
                ordered, level = par.list_info
                tag = 'ol' if ordered else 'ul'
                while len(open_lists) > level + 1:
                    lines.append('        ' + '  ' * (len(open_lists) - 1) + f'</{open_lists.pop()}>')
                while len(open_lists) < level + 1:
                    lines.append('        ' + '  ' * len(open_lists) + f'<{tag}>')
                    open_lists.append(tag)
                lines.append('        ' + '  ' * len(open_lists) + f'<li>{text_jsx}</li>')
            else:
                while open_lists:
                    lines.append('        ' + '  ' * (len(open_lists) - 1) + f'</{open_lists.pop()}>')
                if text_jsx:
                    lines.append(f'        <p>{text_jsx}</p>')
            for _, target, width in par.images:
                figure_no += 1
                ext = Path(target).suffix.lower() or '.png'
                name = f'figure-{figure_no}{ext}'
                (img_dir / name).write_bytes(doc.zip.read('word/' + target.lstrip('/')))
                style = f" style={{{{ maxWidth: '{width}px' }}}}" if width else ''
                lines.append('        <figure className="newsletter-figure">')
                lines.append(f'          <img src={{`${{IMG}}/{name}`}} alt="Figure {figure_no}"{style} />')
                lines.append(f'          <figcaption>Figure {figure_no}</figcaption>')
                lines.append('        </figure>')
        while open_lists:
            lines.append('        ' + '  ' * (len(open_lists) - 1) + f'</{open_lists.pop()}>')
        lines.append('      </section>')
        lines.append('')

    body = '\n'.join(lines).rstrip()
    uses_link = '<Link ' in body
    page = (
        "import React from 'react';\n"
        + ("import { Link } from 'react-router-dom';\n" if uses_link else '')
        + '\n'
        + f'// CGD Newsletter, {title}. Generated from "{Path(docx_path).name}" by\n'
        + '// scripts/newsletter_docx_to_issue.py; edit freely after review.\n'
        + '// Each article is a <section> whose id matches an entry in issues/index.js.\n'
        + f"const IMG = '/images/newsletter/{issue_id}';\n\n"
        + f'function {component}() {{\n  return (\n    <>\n{body}\n    </>\n  );\n}}\n\n'
        + f'export default {component};\n'
    )
    out_file.write_text(page)

    register(issue_id, title, component, registry_articles)
    print(f'Wrote {out_file.relative_to(REPO)}')
    print(f'Wrote {figure_no} image(s) to {img_dir.relative_to(REPO)}/')
    print(f'Articles: {[t for _, t in registry_articles]}')


def register(issue_id, title, component, articles):
    index = ISSUES_DIR / 'index.js'
    src = index.read_text()
    if f"id: '{issue_id}'" in src:
        print(f'index.js already has {issue_id}; left unchanged')
        return
    imports_end = list(re.finditer(r'^import .*$', src, re.M))[-1].end()
    src = src[:imports_end] + f"\nimport {component} from './{component}';" + src[imports_end:]
    art_lines = '\n'.join(
        f"      {{ id: '{aid}', title: {js_string(atitle)} }}," for aid, atitle in articles)
    entry = (f"  {{\n    id: '{issue_id}',\n    title: '{title}',\n    articles: [\n{art_lines}\n    ],\n"
             f"    Component: {component},\n  }},\n")
    # Before the first issue older than this one (the list is newest first)
    start = src.index('export const NEWSLETTER_ISSUES = [\n')
    end = src.index('\n];', start) + 1
    date = issue_date(title)
    pos = end
    for m in ISSUE_ENTRY.finditer(src, start, end):
        other = issue_date(m.group(1))
        if other is not None and other < date:
            pos = m.start()
            break
    src = src[:pos] + entry + src[pos:]
    index.write_text(src)
    print(f'Registered {issue_id} in {index.relative_to(REPO)}')


def js_string(s):
    return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('docx')
    ap.add_argument('--force', action='store_true', help='overwrite an existing issue file')
    args = ap.parse_args()
    convert(args.docx, args.force)
