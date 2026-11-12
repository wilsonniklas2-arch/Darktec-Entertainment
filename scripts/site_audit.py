#!/usr/bin/env python3
"""DARKTEC static-site quality checks for GitHub Pages."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json, sys

ROOT = Path(__file__).resolve().parents[1]
ERRORS = []
WARNINGS = []

class Links(HTMLParser):
    def __init__(self):
        super().__init__(); self.items=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        for key in ("href","src"):
            value=attrs.get(key)
            if value: self.items.append((tag,key,value))

def local_target(page, value):
    u=urlsplit(value)
    if u.scheme or u.netloc or value.startswith(("mailto:","tel:","data:","javascript:")): return None
    raw=unquote(u.path)
    if not raw: return None
    if raw.startswith("/Darktec-Entertainment/"): raw=raw[len("/Darktec-Entertainment/"):]
    elif raw.startswith("/"): raw=raw[1:]
    else: raw=str((page.parent / raw).relative_to(ROOT))
    target=(ROOT / raw).resolve()
    try: target.relative_to(ROOT.resolve())
    except ValueError: return None
    if target.is_dir(): target=target/"index.html"
    return target

html_files=sorted(ROOT.rglob("*.html"))
for page in html_files:
    parser=Links()
    try: parser.feed(page.read_text(encoding="utf-8"))
    except Exception as exc:
        ERRORS.append(f"{page.relative_to(ROOT)}: HTML read/parse error: {exc}"); continue
    for tag,key,value in parser.items:
        target=local_target(page,value)
        if target is not None and not target.exists():
            ERRORS.append(f"{page.relative_to(ROOT)}: broken {key}={value}")

data_path=ROOT/"data/festivals/festivals-2027.json"
try:
    data=json.loads(data_path.read_text(encoding="utf-8"))
    festivals=data.get("festivals",[])
    if data.get("total") not in (None,len(festivals)):
        ERRORS.append("festival JSON total does not match festivals array length")
    seen={}
    for i,f in enumerate(festivals):
        name=f.get("name")
        if not name: ERRORS.append(f"festival record {i}: missing name")
        for key in ("continent","country","officialWebsite","sources"):
            if not f.get(key): WARNINGS.append(f"festival record {i} ({name}): missing {key}")
        lat,lon=f.get("latitude"),f.get("longitude")
        if not isinstance(lat,(int,float)) or not isinstance(lon,(int,float)) or not (-90<=lat<=90 and -180<=lon<=180):
            ERRORS.append(f"festival record {i} ({name}): invalid coordinates")
        if name: seen.setdefault(name,[]).append(i)
    for name,indices in seen.items():
        if len(indices)>1: WARNINGS.append(f"duplicate festival name ({len(indices)} records): {name}")
    approved=sum(f.get("directoryStatus")=="APPROVED" for f in festivals)
    held=sum(f.get("directoryStatus")=="HOLD" for f in festivals)
    print(f"HTML pages checked: {len(html_files)}")
    print(f"Festival records: {len(festivals)} | approved: {approved} | hold: {held}")
except Exception as exc:
    ERRORS.append(f"festival JSON validation failed: {exc}")

for warning in WARNINGS: print("WARNING:",warning)
for error in ERRORS: print("ERROR:",error)
print(f"Result: {len(ERRORS)} errors, {len(WARNINGS)} warnings")
sys.exit(1 if ERRORS else 0)
