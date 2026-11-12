"""Raster-process base glyphs into a new styled font, then trace back to TrueType outlines.
usage: python3 build.py marker|western OUTPUT.ttf   (QUICK=1 for a ~120-glyph test build)
"""
import os, sys, math, numpy as np, cv2, freetype
from multiprocessing import Pool
from skimage import measure
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

STYLE = sys.argv[1]
OUT = sys.argv[2]
UPM = 1000
PPEM = 240                       # raster pixels per em
U = UPM / PPEM                   # font units per pixel
NOTO = os.environ.get('NOTO_SERIF', '/usr/share/fonts/opentype/noto/NotoSerifCJK-Black.ttc')
NOTO_IDX = 1 if NOTO.endswith('.ttc') else 0   # .ttc index 1 = KR

def wanted():
    cps = list(range(0x20, 0x7F)) + list(range(0xAC00, 0xD7A4)) + list(range(0x3131, 0x318F))
    cps += [0xA0, 0xB7, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026, 0x203B, 0x2013, 0x2014,
            0x300C, 0x300D, 0x3008, 0x3009, 0x300A, 0x300B, 0x2605, 0x2606, 0x2665, 0x25CB, 0x25CF,
            0x2192, 0x2190, 0x00B0, 0x20A9, 0x00D7]
    import os
    if os.environ.get("QUICK"): cps = [c for c in cps if c < 0x7F] + [ord(x) for x in "겸손할수있을줄알았다그런데힘들황야목장의카우보이"]
    return cps

if STYLE == 'marker':
    SOURCES = [('GamjaFlower-Regular.ttf', 0, None)]
    FAMILY, KFAMILY = 'Mungtuk Marker', '뭉툭마커'
else:
    # Latin from wood-type serif, Hangul & rest from heavy serif
    SOURCES = [('Rye-Regular.ttf', 0, lambda c: c < 0x250 or 0x2010 <= c <= 0x2030),
               (NOTO, NOTO_IDX, None)]
    FAMILY, KFAMILY = 'Hwangya Western', '황야웨스턴'

_faces = {}
def face_for(cp):
    for path, idx, pred in SOURCES:
        if pred is not None and not pred(cp):
            continue
        key = (path, idx)
        if key not in _faces:
            f = freetype.Face(path, index=idx)
            f.set_pixel_sizes(0, PPEM)
            _faces[key] = f
        f = _faces[key]
        if f.get_char_index(cp):
            return f
    return None

def smooth_noise(shape, scale, rng):
    h, w = shape
    small = rng.standard_normal((max(2, h // scale + 2), max(2, w // scale + 2))).astype(np.float32)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)

def process(img, cp):
    rng = np.random.default_rng(cp * 7919 + (1 if STYLE == 'marker' else 2))
    if STYLE == 'marker':
        # thicken to a felt-marker weight with rounded tips
        k = 2 * 4 + 1
        ker = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
        img = cv2.dilate(img, ker)
        img = cv2.GaussianBlur(img, (0, 0), 2.2)
        # gentle hand wobble
        h, w = img.shape
        dx = smooth_noise(img.shape, 40, rng) * 1.6
        dy = smooth_noise(img.shape, 40, rng) * 1.6
        X, Y = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
        img = cv2.remap(img, X + dx, Y + dy, cv2.INTER_LINEAR, borderValue=0)
        # slightly fuzzy ink edge
        img = img + smooth_noise(img.shape, 5, rng) * 0.05
        return img
    else:
        img = cv2.GaussianBlur(img, (0, 0), 0.9)
        # rough, inked edge (multi-scale noise near threshold)
        n = smooth_noise(img.shape, 3, rng) * 0.13 + smooth_noise(img.shape, 9, rng) * 0.12
        img = img + n
        # worn wood-type pits inside the strokes
        pits = smooth_noise(img.shape, 6, rng)
        img = np.where(pits > 2.1, img - 0.9, img)
        return img

def glyph_contours(cp):
    f = face_for(cp)
    if f is None:
        return None
    f.load_char(cp, freetype.FT_LOAD_RENDER | freetype.FT_LOAD_TARGET_NORMAL)
    g = f.glyph
    scale = UPM / (f.units_per_EM)
    adv = g.advance.x / 64.0 * U            # px -> units
    bm = g.bitmap
    pad = 24
    contours = []
    if bm.width and bm.rows:
        a = np.array(bm.buffer, dtype=np.uint8).reshape(bm.rows, bm.pitch)[:, :bm.width]
        img = np.zeros((bm.rows + 2 * pad, bm.width + 2 * pad), np.float32)
        img[pad:pad + bm.rows, pad:pad + bm.width] = a / 255.0
        img = process(img, cp)
        img[0, :] = img[-1, :] = img[:, 0] = img[:, -1] = 0
        for c in measure.find_contours(img, 0.5):
            c = measure.approximate_polygon(c, tolerance=0.35)
            if len(c) < 4:
                continue
            # (row, col) -> font units
            x = (c[:, 1] - pad + g.bitmap_left) * U
            y = (g.bitmap_top - (c[:, 0] - pad)) * U
            pts = np.stack([x, y], 1)[:-1]
            area = 0.5 * np.sum(pts[:, 0] * np.roll(pts[:, 1], -1) - np.roll(pts[:, 0], -1) * pts[:, 1])
            if abs(area) < 150:   # drop specks
                continue
            contours.append(pts)
    extra = 0
    if STYLE == 'marker':
        extra = 2 * U   # dilation radius grows the glyph; widen advance to match
    return cp, adv + 2 * extra, extra, contours

def orient(contours):
    """TrueType wants outer contours clockwise, holes counter-clockwise (y-up)."""
    out = []
    for pts in contours:
        area = 0.5 * np.sum(pts[:, 0] * np.roll(pts[:, 1], -1) - np.roll(pts[:, 0], -1) * pts[:, 1])
        depth = 0
        p = pts[0]
        for other in contours:
            if other is pts:
                continue
            if cv2.pointPolygonTest(other.astype(np.float32).reshape(-1, 1, 2), (float(p[0]), float(p[1])), False) > 0:
                depth += 1
        want_cw = depth % 2 == 0
        if (area < 0) != want_cw:
            pts = pts[::-1]
        out.append(pts)
    return out

def main():
    cps = wanted()
    with Pool() as pool:
        results = [r for r in pool.imap(glyph_contours, cps, chunksize=64) if r]
    order = ['.notdef']
    cmap, glyphs, metrics = {}, {}, {}
    pen = TTGlyphPen(None)
    pen.moveTo((100, 0)); pen.lineTo((100, 700)); pen.lineTo((500, 700)); pen.lineTo((500, 0)); pen.closePath()
    pen.moveTo((150, 50)); pen.lineTo((450, 50)); pen.lineTo((450, 650)); pen.lineTo((150, 650)); pen.closePath()
    glyphs['.notdef'] = pen.glyph(); metrics['.notdef'] = (600, 100)
    ymax, ymin = 0, 0
    for cp, adv, shift, contours in results:
        name = 'uni%04X' % cp
        order.append(name); cmap[cp] = name
        pen = TTGlyphPen(None)
        for pts in orient(contours):
            pts = np.round(pts + [shift, 0]).astype(int)
            pen.moveTo(tuple(pts[0]))
            for q in pts[1:]:
                pen.lineTo(tuple(q))
            pen.closePath()
            ymax = max(ymax, pts[:, 1].max()); ymin = min(ymin, pts[:, 1].min())
        gl = pen.glyph()
        glyphs[name] = gl
        gl.recalcBounds(None)
        lsb = getattr(gl, 'xMin', 0) if contours else 0
        metrics[name] = (int(round(adv)), int(lsb))
    fb = FontBuilder(UPM, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    asc, desc = 880, -120
    fb.setupHorizontalHeader(ascent=max(asc, ymax), descent=min(desc, ymin))
    lic = 'This Font Software is licensed under the SIL Open Font License, Version 1.1.'
    if STYLE == 'marker':
        cpr = 'Derived from Gamja Flower, Copyright (c) YoonDesign Inc. Modifications 2026 by 도겸.'
    else:
        cpr = ('Latin derived from Rye, Copyright (c) 2011 Sorkin Type Co, Reserved Font Name "Rye". '
               'Hangul derived from Noto Serif CJK, Copyright 2017 Adobe, Reserved Font Name "Source". Modifications 2026 by 도겸.')
    names = {'familyName': FAMILY, 'styleName': 'Regular', 'uniqueFontIdentifier': FAMILY.replace(' ', '') + '-2026',
             'fullName': FAMILY, 'psName': FAMILY.replace(' ', '') + '-Regular', 'version': 'Version 1.000',
             'copyright': cpr, 'licenseDescription': lic, 'licenseInfoURL': 'https://openfontlicense.org'}
    fb.setupNameTable(names)
    fb.font['name'].setName(KFAMILY, 1, 3, 1, 0x412)
    fb.font['name'].setName(KFAMILY, 4, 3, 1, 0x412)
    fb.setupOS2(sTypoAscender=asc, sTypoDescender=desc, sTypoLineGap=200,
                usWinAscent=max(asc, ymax), usWinDescent=-min(desc, ymin),
                sxHeight=500, sCapHeight=700, achVendID='DGKM', fsType=0,
                ulUnicodeRange1=0b11, ulUnicodeRange2=(1 << 24) | (1 << 20), ulCodePageRange1=(1 << 0) | (1 << 19))
    fb.setupPost()
    fb.font.save(OUT)
    print('saved', OUT, len(order), 'glyphs')

if __name__ == '__main__':
    main()
