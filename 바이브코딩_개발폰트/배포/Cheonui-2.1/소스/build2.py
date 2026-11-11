"""천의체 2.0 generator.

Design (why it is built this way):
  * Letters stay full size: the base is Noto Serif KR (SIL OFL 1.1) Hangul, untouched.
  * Ornaments are separate zero-width glyphs that float in the space above the letters
    (y 870-1180), so they never squeeze or cover the text.
  * calt puts ONE ornament on the first syllable of every Hangul word; the rest stay plain.
    Apps without OpenType or colour fonts simply show a clean serif font.
  * ss01 = ornament on every syllable, ss02 = 천의 ribbon instead of cloud, ss03 = none.
  * Ornaments are also in the Private Use Area (U+E000-E007 cloud, U+E010-E017 ribbon)
    for manual insertion in apps without OpenType.

usage: python build2.py SRC.ttf OUT.ttf WEIGHT_NAME
"""
import random, sys, copy
import pathops
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables import otTables as ot
from fontTools import subset
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.pens.reverseContourPen import ReverseContourPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.colorLib.builder import buildCOLR, buildCPAL

import build as B
import variants as V

N_VAR = 8
FAMILY, FAMILY_KO, VERSION = 'Cheonui', '천의체', 2.0
ASCENT = 1300

KEEP = ([(0x20, 0x7E), (0xA0, 0xFF), (0x2010, 0x206F), (0x2190, 0x21FF), (0x2460, 0x24FF),
         (0x25A0, 0x25FF), (0x2600, 0x26FF), (0x3000, 0x303F), (0x3131, 0x318E), (0x3200, 0x32FF),
         (0xAC00, 0xD7A3), (0xFF01, 0xFF5E), (0x2100, 0x215F), (0x20A9, 0x20AC)])

LAYOUTS = [
    [(0, 0, 74), (-88, -18, 56), (84, -22, 50), (-40, -52, 46), (30, -50, 48)],
    [(0, 0, 70), (-80, -10, 60), (-158, -32, 40), (76, -28, 48), (10, -56, 44)],
    [(0, 4, 66), (72, -14, 58), (-70, -20, 52), (140, -38, 38), (-16, -54, 46)],
    [(0, 0, 78), (-92, -26, 48), (88, -26, 48), (0, -60, 40)],
]


# ------------------------------------------------------------------ ornaments
def cloud_orn(k):
    rnd = random.Random(1000 + k)
    s = V.Shape(); S = 2.0
    lay = [(x + rnd.uniform(-6, 6), y + rnd.uniform(-5, 5), r * rnd.uniform(0.93, 1.07))
           for x, y, r in LAYOUTS[k % len(LAYOUTS)]]
    if k >= len(LAYOUTS): lay = [(-x, y, r) for x, y, r in lay]       # mirrored set
    bottom = max(r - y for x, y, r in lay)
    cx = 520 + rnd.uniform(-20, 20); cy = 896 + bottom * S
    for x, y, r in lay: s.disc(cx + x * S, cy + y * S, r * S, 'a')
    big = sorted(lay, key=lambda l: -l[2])
    sg = rnd.choice([-1, 1])
    for j, (x, y, r) in enumerate(big[:2]):
        s.stroke(V.spiral(cx + x * S, cy + y * S, r * S * 0.66, 7, 1.5 - 0.3 * j, sg if j == 0 else -sg),
                 B.LINE * (0.9 - 0.12 * j))
    # tail flows to the left, into the word space
    lx = min(x - r * 0.6 for x, y, r in lay)
    sx, sy = cx + lx * S, cy - 34 * S
    way = [(sx + 50, sy + 4), (sx - 70, sy - 30), (sx - 170, sy + 10), (sx - 250, sy - 24)]
    pts = B.flutter(B.catmull(way, per=10), rnd, amp=(5, 10))
    s.band(pts, [80 * (1 - i / (len(pts) - 1)) ** 0.9 + 2 for i in range(len(pts))], 'b', line=B.LINE * 0.8)
    return s.result()


def ribbon_orn(k):
    rnd = random.Random(2000 + k)
    return B.ribbon((790 + rnd.uniform(-30, 30), 840), rnd, -1, (80, 900, 860),
                    top=1205 + rnd.uniform(-25, 5), width=120, kind='streamer')


# ------------------------------------------------------------------ helpers
def tt_glyph(path):
    pen = TTGlyphPen(None)
    path.draw(ReverseContourPen(Cu2QuPen(pen, 1.0)))
    return pen.glyph()

def walk_lookup_indices(obj, off, seen=None):
    """shift every LookupListIndex found inside a lookup's subtables."""
    if seen is None: seen = set()
    if id(obj) in seen: return
    seen.add(id(obj))
    if isinstance(obj, list):
        for o in obj: walk_lookup_indices(o, off, seen)
        return
    if not hasattr(obj, '__dict__'): return
    for kname, v in list(vars(obj).items()):
        if kname == 'LookupListIndex' and isinstance(v, int):
            setattr(obj, kname, v + off)
        elif isinstance(v, (list,)) or hasattr(v, '__dict__'):
            walk_lookup_indices(v, off, seen)


def merge_gsub(font, tmp, new_tags):
    old = font['GSUB'].table; new = tmp['GSUB'].table
    off = len(old.LookupList.Lookup)
    for lk in new.LookupList.Lookup: walk_lookup_indices(lk.SubTable, off)
    old.LookupList.Lookup.extend(new.LookupList.Lookup)
    old.LookupList.LookupCount = len(old.LookupList.Lookup)
    added = {}
    for fr in new.FeatureList.FeatureRecord:
        fr = copy.deepcopy(fr)
        fr.Feature.LookupListIndex = [i + off for i in fr.Feature.LookupListIndex]
        fr.Feature.LookupCount = len(fr.Feature.LookupListIndex)
        if fr.FeatureTag in added: continue
        added[fr.FeatureTag] = fr
    # existing calt records: append our lookups so every script picks them up
    for fr in old.FeatureList.FeatureRecord:
        if fr.FeatureTag in added:
            fr.Feature.LookupListIndex += added[fr.FeatureTag].Feature.LookupListIndex
            fr.Feature.LookupCount = len(fr.Feature.LookupListIndex)
    base = len(old.FeatureList.FeatureRecord)
    order = list(added)
    for t in order: old.FeatureList.FeatureRecord.append(added[t])
    old.FeatureList.FeatureCount = len(old.FeatureList.FeatureRecord)
    tags = [fr.FeatureTag for fr in old.FeatureList.FeatureRecord]
    for sr in old.ScriptList.ScriptRecord:
        langs = [sr.Script.DefaultLangSys] + [l.LangSys for l in sr.Script.LangSysRecord]
        for ls in langs:
            if ls is None: continue
            have = {tags[i] for i in ls.FeatureIndex}
            for j, t in enumerate(order):
                if t not in have: ls.FeatureIndex.append(base + j)
            ls.FeatureCount = len(ls.FeatureIndex)


# ------------------------------------------------------------------ build
def main(src, out, weight):
    font = TTFont(src)
    opts = subset.Options(); opts.layout_features = ['*']; opts.name_IDs = ['*']
    opts.name_languages = ['*']; opts.glyph_names = True; opts.notdef_outline = True
    opts.hinting = False
    unis = [c for a, b in KEEP for c in range(a, b + 1)]
    sub = subset.Subsetter(opts); sub.populate(unicodes=unis); sub.subset(font)

    cmap = font.getBestCmap()
    hangul = [cmap[c] for c in range(0xAC00, 0xD7A4)]
    order = list(font.getGlyphOrder())

    # ornament glyphs
    orn = {}
    for k in range(N_VAR):
        orn['orn.cloud%d' % k] = cloud_orn(k)
        orn['orn.ribbon%d' % k] = ribbon_orn(k)
        print('ornament', k, file=sys.stderr)
    glyf = font['glyf']; hmtx = font['hmtx']; vmtx = font['vmtx'] if 'vmtx' in font else None
    new_names = []
    def add(name, path):
        g = tt_glyph(path); g.recalcBounds(glyf)
        glyf[name] = g; hmtx[name] = (0, getattr(g, 'xMin', 0))
        if vmtx is not None: vmtx[name] = (1000, 0)
        new_names.append(name)
    for n, r in orn.items():
        add(n, r['mono'])
        for part in ('a', 'b', 'ink'):
            add('%s.%s' % (n, part), r[part])
    add('orn.none', pathops.Path())
    font.setGlyphOrder(order + new_names); glyf.glyphOrder = font.getGlyphOrder()
    if 'post' in font: font['post'].extraNames = []

    # PUA
    for t in font['cmap'].tables:
        if t.isUnicode():
            for k in range(N_VAR):
                t.cmap[0xE000 + k] = 'orn.cloud%d' % k
                if t.format != 4 or True: t.cmap[0xE010 + k] = 'orn.ribbon%d' % k

    # colour
    layers = {}
    for k, n in enumerate(orn):
        idx = int(n[-1])
        ca = idx % 5; cb = (ca + 2 + (idx // 5)) % 5
        if n.startswith('orn.ribbon'): ca, cb = (idx * 2) % 5, (idx * 2 + 1 + idx % 3) % 5
        layers[n] = [(n + '.a', ca), (n + '.b', cb), (n + '.ink', 0xFFFF)]
    font['COLR'] = buildCOLR(layers, version=0)
    font['CPAL'] = buildCPAL([B.PAL_OBANG, B.PAL_DANCHEONG, B.PAL_GOLD])

    # GSUB
    rnd = random.Random(7)
    pick = {g: rnd.randrange(N_VAR) for g in hangul}
    clouds = ['orn.cloud%d' % k for k in range(N_VAR)]
    ribbons = ['orn.ribbon%d' % k for k in range(N_VAR)]
    fea = ['languagesystem DFLT dflt;', 'languagesystem hang dflt;',
           '@H = [%s];' % ' '.join(hangul),
           '@ORN = [%s];' % ' '.join(clouds + ribbons),
           '@CLOUD = [%s];' % ' '.join(clouds), '@RIBBON = [%s];' % ' '.join(ribbons),
           'lookup INS {']
    fea += ['  sub %s by orn.cloud%d %s;' % (g, pick[g], g) for g in hangul]
    fea += ['} INS;',
            'lookup CTX { ignore sub @H @H\', @ORN @H\'; sub @H\' lookup INS; } CTX;',
            'lookup SWAP { sub @CLOUD by @RIBBON; } SWAP;',
            'lookup NONE { sub @ORN by orn.none; } NONE;',
            'feature ss01 { featureNames { name "Ornament on every syllable"; name 3 1 0x0412 "모든 글자 장식"; }; lookup INS; } ss01;',
            'feature calt { lookup CTX; } calt;',
            'feature ss02 { featureNames { name "Ribbon ornament"; name 3 1 0x0412 "천의 리본 장식"; }; lookup SWAP; } ss02;',
            'feature ss03 { featureNames { name "No ornament"; name 3 1 0x0412 "장식 없음"; }; lookup NONE; } ss03;']
    tmp = TTFont(); tmp.setGlyphOrder(font.getGlyphOrder())
    tmp['name'] = newTable('name'); tmp['name'].names = []
    addOpenTypeFeaturesFromString(tmp, '\n'.join(fea), tables=['GSUB', 'name'])
    # featureNames went to tmp's name table: copy those records (IDs >= 256)
    nm = font['name']
    used = max([n.nameID for n in nm.names] + [255])
    remap = {}
    for rec in tmp['name'].names:
        if rec.nameID not in remap: used += 1; remap[rec.nameID] = used
        nm.setName(rec.toUnicode(), remap[rec.nameID], rec.platformID, rec.platEncID, rec.langID)
    for fr in tmp['GSUB'].table.FeatureList.FeatureRecord:
        fp = fr.Feature.FeatureParams
        if fp is not None and hasattr(fp, 'UINameID'): fp.UINameID = remap[fp.UINameID]
    merge_gsub(font, tmp, ['calt', 'ss01', 'ss02', 'ss03'])
    gdef = font['GDEF'].table if 'GDEF' in font else None
    if gdef is not None and gdef.GlyphClassDef:
        for n in new_names: gdef.GlyphClassDef.classDefs[n] = 1

    # names & metrics
    full = '%s %s' % (FAMILY, weight); ps = '%s-%s' % (FAMILY, weight)
    for i in (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 25):
        nm.removeNames(nameID=i)
    nm.setName('© 2017-2023 Adobe (http://www.adobe.com/), with Reserved Font Name "Source". '
               'Based on Noto Serif KR. Ornaments and modifications (천의체 / Cheonui) © 2026 도겸.', 0, 3, 1, 0x409)
    nm.setName('Hangul: Sandoll Communications, Soohyun PARK, Yejin WE & Donghoon HAN; '
               'Latin: Frank Griesshammer (Source Han Serif / Noto Serif KR). Cheonui ornaments: 도겸, 2026.', 9, 3, 1, 0x409)
    ribbi = weight in ('Regular', 'Bold')
    for lang, fam in ((0x409, FAMILY), (0x412, FAMILY_KO)):
        nm.setName(fam if ribbi else '%s %s' % (fam, weight), 1, 3, 1, lang)
        nm.setName(weight if ribbi else 'Regular', 2, 3, 1, lang)
        nm.setName('%s %s' % (fam, weight), 4, 3, 1, lang)
    nm.setName('%s;%s' % (VERSION, ps), 3, 3, 1, 0x409)
    nm.setName('Version %.3f' % VERSION, 5, 3, 1, 0x409)
    nm.setName(ps, 6, 3, 1, 0x409)
    nm.setName('This Font Software is licensed under the SIL Open Font License, Version 1.1.', 13, 3, 1, 0x409)
    nm.setName('https://openfontlicense.org', 14, 3, 1, 0x409)
    for lang, fam in ((0x409, FAMILY), (0x412, FAMILY_KO)):
        nm.setName(fam, 16, 3, 1, lang); nm.setName(weight, 17, 3, 1, lang)
    font['head'].fontRevision = VERSION
    font['head'].macStyle = 1 if weight == 'Bold' else 0
    font['hhea'].ascent = ASCENT
    o = font['OS/2']; o.usWinAscent = ASCENT; o.fsType = 0; o.achVendID = 'NONE'
    o.usWeightClass = {'Regular': 400, 'Bold': 700, 'Black': 900}[weight]
    o.fsSelection = (o.fsSelection & ~0b1100001) | (0b100000 if weight == 'Bold' else 0b1000000 if weight == 'Regular' else 0)
    if 'STAT' in font: del font['STAT']
    font.save(out)
    print('saved', out, len(font.getGlyphOrder()), 'glyphs', file=sys.stderr)


if __name__ == '__main__':
    main(*sys.argv[1:4])
