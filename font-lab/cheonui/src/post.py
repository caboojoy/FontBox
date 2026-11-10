"""천의체 2.1 post-processing on a built Cheonui-*.ttf.

  python post.py svg  IN.ttf OUT.ttf            add OpenType-SVG colour (Adobe apps) for ornaments
  python post.py deco IN.ttf OUT.ttf WEIGHT [mono]
        'Cheonui Deco': every Hangul syllable carries its cloud as one ordinary glyph
        (composite = cloud + syllable), so it works in apps without calt/PUA support.
"""
import sys, random
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables.S_V_G_ import SVGDocument
from fontTools.ttLib.tables._g_l_y_f import Glyph, GlyphComponent
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.colorLib.builder import buildCOLR

N_VAR = 8
OBANG = ['#B83030', '#2B5CA8', '#1A8A78', '#DEA31F', '#DB6E8A']
INK = '#1C1610'


def svg_path(gs, name):
    pen = SVGPathPen(gs)
    gs[name].draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))     # SVG y axis points down
    return pen.getCommands()


def colr_layers(font):
    return {k: v for k, v in font['COLR'].ColorLayers.items()}


def add_svg(font):
    gs = font.getGlyphSet(); order = font.getGlyphOrder(); layers = colr_layers(font)
    docs = []
    for base, ls in sorted(layers.items(), key=lambda kv: order.index(kv[0])):
        gid = order.index(base)
        parts = []
        for layer in ls:
            fill = INK if layer.colorID == 0xFFFF else OBANG[layer.colorID]
            d = svg_path(gs, layer.name)
            if d: parts.append('<path fill="%s" d="%s"/>' % (fill, d))
        svg = ('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g id="glyph%d">%s</g></svg>'
               % (gid, ''.join(parts)))
        docs.append(SVGDocument(svg, gid, gid, False))
    t = newTable('SVG '); t.docList = docs
    font['SVG '] = t


def rename(font, family, family_ko, weight):
    nm = font['name']; ps = '%s-%s' % (family.replace(' ', ''), weight)
    for lang, fam in ((0x409, family), (0x412, family_ko)):
        nm.setName(fam, 1, 3, 1, lang); nm.setName(weight, 2, 3, 1, lang)
        nm.setName('%s %s' % (fam, weight), 4, 3, 1, lang)
        nm.setName(fam, 16, 3, 1, lang); nm.setName(weight, 17, 3, 1, lang)
    nm.setName('2.1;%s' % ps, 3, 3, 1, 0x409); nm.setName(ps, 6, 3, 1, 0x409)


def make_deco(font, weight, mono=False):
    cmap = dict(font.getBestCmap()); glyf = font['glyf']; hmtx = font['hmtx']
    vmtx = font['vmtx'] if 'vmtx' in font else None
    old_layers = colr_layers(font)
    order = list(font.getGlyphOrder())
    rnd = random.Random(7)
    hangul = [cmap[c] for c in range(0xAC00, 0xD7A4)]
    pick = {g: rnd.randrange(N_VAR) for g in hangul}          # same cloud as the calt version
    new, layers = [], dict(old_layers)
    for cp in range(0xAC00, 0xD7A4):
        g = cmap[cp]; orn = cmap[0xE000 + pick[g]]; name = g + '.deco'
        comp = Glyph(); comp.numberOfContours = -1; comp.components = []
        for ref in (orn, g):
            c = GlyphComponent(); c.glyphName = ref; c.x = c.y = 0; c.flags = 0x200 if ref == g else 0
            comp.components.append(c)
        glyf[name] = comp; hmtx[name] = hmtx[g]
        if vmtx is not None: vmtx[name] = vmtx[g]
        new.append(name)
        ol = old_layers[orn]
        layers[name] = [(ol[0].name, ol[0].colorID), (ol[1].name, ol[1].colorID), (g, 0xFFFF), (ol[2].name, 0xFFFF)]
    font.setGlyphOrder(order + new); glyf.glyphOrder = font.getGlyphOrder()
    for c in comp.components: pass
    for name in new: glyf[name].recalcBounds(glyf)
    for t in font['cmap'].tables:
        if t.isUnicode():
            for cp in range(0xAC00, 0xD7A4):
                if cp in t.cmap: t.cmap[cp] = cmap[cp] + '.deco'
    if mono:
        del font['COLR']; del font['CPAL']
    else:
        font['COLR'] = buildCOLR({k: [(n, c) for n, c in ((l.name, l.colorID) for l in v)] if not isinstance(v[0], tuple) else v
                                  for k, v in layers.items()}, version=0)
    # calt/ss lookups would add a second cloud: the Deco face has its ornaments built in
    g = font['GSUB'].table
    keep = [fr for fr in g.FeatureList.FeatureRecord if fr.FeatureTag not in ('ss01', 'ss02', 'ss03')]
    for fr in g.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'calt':
            ours = [i for i in fr.Feature.LookupListIndex if i >= len(g.LookupList.Lookup) - 4]
            fr.Feature.LookupListIndex = [i for i in fr.Feature.LookupListIndex if i not in ours]
            fr.Feature.LookupCount = len(fr.Feature.LookupListIndex)
    # dropping feature records would shift indices; neutralise ss records instead
    for fr in g.FeatureList.FeatureRecord:
        if fr.FeatureTag in ('ss01', 'ss02', 'ss03'):
            fr.Feature.LookupListIndex = []; fr.Feature.LookupCount = 0
    rename(font, 'Cheonui Deco', '천의체 장식', weight)
    font['head'].fontRevision = 2.1
    font['name'].setName('Version 2.100', 5, 3, 1, 0x409)


if __name__ == '__main__':
    mode, src, out = sys.argv[1:4]
    f = TTFont(src)
    if mode == 'svg':
        add_svg(f)
        f['head'].fontRevision = 2.1; f['name'].setName('Version 2.100', 5, 3, 1, 0x409)
    else:
        make_deco(f, sys.argv[4], mono=len(sys.argv) > 5)
        if 'COLR' in f: add_svg_deco = False
    f.save(out)
    print('saved', out, file=sys.stderr)
