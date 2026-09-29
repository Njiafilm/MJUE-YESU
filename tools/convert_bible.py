#!/usr/bin/env python3
"""Geuza Biblia (CSV/TSV) kuwa app/src/main/assets/www/bible/kjv_sw.js

Faili la kuingiza: safu 4 — code, sura, aya, maandishi
  GEN,1,1,"Hapo mwanzo Mungu aliumba mbingu na dunia."
code = herufi 3 za kitabu kama zilivyo kwenye programu (GEN, EXO, PSA, MAT, JHN, 1CO, REV ...)

Matumizi:
  python3 tools/convert_bible.py biblia.csv
"""
import csv, json, sys, os
src = sys.argv[1]
delim = '\t' if src.lower().endswith('.tsv') else ','
data = {}
with open(src, encoding='utf-8-sig', newline='') as f:
    for row in csv.reader(f, delimiter=delim):
        if len(row) < 4 or not row[1].strip().isdigit():
            continue
        code, ch, v, text = row[0].strip().upper(), row[1].strip(), row[2].strip(), ','.join(row[3:]).strip()
        data.setdefault(code, {}).setdefault(ch, {})[v] = text
out = os.path.join(os.path.dirname(__file__), '..', 'app', 'src', 'main', 'assets', 'www', 'bible', 'kjv_sw.js')
os.makedirs(os.path.dirname(out), exist_ok=True)
with open(out, 'w', encoding='utf-8') as f:
    f.write('window.MJUE_YESU_TRANSLATIONS=window.MJUE_YESU_TRANSLATIONS||{};\n')
    f.write('window.MJUE_YESU_BIBLE_SOURCE_KJVSW="KJV Kiswahili";\n')
    f.write('window.MJUE_YESU_TRANSLATIONS.KJVSW=' + json.dumps(data, ensure_ascii=False) + ';\n')
print('Vitabu:', len(data), '· Aya:', sum(len(v) for c in data.values() for v in c.values()), '→', os.path.normpath(out))
