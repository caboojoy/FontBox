"""천의체 리본 변형 시안: cloud(운문) / flame(화염) / bow(매듭).
usage: python variants.py KIND OUT.otf CHARS [SRC.ttf]
"""
import math, sys
import pathops
import build as B

LINE = B.LINE


def circle(cx, cy, r, n=56):
    return [(cx + r * math.cos(2 * math.pi * k / n), cy + r * math.sin(2 * math.pi * k / n)) for k in range(n)]

def inter(a, b):
    return pathops.op(B.clean(a), B.clean(b), pathops.PathOp.INTERSECTION, fix_winding=True)

def shrink(ws, line=LINE):
    return [max(0.6, w - 2 * line) for w in ws]


class Shape:
    """collects pieces; each piece = (body, inner, face 'a'/'b')."""
    def __init__(self): self.pieces = []; self.lines = []
    def band(self, center, widths, face, line=LINE):
        body = B.band_path(center, widths)
        inner = B.band_path(center[2:-2], shrink(widths, line)[2:-2]) if len(center) > 6 else None
        self.pieces.append((body, inner, face))
    def disc(self, cx, cy, r, face):
        self.pieces.append((B.poly_path(circle(cx, cy, r)), B.poly_path(circle(cx, cy, r - LINE)), face))
    def stroke(self, center, w):                       # extra ink line drawn inside
        self.lines.append(B.band_path(center, [w] * len(center)))
    def result(self):
        body = B.union([p[0] for p in self.pieces])
        inner = B.union([p[1] for p in self.pieces if p[1] is not None])
        ink = B.difference(body, [inner])
        if self.lines:
            ink = B.union([ink, inter(B.union(self.lines), body)])
        inside = B.difference(body, [ink])
        ra = [p[0] for p in self.pieces if p[2] == 'a']
        fa = inter(inside, B.union(ra)) if ra else pathops.Path()
        fb = B.difference(inside, [B.union(ra)]) if ra else inside
        mono = B.difference(body, self.lines) if self.lines else body
        return {'mono': mono, 'ink': ink, 'a': fa, 'b': fb}


def spiral(cx, cy, r0, r1, turns, sgn, n=40):
    out = []
    for k in range(n):
        t = k / (n - 1); r = r0 + (r1 - r0) * t; a = sgn * 2 * math.pi * turns * t + math.pi / 2
        out.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return out


# ---------------------------------------------------------------- 운문 (cloud)
def cloud(ch, rnd, ax, ay, gx0, gx1, gy1):
    s = Shape()
    S = 1.55
    cx = max(330, (gx0 + gx1) / 2 + rnd.uniform(-30, 30)); cy = min(B.TOP - 74 * S, gy1 + 150)
    lobes = [(0, 0, 74), (-88, -18, 56), (84, -22, 50), (-40, -52, 46), (30, -50, 48)]
    for x, y, r in lobes: s.disc(cx + x * S, cy + y * S, r * S, 'a')
    sg = rnd.choice([-1, 1])
    s.stroke(spiral(cx + 6 * S, cy + 4 * S, 50 * S, 8, 1.6, sg), LINE * 0.9)
    s.stroke(spiral(cx - 92 * S, cy - 14 * S, 36 * S, 6, 1.3, -sg), LINE * 0.8)
    # rising wisp from the vowel into the cloud
    way = [(ax, ay - 25), (ax + 30, (ay + cy) / 2 - 30), (cx + 84 * S, cy - 40 * S)]
    pts = B.catmull(way, per=14)
    s.band(pts, [26 + 34 * i / (len(pts) - 1) for i in range(len(pts))], 'b', line=LINE * 0.8)
    # trailing tail to the left
    way = [(cx - 120 * S, cy - 40 * S), (cx - 165 * S, cy - 75 * S), (cx - 205 * S, cy - 55 * S), (max(B.X_LIMIT, cx - 245 * S), cy - 85 * S)]
    pts = B.flutter(B.catmull(way, per=10), rnd, amp=(6, 12))
    s.band(pts, [60 * (1 - i / (len(pts) - 1)) ** 0.9 + 2 for i in range(len(pts))], 'b', line=LINE * 0.8)
    return s.result()


# ---------------------------------------------------------------- 화염 (flame)
def flame(ch, rnd, ax, ay, gx0, gx1, gy1):
    s = Shape()
    n = 3
    by = gy1 - 30
    s.band([(gx0 + 20 + (gx1 - gx0 - 40) * k / 20, by + 10) for k in range(21)], [70] * 21, 'b')
    for i in range(n):
        x = gx0 + 70 + (gx1 - gx0 - 140) * i / (n - 1)
        mid = 1 - abs(i - (n - 1) / 2) / ((n - 1) / 2 + 0.6)
        h = (B.TOP - by) * (0.55 + 0.45 * mid) * rnd.uniform(0.9, 1.05)
        lean = -rnd.uniform(50, 110)
        way = [(x, by), (x + 18, by + h * 0.3), (x - 22 + lean * 0.4, by + h * 0.62), (x + lean, by + h)]
        pts = B.catmull(way, per=14)
        W = rnd.uniform(150, 175) * (0.75 + 0.3 * mid)
        m = len(pts) - 1
        ws = [W * (1 - k / m) ** 0.85 * min(1, 0.6 + 3 * k / m) + 1 for k in range(m + 1)]
        s.band(pts, ws, 'a' if i % 2 == 0 else 'b')
        # inner tongue (the bright core): ink line hint
        core = pts[int(m * 0.15):int(m * 0.7)]
        s.stroke(core, LINE * 0.7)
    return s.result()


# ---------------------------------------------------------------- 매듭 (bow)
def bow(ch, rnd, ax, ay, gx0, gx1, gy1):
    s = Shape()
    S = 1.45
    kx, ky = (gx0 + gx1) / 2 + 40, min(gy1 + 80, B.TOP - 110 * S)
    def loop(sc, lift):
        sc *= S
        way = [(kx, ky), (kx + sc * 50, ky + (70 + lift) * S), (kx + sc * 140, ky + (100 + lift) * S),
               (kx + sc * 185, ky + (45 + lift) * S), (kx + sc * 140, ky - 5), (kx + sc * 50, ky + 5), (kx, ky)]
        pts = B.catmull(way, per=12); m = len(pts) - 1
        s.band(pts, [24 + 70 * math.sin(math.pi * k / m) for k in range(m + 1)], 'a')
    loop(-1.0, rnd.uniform(0, 25))
    loop(0.72, rnd.uniform(-10, 10))
    for sc, ln in ((-1, rnd.uniform(300, 340)), (0.6, rnd.uniform(220, 250))):
        way = [(kx, ky), (kx + sc * ln * 0.3, ky - 45), (kx + sc * ln * 0.7, ky - 30), (kx + sc * ln, ky - 70)]
        pts = B.flutter(B.catmull(way, per=10), rnd, amp=(6, 14)); m = len(pts) - 1
        ws = [46 + 14 * math.sin(math.pi * k / m) for k in range(m + 1)]
        s.band(pts, ws, 'b')
        for c, w in B.forked_tail(pts, ws[-1], rnd):
            s.pieces.append((B.band_path(c, w), None, 'b'))
    s.disc(kx, ky, 42, 'a')
    return s.result()


KINDS = {'cloud': cloud, 'flame': flame, 'bow': bow}

def make_decorate(kind):
    fn = KINDS[kind]
    def decorate(ch, path, rnd):
        ink = B.analyse(B.flatten(path))
        _, (ax, ay), (gx0, gx1, gy1) = B.anchor(ch, ink)
        if 0x3131 <= ord(ch) <= 0x3163:
            cxm = (gx0 + gx1) / 2; half = max((gx1 - gx0) / 2, 260)
            gx0, gx1, gy1 = cxm - half, cxm + half, max(gy1, 520)
        return fn(ch, rnd, ax, ay, gx0, gx1, gy1)
    return decorate


if __name__ == '__main__':
    kind, out, chars = sys.argv[1:4]
    B.SRC = sys.argv[4] if len(sys.argv) > 4 else '../src/ofl_songmyung_SongMyung-Regular.ttf'
    B.decorate = make_decorate(kind)
    B.build(out, chars)
