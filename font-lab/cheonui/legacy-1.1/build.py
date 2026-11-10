"""천의체 (Cheonui) font generator.

Base outlines: Song Myung (SIL OFL 1.1, Copyright 2018 The SongMyung Project Authors).
Each Hangul syllable is shrunk slightly and a flowing, twisting celestial-robe ribbon
(천의, as worn by the twelve zodiac guardians in Korean folk painting) rises from the
top of its main vowel. Ribbons are drawn as ink outlines (hollow), like the painted originals.

usage: python build.py OUT.otf [LIMIT_CHARS]
"""
import math, random, sys
import pathops
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.fontBuilder import FontBuilder
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString

SRC = sys.argv[3] if len(sys.argv) > 3 else 'SongMyung-Regular.ttf'
SX, SY, YBASE, XC = 0.82, 0.74, -120, 500     # shrink Hangul to leave room for the ribbon
LINE = 20                                      # ink outline thickness of the ribbon
STRIPE = 13                                    # white fold line inside the ribbon
WIDTH = 120                                    # max ribbon width
PAL_OBANG = [(0.72, 0.19, 0.18, 1), (0.17, 0.36, 0.66, 1), (0.10, 0.54, 0.47, 1),
             (0.87, 0.64, 0.12, 1), (0.86, 0.43, 0.54, 1)]          # 적·청·청록·황·분홍
PAL_DANCHEONG = [(0.55, 0.10, 0.10, 1), (0.10, 0.22, 0.45, 1), (0.05, 0.38, 0.33, 1),
                 (0.70, 0.50, 0.10, 1), (0.66, 0.28, 0.36, 1)]      # deeper, 단청 tone
PAL_GOLD = [(0.80, 0.62, 0.22, 1), (0.70, 0.52, 0.16, 1), (0.88, 0.72, 0.32, 1),
            (0.62, 0.45, 0.14, 1), (0.92, 0.80, 0.45, 1)]           # 금박
X_LIMIT = 70                                   # leftmost x the ribbon body may reach
TOP = 960                                      # ribbon crest height


# ------------------------------------------------------------------ geometry helpers
class Flatten(BasePen):
    def __init__(self, gs=None, steps=8):
        super().__init__(gs); self.contours = []; self.cur = None; self.steps = steps
    def _moveTo(self, p): self.cur = [p]
    def _lineTo(self, p): self.cur.append(p)
    def _curveToOne(self, p1, p2, p3):
        p0 = self.cur[-1]
        for i in range(1, self.steps + 1):
            t = i / self.steps; u = 1 - t
            self.cur.append((u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
                             u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1]))
    def _qCurveToOne(self, p1, p2):
        p0 = self.cur[-1]
        for i in range(1, self.steps + 1):
            t = i / self.steps; u = 1 - t
            self.cur.append((u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0], u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]))
    def _closePath(self):
        if self.cur and len(self.cur) > 2: self.contours.append(self.cur)
        self.cur = None
    _endPath = _closePath


def area(poly):
    return 0.5 * sum(poly[i][0]*poly[i-1][1] - poly[i-1][0]*poly[i][1] for i in range(len(poly)))

def bbox(poly):
    xs = [p[0] for p in poly]; ys = [p[1] for p in poly]
    return min(xs), min(ys), max(xs), max(ys)

def poly_path(pts):
    p = pathops.Path(); pen = p.getPen()
    pen.moveTo(pts[0])
    for q in pts[1:]: pen.lineTo(q)
    pen.closePath(); return p

def clean(p):
    """normalise one shape on its own: resolve overlaps (non-zero), then fix directions.
    Safe for a single glyph or a single ribbon piece."""
    p = pathops.simplify(p, fix_winding=False)
    return pathops.simplify(p, fix_winding=True)

def union(paths):
    """boolean union; each operand's inside is judged on its own, so differing contour
    directions between operands can never cancel or fill anything."""
    paths = list(paths)
    res = clean(paths[0])
    for p in paths[1:]:
        res = pathops.op(res, clean(p), pathops.PathOp.UNION, fix_winding=True)
    return res

def difference(a, cut):
    res = clean(a)
    for c in cut:
        res = pathops.op(res, clean(c), pathops.PathOp.DIFFERENCE, fix_winding=True)
    return res

def to_path(glyph, transform=None):
    p = pathops.Path(); pen = p.getPen()
    glyph.draw(TransformPen(pen, transform) if transform else pen)
    return p

def flatten(path):
    fp = Flatten(); path.draw(fp); return fp.contours


# ------------------------------------------------------------------ the ribbon (천의)
def bezier(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t**3*p3[0],
            u**3*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t**3*p3[1])

def sides(center, widths):
    L, R = [], []
    n = len(center)
    for i, (x, y) in enumerate(center):
        a = center[max(i-1, 0)]; b = center[min(i+1, n-1)]
        dx, dy = b[0]-a[0], b[1]-a[1]; d = math.hypot(dx, dy) or 1
        nx, ny = -dy/d, dx/d; w = widths[i] / 2
        L.append((x + nx*w, y + ny*w)); R.append((x - nx*w, y - ny*w))
    return L, R

def band_path(center, widths, chunk=10):
    """band as a union of short overlapping pieces (offsets computed once on the whole
    line, so there are no seams), so a self-crossing ribbon never fills its own loop."""
    L, R = sides(center, widths)
    pieces = []
    for i in range(0, len(center) - 1, chunk):
        j = min(i + chunk + 1, len(center))
        if j - i >= 2:
            pieces.append(poly_path(L[i:j] + R[i:j][::-1]))
    return union(pieces)

def catmull(way, per=24):
    pts = []
    w = [way[0]] + way + [way[-1]]
    for i in range(1, len(w) - 2):
        p0, p1, p2, p3 = w[i-1], w[i], w[i+1], w[i+2]
        for k in range(per):
            t = k / per; t2 = t*t; t3 = t2*t
            pts.append(tuple(0.5*((2*p1[j]) + (-p0[j]+p2[j])*t + (2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2
                                  + (-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3) for j in (0, 1)))
    pts.append(way[-1])
    return pts

def flutter(pts, rnd, amp=(18, 34)):
    """a gentle wave along the cloth."""
    A = rnd.uniform(*amp); f = rnd.uniform(1.3, 2.3); ph = rnd.uniform(0, 6.28)
    out = []
    for i, (x, y) in enumerate(pts):
        t = i / (len(pts) - 1)
        a2 = pts[max(i-1, 0)]; b2 = pts[min(i+1, len(pts)-1)]
        dx, dy = b2[0]-a2[0], b2[1]-a2[1]; d = math.hypot(dx, dy) or 1
        o = A * math.sin(2*math.pi*f*t + ph) * min(1, t*4)
        out.append((x - dy/d*o, y + dx/d*o))
    return out

# ---- three ways the cloth can fly (all sweep toward `direction`) ----
def path_halo(start, rnd, direction, box, top):
    """rises, arcs over the syllable like a halo, comes down on the far side."""
    sx, sy = start; gx0, gx1, gy1 = box
    cx = (gx0 + gx1) / 2 + rnd.uniform(-25, 25); rx = (gx1 - gx0) / 2 + 22
    cy = gy1 - 40; ry = top - cy
    k_far = rnd.uniform(0.70, 1.0)
    def on(deg):
        r = math.radians(deg)
        yy = ry * (1 if deg <= 90 else 1 - (1 - k_far) * min(1, (deg - 90) / 90))
        return (cx - direction * rx * math.cos(r), cy + yy * math.sin(r))
    a0 = math.degrees(math.atan2((sy - cy) / ry, ((sx - cx) / rx) * (-direction)))
    a0 = max(min(a0, 55), -10)
    a_end = rnd.uniform(150, 195)
    # the riser bows outward first, so it never reads as a straight frame post
    way = [(sx, sy - 30), (sx - direction * rnd.uniform(45, 75), sy + (top - sy) * 0.35)]
    for i in range(1, 7):
        way.append(on(a0 + 18 + (a_end - a0 - 18) * i / 6))
    return flutter(catmull(way, per=14), rnd)

def path_streamer(start, rnd, direction, box, top):
    """rises with a lean and streams sideways in an S-wave above the syllable."""
    sx, sy = start; gx0, gx1, gy1 = box
    span = (gx1 - gx0) * rnd.uniform(0.88, 1.02); H = top - sy
    way = [(sx, sy - 30),
           (sx - direction * rnd.uniform(45, 75), sy + H * 0.45),
           (sx + direction * span * 0.18, top),
           (sx + direction * span * 0.48, top - H * rnd.uniform(0.30, 0.45)),
           (sx + direction * span * 0.78, top - H * rnd.uniform(0.0, 0.12)),
           (sx + direction * span * 1.02, top - H * rnd.uniform(0.25, 0.45))]
    return flutter(catmull(way, per=16), rnd, amp=(10, 22))

def path_curl(start, rnd, direction, box, top):
    """rises, turns one wide loop in the air, then trails off sideways."""
    sx, sy = start; gx0, gx1, gy1 = box
    r = rnd.uniform(125, 150)
    lx, ly = sx + direction * r * 0.35, top - r * 0.95        # loop centre
    way = [(sx, sy - 30), (sx - direction * rnd.uniform(40, 70), (sy + ly) / 2)]
    a0 = 0 if direction < 0 else math.pi                      # enter on the outer side
    for k in range(10):
        a = a0 - direction * (k / 9) * 2 * math.pi * 0.92
        way.append((lx + r * math.cos(a), ly + r * math.sin(a)))
    span = (gx1 - gx0) * rnd.uniform(0.9, 1.1)
    way.append((lx + direction * span * 0.55, ly - r * rnd.uniform(0.1, 0.5)))
    way.append((lx + direction * span * 0.95, ly + r * rnd.uniform(-0.3, 0.3)))
    return flutter(catmull(way, per=10), rnd, amp=(6, 12))

def forked_tail(pts, w_end, rnd):
    """the cloth end splits into two tapered tongues, like the painted 천의."""
    last, prev = pts[-1], pts[-4]
    ang = math.atan2(last[1]-prev[1], last[0]-prev[0])
    out = []
    spread = rnd.uniform(0.28, 0.45); bend = rnd.uniform(-0.5, 0.5)
    for s, ln in ((1, rnd.uniform(95, 130)), (-1, rnd.uniform(65, 95))):
        c = []
        for k in range(12):
            t = k / 11; a = ang + s * spread * t + bend * t * t
            if not c: c.append(last)
            else:
                px, py = c[-1]; c.append((px + math.cos(a) * ln / 11, py + math.sin(a) * ln / 11))
        out.append((c, [w_end * 0.6 * (1 - k / 11) ** 0.8 + 1.5 for k in range(12)]))
    return out   # list of (centre line, widths)

def ribbon(start, rnd, direction, box, top, width=WIDTH, kind=None):
    """build a cloth ribbon along one of the flight paths."""
    if kind is None:
        kind = rnd.choices(['halo', 'streamer'], weights=[0.55, 0.45])[0]
    pts = {'halo': path_halo, 'streamer': path_streamer, 'curl': path_curl}[kind](start, rnd, direction, box, top)
    if kind == 'curl': width *= 0.85
    # keep the cloth over its own syllable: squeeze it sideways toward the anchor if it
    # would reach too far into the neighbouring glyph (the forked tail adds ~100 more)
    sx = start[0]
    far = min(x for x, _ in pts) if direction < 0 else max(x for x, _ in pts)
    limit = X_LIMIT if direction < 0 else 1000 - X_LIMIT
    if (direction < 0 and far < limit) or (direction > 0 and far > limit):
        k = (sx - limit) / (sx - far)
        pts = [(sx + (x - sx) * k, y) if (x - sx) * direction > 0 else (x, y) for x, y in pts]
    n = len(pts)
    pinch = rnd.uniform(0.38, 0.62)                # where the cloth turns over
    widths = []
    for i in range(n):
        t = i / (n-1)
        tw = 0.16 + 0.84 * min(1, abs(t - pinch) / 0.2) ** 0.8
        root = min(1, 0.45 + t * 2.4)              # a little slimmer where it leaves the stroke
        swell = 1 + 0.18 * math.sin(math.pi * t)   # fuller in the middle
        tail = 1 if t < 0.85 else 1 - 0.45 * (t - 0.85) / 0.15
        widths.append(width * tw * root * swell * tail + 2)
    forks = forked_tail(pts, widths[-1], rnd)
    body = union([band_path(pts, widths)] + [band_path(c, w) for c, w in forks])
    # white fold line; it jumps to the other edge after the twist (we see the other face)
    cuts, run = [], []
    for i, w in enumerate(widths):
        if w > 3.2*STRIPE and i < n - 3: run.append(i)
        elif run:
            if len(run) > 4: cuts.append(run)
            run = []
    if len(run) > 4: cuts.append(run)
    cut_paths = []
    for r in cuts:
        side = 1 if (sum(r) / len(r)) / (n - 1) < pinch else -1
        sw = [STRIPE * min(1, min(k - r[0], r[-1] - k) / 6 + 0.05) for k in r]
        off = [side * widths[k] * 0.16 for k in r]
        c = [pts[k] for k in r]
        shifted = []
        for j, (x, y) in enumerate(c):
            a2 = c[max(j-1, 0)]; b2 = c[min(j+1, len(c)-1)]
            dx, dy = b2[0]-a2[0], b2[1]-a2[1]; d = math.hypot(dx, dy) or 1
            shifted.append((x - dy/d*off[j], y + dx/d*off[j]))
        cut_paths.append(band_path(shifted, sw))
    fold = union(cut_paths) if cut_paths else pathops.Path()
    mono = difference(body, cut_paths)                 # single-colour version (fallback)
    # ink layer: outline of the cloth + fold line, like the painted ink contour.
    # inner = the same bands made narrower; ink outline = body minus inner.
    def shrink(ws, line):
        return [max(0.6, w - 2 * line) for w in ws]
    inner = [band_path(pts[2:-1], shrink(widths, LINE)[2:-1])]
    for c, w in forks:
        inner.append(band_path(c[:-3], shrink(w, LINE * 0.6)[:-3]))
    edge = difference(body, [union(inner)])
    ink = union([edge, fold]) if cut_paths else edge
    inside = difference(body, [ink])
    # two faces of the cloth: before / after the twist get different colours
    k = max(2, int(pinch * (n - 1)))
    region = band_path(pts[:k + 1], [w * 1.8 + 30 for w in widths[:k + 1]])
    face_a = pathops.op(clean(inside), clean(region), pathops.PathOp.INTERSECTION, fix_winding=True)
    face_b = difference(inside, [region])
    return {'mono': mono, 'ink': ink, 'a': face_a, 'b': face_b}


# ------------------------------------------------------------------ Hangul analysis
JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
HORIZ = set('ㅗㅛㅜㅠㅡ')

def jung_of(ch):
    return JUNG[((ord(ch) - 0xAC00) % 588) // 28]

def analyse(contours):
    big = max(contours, key=lambda c: abs(area(c)))
    sign = 1 if area(big) > 0 else -1
    return [c for c in contours if area(c) * sign > 0]

def anchor(ch, ink):
    """where the ribbon leaves the glyph: top of the main vowel stroke (or top of glyph)."""
    allb = [bbox(c) for c in ink]
    gx0 = min(b[0] for b in allb); gx1 = max(b[2] for b in allb)
    gy0 = min(b[1] for b in allb); gy1 = max(b[3] for b in allb)
    v = jung_of(ch) if 0xAC00 <= ord(ch) <= 0xD7A3 else ch
    if v not in HORIZ:
        cands = [(c, b) for c, b in zip(ink, allb) if b[2] > gx1 - 60 and (b[3]-b[1]) > 0.5*(gy1-gy0)]
        if cands:
            c, b = max(cands, key=lambda cb: cb[1][3] - cb[1][1])
            top = [p for p in c if p[1] > b[3] - 25]
            x = sum(p[0] for p in top) / len(top)
            return 'v', (x, b[3]), (gx0, gx1, gy1)
    # horizontal vowel: start from the top-right of the right-most stroke
    c, b = max(zip(ink, allb), key=lambda cb: cb[1][2])
    right = [p for p in c if p[0] > b[2] - 40]
    y = max(p[1] for p in right)
    x = sum(p[0] for p in right if p[1] > y - 25) / max(1, len([p for p in right if p[1] > y - 25]))
    return 'h', (x - 15, y), (gx0, gx1, gy1)


def decorate(ch, path, rnd):
    ink = analyse(flatten(path))
    kind, (ax, ay), (gx0, gx1, gy1) = anchor(ch, ink)
    direction = -1
    if 0x3131 <= ord(ch) <= 0x3163:
        # standalone jamo are narrow: give them a streamer sized to a full syllable box
        cxm = (gx0 + gx1) / 2; half = max((gx1 - gx0) / 2, 260)
        r = ribbon((ax, ay), rnd, direction, (cxm - half, cxm + half, max(gy1, 520)),
                   top=TOP - 40 + rnd.uniform(-20, 20), width=WIDTH * 0.85, kind='streamer')
    else:
        r = ribbon((ax, ay), rnd, direction, (gx0, gx1, gy1), top=TOP + rnd.uniform(-30, 20))
    return r


# ------------------------------------------------------------------ build
def ksx1001():
    out = []
    for hi in range(0xB0, 0xC9):
        for lo in range(0xA1, 0xFF):
            try: out.append(bytes([hi, lo]).decode('euc-kr'))
            except UnicodeDecodeError: pass
    return out

def build(out_otf, limit=None):
    src = TTFont(SRC)
    cmap = src.getBestCmap(); gs = src.getGlyphSet(); hmtx = src['hmtx']
    syll = [c for c in ksx1001() if ord(c) in cmap]
    jamo = [chr(c) for c in range(0x3131, 0x3164)]
    other = [chr(c) for c in range(0x20, 0x7F)] + list('·…‘’“”•※○●□■△▲→←↑↓、。「」『』〈〉《》￦±×÷°℃')
    chars = [c for c in dict.fromkeys(other + jamo + syll) if ord(c) in cmap]
    if limit: chars = [c for c in chars if c in limit or c == ' ']
    names = ['.notdef']; charstrings = {}; metrics = {}; cmap_out = {}
    pen = T2CharStringPen(500, None); charstrings['.notdef'] = pen.getCharString(); metrics['.notdef'] = (500, 0)
    t = (SX, 0, 0, SY, XC - XC*SX, YBASE - YBASE*SY)
    layers = {}; plain = []
    def add(name, path, adv):
        pen = T2CharStringPen(adv, None); path.draw(pen)
        charstrings[name] = pen.getCharString()
        b = path.bounds if len(list(path.contours)) else (0, 0, 0, 0)
        metrics[name] = (adv, int(b[0])); names.append(name)
    for i, ch in enumerate(chars):
        gname = cmap[ord(ch)]; g = gs[gname]; adv = hmtx[gname][0]
        name = 'uni%04X' % ord(ch) if ord(ch) > 0x7F else ('space' if ch == ' ' else 'u%02X' % ord(ch))
        rnd = random.Random(ord(ch) * 31 + 7)
        if 0xAC00 <= ord(ch) <= 0xD7A3 or 0x3131 <= ord(ch) <= 0x3163:
            letter = union([to_path(g, t)])
            r = decorate(ch, letter, rnd)
            add(name, union([letter, r['mono']]), adv)          # fallback: one colour
            add(name + '.plain', letter, adv)                   # ss01: no ribbon / ink layer
            add(name + '.ink', r['ink'], adv)
            add(name + '.fa', r['a'], adv)
            add(name + '.fb', r['b'], adv)
            ca = rnd.randrange(5); cb = (ca + rnd.randrange(1, 5)) % 5
            layers[name] = [(name + '.fa', ca), (name + '.fb', cb),
                            (name + '.plain', 0xFFFF), (name + '.ink', 0xFFFF)]
            plain.append(name)
        else:
            add(name, union([to_path(g)]), adv)
        cmap_out[ord(ch)] = name
        if i % 300 == 0: print(i, len(chars), file=sys.stderr)
    fam_ko, fam_en = '천의체', 'Cheonui'
    fb = FontBuilder(1000, isTTF=False)
    fb.setupGlyphOrder(names)
    fb.setupCharacterMap(cmap_out)
    fb.setupCFF('Cheonui-Regular', {'FullName': fam_en}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1050, descent=-250)
    fb.setupNameTable({
        'familyName': fam_en, 'styleName': 'Regular',
        'uniqueFontIdentifier': 'Cheonui 1.100', 'fullName': fam_en,
        'psName': 'Cheonui-Regular', 'version': 'Version 1.100',
        'copyright': 'Derived from Song Myung, Copyright 2018 The SongMyung Project Authors. '
                     'Modifications 2026.',
        'licenseDescription': 'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
        'licenseInfoURL': 'https://openfontlicense.org'}, mac=False)
    fb.font['name'].setName(fam_ko, 1, 3, 1, 0x412)
    fb.font['name'].setName('Regular', 2, 3, 1, 0x412)
    fb.font['name'].setName(fam_ko, 4, 3, 1, 0x412)
    fb.setupOS2(sTypoAscender=880, sTypoDescender=-120, sTypoLineGap=300,
                usWinAscent=1050, usWinDescent=250, achVendID='NONE',
                ulUnicodeRange1=0b11, ulUnicodeRange2=(1 << 24) | (1 << 20),
                ulCodePageRange1=(1 << 19) | 1, fsType=0)
    fb.setupPost()
    # colour: 오방색 cloth inside an ink contour (COLRv0 + CPAL); text colour for the ink
    fb.setupCOLR(layers)
    fb.setupCPAL([PAL_OBANG, PAL_DANCHEONG, PAL_GOLD])
    fea = 'languagesystem DFLT dflt;\nlanguagesystem hang dflt;\n'
    fea += 'feature ss01 {\n  featureNames { name "No ribbon"; name 3 1 0x0412 "리본 없음"; };\n'
    fea += ''.join('  sub %s by %s.plain;\n' % (n, n) for n in plain) + '} ss01;\n'
    addOpenTypeFeaturesFromString(fb.font, fea)
    fb.font.save(out_otf)


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] != '-' else None)
