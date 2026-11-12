"""specimen: shape with HarfBuzz (calt/ss on), draw each glyph by its char with Pillow (COLR)."""
import sys, uharfbuzz as hb
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
def runner(path):
    data = open(path, 'rb').read(); font = hb.Font(hb.Face(data)); upm = 1000
    tt = TTFont(path); rev = {}
    for cp, g in tt.getBestCmap().items(): rev.setdefault(g, chr(cp))
    order = tt.getGlyphOrder()
    def draw(d, x, y, text, size, feats, color, pal=0):
        b = hb.Buffer(); b.add_str(text); b.guess_segment_properties(); hb.shape(font, b, feats)
        f = ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.BASIC)
        if pal: f = ImageFont.truetype(path, size, layout_engine=ImageFont.Layout.BASIC)
        for info, pos in zip(b.glyph_infos, b.glyph_positions):
            ch = rev.get(order[info.codepoint])
            if ch and ch != ' ':
                d.text((x + pos.x_offset * size / upm, y), ch, font=f, fill=color, anchor='ls', embedded_color=True)
            x += pos.x_advance * size / upm
    return draw
B = runner('v2/Cheonui-Bold.ttf'); R = runner('v2/Cheonui-Regular.ttf')
lab = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 22)
W = 1600; im = Image.new('RGB', (W, 1500), (236, 222, 190)); d = ImageDraw.Draw(im)
ink = (28, 22, 16); mut = (110, 88, 62)
y = 40
def tag(t):
    global y; d.text((60, y), t, font=lab, fill=mut); y += 34
tag('기본 — 단어 첫 글자에만 구름 (Bold 150px)')
B(d, 60, y + 190, '십이지신도', 150, {}, ink); y += 250
tag('기본 (Bold 80px)')
B(d, 60, y + 100, '병오년 새해 복 많이 받으세요', 80, {}, ink); y += 140
tag('ss01 — 모든 글자에 구름 (Regular 64px)')
R(d, 60, y + 82, '자축인묘 진사오미 신유술해', 64, {'ss01': True}, ink); y += 120
tag('ss02 — 천의 리본 (Bold 80px)')
B(d, 60, y + 104, '하늘의 열두 수호신', 80, {'ss02': True}, ink); y += 145
tag('ss03 — 장식 없음, 본문 (Regular 28px)')
for line in ['십이지신은 열두 방위와 시간을 지키는 수호신이다. 짐승의 얼굴에 사람의 몸을 하고,',
             '갑옷을 입고 무기를 든 모습으로 그려진다. 조선 후기 민화에서는 구름을 타고 천의를',
             '휘날리는 모습으로 친근하게 표현되었다.']:
    R(d, 60, y + 34, line, 28, {'ss03': True}, ink); y += 50
y += 20
tag('색을 지원하지 않는 프로그램 (단색 대체 표시)')
fb = ImageFont.truetype('v2/Cheonui-Bold.ttf', 80, layout_engine=ImageFont.Layout.BASIC)
d.text((60, y + 100), '\ue000십이지신도', font=fb, fill=ink, anchor='ls'); y += 140
im = im.crop((0, 0, W, y + 20)); im.save(sys.argv[1])
