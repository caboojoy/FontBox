"""수염체 (Suyeom) font generator.

Base outlines: Noto Sans CJK KR Black (SIL OFL 1.1).
Rule 1 (vowel-top ornament): style 'brush' = brush-hair fan, style 'mustache' = handlebar mustache.
Rule 2 (closed-space substitution): every enclosed counter of a Hangul glyph is filled with
radial whiskers converging to the centre.
Standalone compatibility jamo also get brush-hair stroke terminals.
"""
import math, random, sys
import pathops
from fontTools.ttLib import TTCollection
from fontTools.pens.basePen import BasePen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.fontBuilder import FontBuilder

SRC = '/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc'
SX, SY, YBASE, XC = 0.95, 0.84, -95, 460   # shrink Hangul to make room above

# ---------------------------------------------------------------- geometry helpers
class Flatten(BasePen):
    """Collects contours as polylines (curves sampled) for analysis."""
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

def ray_hit(poly, c, ang):
    """distance from c along angle to nearest polygon edge."""
    dx, dy = math.cos(ang), math.sin(ang); best = None
    n = len(poly)
    for i in range(n):
        (x1, y1), (x2, y2) = poly[i-1], poly[i]
        ex, ey = x2-x1, y2-y1
        den = dx*ey - dy*ex
        if abs(den) < 1e-9: continue
        t = ((x1-c[0])*ey - (y1-c[1])*ex) / den
        s = ((x1-c[0])*dy - (y1-c[1])*dx) / den
        if t > 0 and 0 <= s <= 1 and (best is None or t < best): best = t
    return best

def centroid(poly):
    a = cx = cy = 0
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i-1], poly[i]
        f = x0*y1 - x1*y0; a += f; cx += (x0+x1)*f; cy += (y0+y1)*f
    if abs(a) < 1e-6:
        return sum(p[0] for p in poly)/len(poly), sum(p[1] for p in poly)/len(poly)
    return cx/(3*a), cy/(3*a)

def hair(base, ang, length, width, bend=0.0):
    """A tapered, slightly curved hair: base centre, direction, length, base width."""
    dx, dy = math.cos(ang), math.sin(ang); nx, ny = -dy, dx
    bx, by = base
    pts_l, pts_r = [], []
    N = 5
    for i in range(N + 1):
        t = i / N
        w = width * (1 - t) ** 0.9 / 2
        off = bend * length * t * t          # sideways curl grows toward tip
        cx = bx + dx*length*t + nx*off; cy = by + dy*length*t + ny*off
        pts_l.append((cx + nx*w, cy + ny*w)); pts_r.append((cx - nx*w, cy - ny*w))
    return poly_path(pts_l + pts_r[::-1][1:])

# ---------------------------------------------------------------- ornaments
def burst(poly, rnd):
    """Rule 2: fill an enclosed counter with radial whiskers."""
    c = centroid(poly)
    per = sum(math.dist(poly[i-1], poly[i]) for i in range(len(poly)))
    n = max(10, min(40, int(per / 17)))
    out = []
    for k in range(n):
        ang = 2*math.pi*k/n + rnd.uniform(-0.08, 0.08)
        r = ray_hit(poly, c, ang)
        if not r or r < 6: continue
        base_r = r + 6                                   # root inside the ink
        tip_gap = r * rnd.uniform(0.10, 0.30)           # small white heart
        L = base_r - tip_gap
        width = max(4.5, min(2*math.pi*r/n * 0.48, 22))
        bx, by = c[0] + math.cos(ang)*base_r, c[1] + math.sin(ang)*base_r
        out.append(hair((bx, by), ang + math.pi, L, width, bend=rnd.uniform(-0.06, 0.06)))
    return out

def fan(x0, x1, y, rnd, length=190, spread=1.35, up=True, count=None):
    """Rule 1 (brush): a bushy tuft of hairs fanning from a top edge x0..x1 at height y."""
    w = max(x1 - x0, 24)
    n = count or 19
    out = []
    for i in range(n):
        t = (i + 0.5) / n
        bx = (x0 - 6) + (w + 12) * t
        edge = abs(t - 0.5) * 2
        a = math.pi/2 + (0.5 - t) * 2 * spread + rnd.uniform(-0.1, 0.1)
        L = length * (0.62 + 0.5*edge + rnd.uniform(-0.14, 0.14))
        bend = (0.22 if t < 0.5 else -0.22) * edge + rnd.uniform(-0.05, 0.05)
        out.append(hair((bx, y - 16), a, L, w / n * 3.2 + 9, bend=bend))
    return out

def end_fan(seg, normal, rnd, length=120):
    """Brush-hair terminal on a stroke end: seg=(p0,p1) on outline, normal=outward angle."""
    (x0, y0), (x1, y1) = seg
    sl = max(math.dist(seg[0], seg[1]), 20)
    n = max(9, int(sl / 7))
    out = []
    for i in range(n):
        t = (i + 0.5) / n
        bx, by = x0 + (x1-x0)*t, y0 + (y1-y0)*t
        bx -= math.cos(normal)*14; by -= math.sin(normal)*14
        edge = abs(t-0.5)*2
        a = normal + (t-0.5)*1.4 + rnd.uniform(-0.1, 0.1)
        L = length*(0.6 + 0.5*edge + rnd.uniform(-0.15, 0.15))
        out.append(hair((bx, by), a, L, sl/n*2.3 + 5, bend=(t-0.5)*0.5))
    return out

def mustache(cx, y, w):
    """Rule 1 (mustache): handlebar mustache; y = bottom of central lobe."""
    h = w / 2
    def half(s):
        pts = []
        # outline of one side, from centre-bottom, round bottom lobe, up to curled tip, back on top
        ctrl = [(0, 0.10), (0.15, -0.02), (0.38, -0.08), (0.62, 0.02), (0.82, 0.16),
                (0.97, 0.36), (1.02, 0.56), (0.93, 0.70), (0.84, 0.66), (0.90, 0.56),
                (0.90, 0.42), (0.78, 0.30), (0.60, 0.26), (0.40, 0.30), (0.20, 0.36),
                (0.06, 0.40), (0, 0.36)]
        return [(cx + s*px*h, y + py*h) for px, py in ctrl]
    r = half(1); l = half(-1)
    pts = r + l[::-1][1:-1]
    # smooth via Chaikin
    for _ in range(3):
        nxt = []
        for i in range(len(pts)):
            p, q = pts[i], pts[(i+1) % len(pts)]
            nxt += [(0.75*p[0]+0.25*q[0], 0.75*p[1]+0.25*q[1]), (0.25*p[0]+0.75*q[0], 0.25*p[1]+0.75*q[1])]
        pts = nxt
    if area(pts) < 0: pts = pts[::-1]
    return poly_path(pts)

# ---------------------------------------------------------------- Hangul analysis
JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
HORIZ = set('ㅗㅛㅜㅠㅡ')

def jung_of(ch):
    return JUNG[((ord(ch) - 0xAC00) % 588) // 28]

def has_jong(ch):
    return (ord(ch) - 0xAC00) % 28 != 0

def analyse(contours):
    """split into ink contours and hole contours using orientation of the biggest one."""
    big = max(contours, key=lambda c: abs(area(c)))
    sign = 1 if area(big) > 0 else -1
    ink = [c for c in contours if area(c) * sign > 0]
    holes = [c for c in contours if area(c) * sign < 0 and abs(area(c)) > 300]
    return ink, holes

def top_clusters(poly, tol=10):
    """x-intervals of polygon edges lying on the top edge of a contour."""
    ymax = max(p[1] for p in poly)
    iv = []
    for i in range(len(poly)):
        (x0, y0), (x1, y1) = poly[i-1], poly[i]
        if y0 > ymax - tol and y1 > ymax - tol:
            iv.append((min(x0, x1), max(x0, x1)))
    iv.sort(); merged = []
    for a, b in iv:
        if merged and a <= merged[-1][1] + 4: merged[-1][1] = max(merged[-1][1], b)
        else: merged.append([a, b])
    return ymax, [(a, b) for a, b in merged if b - a > 15]

def vowel_tops(ch, ink):
    """returns list of (x0,x1,y) top edges where rule-1 ornament goes."""
    allb = [bbox(c) for c in ink]
    gx0 = min(b[0] for b in allb); gx1 = max(b[2] for b in allb)
    gy0 = min(b[1] for b in allb); gy1 = max(b[3] for b in allb)
    v = jung_of(ch)
    if v not in HORIZ:
        # vowel vertical = tall contour reaching the right edge
        cands = [c for c, b in zip(ink, allb) if b[2] > gx1 - 40 and (b[3] - b[1]) > 0.55*(gy1 - gy0)]
        if cands:
            c = max(cands, key=lambda c: bbox(c)[3] - bbox(c)[1])
            y, cl = top_clusters(c)
            if cl: return 'v', [(a, b, y) for a, b in cl]
    # horizontal vowel (or fallback): top of the syllable
    top = max(ink, key=lambda c: bbox(c)[3])
    y, cl = top_clusters(top)
    if not cl:
        b = bbox(top); cl = [((b[0]+b[2])/2 - 20, (b[0]+b[2])/2 + 20)]
    x0 = min(a for a, _ in cl); x1 = max(b for _, b in cl)
    return 'h', [(x0, x1, y)]

# terminals for standalone jamo: (edge, filter) -> outward direction
JAMO_ENDS = {
    'ㄱ': [('bottom', 'right')], 'ㄴ': [('right', 'low')], 'ㄷ': [('right', 'low')],
    'ㄹ': [('right', 'low')], 'ㅅ': [('bottom', 'left'), ('bottom', 'right')],
    'ㅈ': [('bottom', 'left'), ('bottom', 'right')], 'ㅊ': [('bottom', 'left'), ('bottom', 'right')],
    'ㅋ': [('bottom', 'right')], 'ㅌ': [('right', 'low')], 'ㄲ': [('bottom', 'right')], 'ㄸ': [('right', 'low')],
    'ㅆ': [('bottom', 'left'), ('bottom', 'right')], 'ㅉ': [('bottom', 'left'), ('bottom', 'right')],
}

def edge_segments(ink, edge, filt, tol=8):
    pts = [p for c in ink for p in c]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    cx, cy = (min(xs)+max(xs))/2, (min(ys)+max(ys))/2
    if edge == 'bottom':
        y = min(ys); sel = [p for p in pts if p[1] < y + tol]
        if filt == 'left': sel = [p for p in sel if p[0] < cx]
        if filt == 'right': sel = [p for p in sel if p[0] >= cx]
        if not sel: return None
        return ((min(p[0] for p in sel), y), (max(p[0] for p in sel), y)), -math.pi/2
    if edge in ('right', 'left'):
        if edge == 'right': x = max(xs); sel = [p for p in pts if p[0] > x - tol]
        else: x = min(xs); sel = [p for p in pts if p[0] < x + tol]
        if filt == 'low': sel = [p for p in sel if p[1] < cy]
        if not sel: return None
        seg = ((x, min(p[1] for p in sel)), (x, max(p[1] for p in sel)))
        return seg, (0 if edge == 'right' else math.pi)
    return None

# ---------------------------------------------------------------- glyph building
def to_path(glyph, gs, transform=None):
    p = pathops.Path(); pen = p.getPen()
    tp = TransformPen(pen, transform) if transform else pen
    glyph.draw(tp); return p

def flatten(path):
    fp = Flatten(); path.draw(fp); return fp.contours

def union(paths):
    b = pathops.OpBuilder(fix_winding=True, keep_starting_points=False)
    for p in paths: b.add(p, pathops.PathOp.UNION)
    return b.resolve()

def build_hangul(ch, glyph, gs, style):
    rnd = random.Random(ord(ch) * 7 + (1 if style == 'brush' else 2))
    t = (SX, 0, 0, SY, XC - XC*SX, YBASE - YBASE*SY)
    base = to_path(glyph, gs, t)
    base = union([base])
    contours = flatten(base)
    ink, holes = analyse(contours)
    extra = []
    for h in holes: extra += burst(h, rnd)                       # rule 2
    kind, tops = vowel_tops(ch, ink)                             # rule 1
    if style == 'brush':
        for x0, x1, y in tops:
            if kind == 'h':                       # keep the tuft compact on wide tops (ㄱ, ㅈ, ㅍ…)
                m = (x0 + x1) / 2; x0, x1 = max(x0, m - 45), min(x1, m + 45)
            L = 190 if kind == 'v' else 165
            extra += fan(x0, x1, y, rnd, length=L)
    else:
        if kind == 'v':
            x0 = min(a for a, _, _ in tops); x1 = max(b for _, b, _ in tops); y = tops[0][2]
            w = max(340, (x1 - x0) + 230)
            extra.append(mustache((x0+x1)/2, y - 26, w))
        else:
            x0, x1, y = tops[0]
            extra.append(mustache((x0+x1)/2, y + 4, 360))
    return union([base] + extra)

def build_jamo(ch, glyph, gs, style):
    rnd = random.Random(ord(ch) * 13)
    base = union([to_path(glyph, gs)])
    ink, holes = analyse(flatten(base))
    extra = []
    for h in holes: extra += burst(h, rnd)
    for edge, filt in JAMO_ENDS.get(ch, []):
        r = edge_segments(ink, edge, filt)
        if r: extra += end_fan(r[0], r[1], rnd, length=115)
    if ch in JUNG:                                               # vowel jamo get rule 1 too
        if ch in HORIZ or ch in 'ㅘㅙㅚㅝㅞㅟㅢ' and False:
            top = max(ink, key=lambda c: bbox(c)[3])
        else:
            top = max(ink, key=lambda c: bbox(c)[3] - bbox(c)[1])
        y, cl = top_clusters(top)
        if ch in HORIZ:
            b = bbox(top)
            if style == 'brush': extra += fan(b[2]-60, b[2], y, rnd, length=170)
            else: extra.append(mustache((b[0]+b[2])/2, y + 4, 380))
        elif cl:
            if style == 'brush':
                for a, b2 in cl: extra += fan(a, b2, y, rnd, length=200)
            else:
                a = min(c[0] for c in cl); b2 = max(c[1] for c in cl)
                extra.append(mustache((a+b2)/2, y - 30, max(360, b2-a+240)))
    return union([base] + extra)

def ksx1001():
    out = []
    for hi in range(0xB0, 0xC9):
        for lo in range(0xA1, 0xFF):
            try: out.append(bytes([hi, lo]).decode('euc-kr'))
            except UnicodeDecodeError: pass
    return out

def build(style, out_otf, limit=None):
    src = TTCollection(SRC).fonts[1]
    cmap = src.getBestCmap(); gs = src.getGlyphSet()
    syll = ksx1001()
    if limit: syll = [c for c in syll if c in limit]
    jamo = [chr(c) for c in range(0x3131, 0x3164)]
    other = [chr(c) for c in range(0x20, 0x7F)] + list('·…‘’“”•※○●□■△▲→←↑↓·、。「」『』〈〉《》￦€±×÷°℃')
    chars = [c for c in other + jamo + syll if ord(c) in cmap]
    names = ['.notdef']; charstrings = {}; metrics = {}; cmap_out = {}
    pen = T2CharStringPen(500, None); charstrings['.notdef'] = pen.getCharString(); metrics['.notdef'] = (500, 0)
    for i, ch in enumerate(chars):
        g = gs[cmap[ord(ch)]]
        name = 'uni%04X' % ord(ch) if ord(ch) > 0x7F else ('space' if ch == ' ' else 'u%02X' % ord(ch))
        if 0xAC00 <= ord(ch) <= 0xD7A3:
            path = build_hangul(ch, g, gs, style)
        elif 0x3131 <= ord(ch) <= 0x3163:
            path = build_jamo(ch, g, gs, style)
        else:
            path = union([to_path(g, gs)])
        pen = T2CharStringPen(g.width, None)
        path.draw(pen)
        charstrings[name] = pen.getCharString()
        b = path.bounds if len(list(path.contours)) else (0, 0, 0, 0)
        metrics[name] = (g.width, int(b[0]))
        names.append(name); cmap_out[ord(ch)] = name
        if i % 300 == 0: print(style, i, len(chars), file=sys.stderr)
    fam_ko = '수염체 붓털' if style == 'brush' else '수염체 콧수염'
    fam_en = 'Suyeom Brush' if style == 'brush' else 'Suyeom Mustache'
    fb = FontBuilder(1000, isTTF=False)
    fb.setupGlyphOrder(names)
    fb.setupCharacterMap(cmap_out)
    fb.setupCFF(fam_en.replace(' ', '') + '-Regular', {'FullName': fam_en}, charstrings, {})
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=1050, descent=-250)
    nm = {'familyName': fam_en, 'styleName': 'Regular',
          'uniqueFontIdentifier': fam_en + ' 1.000', 'fullName': fam_en,
          'psName': fam_en.replace(' ', '') + '-Regular', 'version': 'Version 1.000',
          'copyright': 'Derived from Noto Sans CJK (c) 2014-2021 Adobe, with Reserved Font Name "Source". '
                       'Modifications 2026 도겸.',
          'licenseDescription': 'This Font Software is licensed under the SIL Open Font License, Version 1.1.',
          'licenseInfoURL': 'https://openfontlicense.org'}
    fb.setupNameTable(nm, mac=False)
    fb.font['name'].setName(fam_ko, 1, 3, 1, 0x412)
    fb.font['name'].setName('Regular', 2, 3, 1, 0x412)
    fb.font['name'].setName(fam_ko, 4, 3, 1, 0x412)
    fb.setupOS2(sTypoAscender=880, sTypoDescender=-120, sTypoLineGap=250,
                usWinAscent=1050, usWinDescent=250, achVendID='NONE',
                ulUnicodeRange1=0b11, ulUnicodeRange2=(1 << 24) | (1 << 20),
                ulCodePageRange1=(1 << 19) | 1, fsType=0)
    fb.setupPost()
    fb.font.save(out_otf)
    return out_otf

if __name__ == '__main__':
    style = sys.argv[1]; out = sys.argv[2]
    lim = sys.argv[3] if len(sys.argv) > 3 else None
    build(style, out, lim)
