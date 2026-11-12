"""배포본 만들기: 빌드된 폰트의 메타데이터를 고치고, WOFF2·라이선스·소스를 묶어 패키지로 만든다.

    python 배포/도구/release.py [원본폴더]     # 폰트를 고쳐 패키지 4개와 zip 을 만든다
    python 배포/도구/release.py [원본폴더] --only=marker   # 패키지 하나만 (cheonui|suyeom|marker|western)
    python 배포/도구/release.py --zip          # README 만 고쳤을 때 zip 만 다시 묶는다

원본폴더는 천의체/, Suyeom-fonts.zip, 두이미지_폰트_2종.zip, font-builder_천의체/ 가 들어 있는
'개발폰트' 폴더다. 생략하면 이 스크립트의 두 단계 위 폴더를 쓴다.
원본은 읽기만 하고 고치지 않는다. 결과는 이 스크립트의 위 폴더(배포/)에 쓴다.
폰트를 다시 빌드했으면 원본 위치에 덮어쓴 뒤 이 스크립트를 다시 돌리면 된다.
필요: pip install fonttools brotli pillow
"""
import gc, io, shutil, sys, tempfile, zipfile
from pathlib import Path
from fontTools.ttLib import TTFont, newTable, woff2
from fontTools.pens.boundsPen import BoundsPen

TOOLS = Path(__file__).resolve().parent
OUT = TOOLS.parent                      # 배포/
ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
ONLY = [a[7:] for a in sys.argv[1:] if a.startswith('--only=')]      # cheonui | suyeom | marker | western
want = lambda k: not ONLY or k in ONLY
ROOT = Path(ARGS[0]).resolve() if ARGS else OUT.parent                      # 원본 폴더
WIN = (3, 1)                            # name 레코드: Windows / Unicode BMP
EN, KO = 0x409, 0x412


# ------------------------------------------------------------------ 폰트 고치기
def ink_bounds(font, char):
    cmap = font.getBestCmap()
    if ord(char) not in cmap: return None
    gs = font.getGlyphSet(); pen = BoundsPen(gs); gs[cmap[ord(char)]].draw(pen)
    return pen.bounds


def sort_features(table):
    """FeatureList 를 태그 순으로 정렬한다(규격 요구 사항, OTS 경고 제거). 조회 결과는 그대로다."""
    recs = table.FeatureList.FeatureRecord
    order = sorted(range(len(recs)), key=lambda i: (recs[i].FeatureTag, i))
    remap = {old: new for new, old in enumerate(order)}
    table.FeatureList.FeatureRecord = [recs[i] for i in order]
    for sr in table.ScriptList.ScriptRecord:
        for ls in [sr.Script.DefaultLangSys] + [r.LangSys for r in sr.Script.LangSysRecord]:
            if ls is None: continue
            ls.FeatureIndex = sorted(remap[i] for i in ls.FeatureIndex)
            if ls.ReqFeatureIndex != 0xFFFF: ls.ReqFeatureIndex = remap[ls.ReqFeatureIndex]


def used_name_ids(font):
    ids = set()
    for tag in ('GSUB', 'GPOS'):
        if tag not in font: continue
        for fr in font[tag].table.FeatureList.FeatureRecord:
            fp = fr.Feature.FeatureParams
            for attr in ('UINameID', 'FeatUILabelNameID', 'FeatUITooltipTextNameID', 'SampleTextNameID'):
                if fp is not None and getattr(fp, attr, 0): ids.add(getattr(fp, attr))
    return ids


HOLDER = '도겸'                          # 수정분 저작권자. 원본 천의체에는 이름이 비어 있어 여기서 채운다
HOLDER_FIX = [('(천의체 / Cheonui) © 2026.', '(천의체 / Cheonui) © 2026 %s.' % HOLDER),
              ('(천의체 / Cheonui) Copyright 2026.', '(천의체 / Cheonui) Copyright 2026 %s.' % HOLDER),
              ('Cheonui ornaments: 2026.', 'Cheonui ornaments: %s, 2026.' % HOLDER),
              # 황야웨스턴: Noto Serif 의 저작권 연도를 폰트 안쪽 표기(© 2017-2023 Adobe)에 맞춘다
              ('Copyright 2017 Adobe, Reserved', 'Copyright 2017-2023 Adobe, Reserved')]


def fix_holder(text):
    for old, new in HOLDER_FIX: text = text.replace(old, new)
    return text


def finalize(src, dst, fit_descent=False, rename=None):
    """src 폰트를 읽어 배포용으로 고친 뒤 dst(.ttf/.otf)와 같은 이름의 .woff2 로 저장한다."""
    f = TTFont(src)
    name, os2, head, hhea, post = f['name'], f['OS/2'], f['head'], f['hhea'], f['post']
    for n in name.names:
        if n.nameID in (0, 9): n.string = fix_holder(n.toUnicode())
    if rename:                           # (영문 이름, 한글 이름): 빌드된 폰트의 이름을 배포 이름으로 바꾼다
        for lang, fam in zip((EN, KO), rename):
            name.setName(fam, 1, *WIN, lang); name.setName(fam, 4, *WIN, lang)
        name.setName(dst.stem, 6, *WIN, EN)
        name.names = [n for n in name.names if (n.platformID, n.platEncID) == WIN]
    get = lambda i, lang=EN: (name.getName(i, *WIN, lang) or name.getName(i, 1, 0, 0)).toUnicode()
    family, style, psname = get(1), get(2), get(6)
    version = 'Version %.3f' % head.fontRevision

    # name: Windows 레코드만 남긴다(맥·유니코드 플랫폼 중복 레코드와 ltag 제거)
    name.names = [n for n in name.names if (n.platformID, n.platEncID) == WIN]
    if 'ltag' in f: del f['ltag']
    name.setName(version, 5, *WIN, EN)
    name.setName('%.3f;%s' % (head.fontRevision, psname), 3, *WIN, EN)       # 버전과 어긋난 고유 ID 수정
    if name.getName(1, *WIN, KO) and not name.getName(2, *WIN, KO):
        name.setName(style, 2, *WIN, KO)
    # 가변 폰트에서 남은, 아무 데서도 쓰지 않는 이름 레코드 제거
    if 'fvar' not in f and 'STAT' not in f:
        keep = used_name_ids(f)
        name.names = [n for n in name.names if n.nameID < 256 or n.nameID in keep]

    # 스타일 플래그: Regular 비트가 꺼져 있으면 윈도우·오피스에서 굵기 연결이 어긋난다
    bold = os2.usWeightClass >= 700 and style == 'Bold'
    os2.fsSelection = (os2.fsSelection & ~0b1100001) | (0b0100000 if bold else 0b1000000)
    head.macStyle = (head.macStyle & ~0b11) | (1 if bold else 0)
    head.flags |= 0b11
    if os2.version < 4: os2.version = 4

    # 세로 메트릭: hhea(맥·웹) = win(윈도우), typo 줄 간격 0 → 플랫폼마다 줄 높이가 같아진다
    if fit_descent:                      # 글자가 win 범위 밖으로 나가 잘리는 것 방지
        gs = f.getGlyphSet(); ymin = 0
        for g in set(f.getBestCmap().values()):
            pen = BoundsPen(gs); gs[g].draw(pen)
            if pen.bounds: ymin = min(ymin, pen.bounds[1])
        os2.usWinDescent = max(os2.usWinDescent, int(-ymin))
    hhea.ascent, hhea.descent, hhea.lineGap = os2.usWinAscent, -os2.usWinDescent, 0
    os2.sTypoLineGap = 0
    if not os2.sxHeight and ink_bounds(f, 'x'): os2.sxHeight = int(ink_bounds(f, 'x')[3])
    if not os2.sCapHeight and ink_bounds(f, 'H'): os2.sCapHeight = int(ink_bounds(f, 'H')[3])
    if not post.underlineThickness:      # 두께 0 이면 밑줄이 안 보인다
        post.underlinePosition, post.underlineThickness = -125, 50

    # 줄바꿈 없는 공백(U+00A0)이 없으면 웹에서 그 칸만 다른 글꼴로 바뀐다
    for t in f['cmap'].tables:
        if t.isUnicode() and 0xA0 not in t.cmap and 0x20 in t.cmap:
            t.cmap[0xA0] = t.cmap[0x20]

    if 'glyf' in f and 'gasp' not in f:  # 힌팅 없는 TrueType: 모든 크기에서 부드럽게 그리도록 지정
        f['gasp'] = newTable('gasp'); f['gasp'].version = 1; f['gasp'].gaspRange = {0xFFFF: 0x000A}
    if 'CFF ' in f:                      # CFF 안쪽 이름·저작권도 채운다(일부 PDF·인쇄 도구가 읽음)
        td = f['CFF '].cff.topDictIndex[0]
        td.FamilyName, td.FullName, td.Weight = family, get(4), style
        td.Notice = get(13)
        if get(0).isascii(): td.Copyright = get(0)      # CFF 문자열은 한글을 담지 못한다
    for tag in ('GSUB', 'GPOS'):
        if tag in f: sort_features(f[tag].table)

    dst.parent.mkdir(parents=True, exist_ok=True)
    f.save(dst); f.close(); del f, name, os2, head, hhea, post, get
    gc.collect()                         # 글리프 2만 개짜리 폰트를 연달아 다루므로 메모리를 바로 비운다
    woff2.compress(str(dst), str(dst.with_suffix('.woff2')))
    gc.collect()
    print('  %-28s %5.1f MB  woff2 %4.2f MB' % (dst.name, dst.stat().st_size / 1e6,
                                               dst.with_suffix('.woff2').stat().st_size / 1e6))


# ------------------------------------------------------------------ 부속 파일
def ofl_text(header_lines):
    """저작권 머리말 + OFL 1.1 원문(원본 폰트에 들어 있던 파일에서 그대로 가져온다)."""
    ref = (ROOT / 'font-builder_천의체' / 'OFL-rye.txt').read_text(encoding='utf-8')
    body = ref[ref.index('This Font Software is licensed under'):]
    return '\n'.join(header_lines) + '\n\n' + body


def specimen(font_path, out, lines, size=96):
    from PIL import Image, ImageDraw, ImageFont
    font = ImageFont.truetype(str(font_path), size, layout_engine=ImageFont.Layout.BASIC)
    small = ImageFont.truetype(str(font_path), size // 2, layout_engine=ImageFont.Layout.BASIC)
    rows = [(t.lstrip('~'), small if t.startswith('~') else font) for t in lines]
    w = max(int(fn.getlength(t)) for t, fn in rows) + 120
    h = sum(int(fn.size * 1.45) for _, fn in rows) + 100
    img = Image.new('RGB', (w, h), '#f4efe4'); d = ImageDraw.Draw(img); y = 50
    for t, fn in rows:
        d.text((60, y), t, font=fn, fill='#1c1610'); y += int(fn.size * 1.45)
    img.save(out)


def copy(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(src, dst)


# 마커 글꼴은 '겸손마커'로 빌드된 것을 '뭉툭마커'로 이름을 바꿔 배포한다
MARKER = ('Mungtuk Marker', '뭉툭마커')
MARKER_FIX = [('Gyeomson Marker', MARKER[0]), ('GyeomsonMarker', MARKER[0].replace(' ', '')), ('겸손마커', MARKER[1])]


def copy_builder(pkg, fix_years=False):
    builder = ROOT / 'font-builder_천의체'      # 폴더 이름과 달리 마커·황야웨스턴 생성기가 들어 있다
    for n in ('preview.py', 'OFL-gamjaflower.txt', 'OFL-rye.txt'): copy(builder / n, pkg / '소스' / n)
    for n, out in (('build.py', 'build.py'), ('CLAUDE.md', '제작노트.md')):     # 소스·문서의 글꼴 이름도 맞춘다
        text = (builder / n).read_text(encoding='utf-8')
        for old, new in MARKER_FIX: text = text.replace(old, new)
        if fix_years: text = fix_holder(text)
        (pkg / '소스' / out).write_text(text, encoding='utf-8', newline='')


def make_zip(pkg):
    zp = OUT / (pkg.name + '.zip')
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for p in sorted(pkg.rglob('*')):
            if p.is_file(): z.write(p, Path(pkg.name) / p.relative_to(pkg))
    print('  -> %s  %.1f MB' % (zp.name, zp.stat().st_size / 1e6))


# ------------------------------------------------------------------ 패키지
def main():
    tmp = Path(tempfile.mkdtemp(prefix='fontrelease_'))
    with zipfile.ZipFile(ROOT / 'Suyeom-fonts.zip') as z: z.extractall(tmp / 'suyeom')
    with zipfile.ZipFile(ROOT / '두이미지_폰트_2종.zip') as z: z.extractall(tmp / 'two')

    if want('cheonui'): cheonui()
    if want('suyeom'): suyeom(tmp)
    if want('marker'): marker(tmp)
    if want('western'): western(tmp)
    shutil.rmtree(tmp, ignore_errors=True)


def cheonui():
    print('천의체'); pkg = OUT / 'Cheonui-2.1'; src = ROOT / '천의체'
    for n in ('Cheonui-Regular', 'Cheonui-Bold', 'CheonuiDeco-Regular', 'CheonuiDeco-Bold'):
        finalize(src / (n + '.ttf'), pkg / (n + '.ttf'))
    for n in ('demo.html', 'specimen.png', '포토샵_확인.jsx'): copy(src / n, pkg / n)
    copy(src / '사용안내.md', pkg / 'README.md')
    for p in [src / 'OFL.txt'] + list((src / '소스').glob('*.py')):     # 저작권자 이름을 채워서 복사
        dst = pkg / p.name if p.suffix == '.txt' else pkg / '소스' / p.name
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(fix_holder(p.read_text(encoding='utf-8')), encoding='utf-8', newline='')
    make_zip(pkg)


def suyeom(tmp):
    print('수염체'); pkg = OUT / 'Suyeom-1.0'; src = tmp / 'suyeom'
    for n in ('SuyeomBrush-Regular', 'SuyeomMustache-Regular'):
        finalize(src / (n + '.otf'), pkg / (n + '.otf'), fit_descent=True)
    for n in ('OFL.txt', 'specimen.png'): copy(src / n, pkg / n)
    copy(src / 'build.py', pkg / '소스' / 'build.py')
    copy(ROOT / 'CLAUDE_수염체 외.md', pkg / '소스' / '제작노트.md')
    make_zip(pkg)


def marker(tmp):
    print('뭉툭마커'); pkg = OUT / 'MungtukMarker-1.0'
    finalize(tmp / 'two' / 'GyeomsonMarker-Regular.ttf', pkg / 'MungtukMarker-Regular.ttf', rename=MARKER)
    (pkg / 'OFL.txt').write_text(ofl_text([
        'Copyright (c) YoonDesign Inc. All Rights Reserved. (Gamja Flower)',
        'Modifications (뭉툭마커 / Mungtuk Marker) Copyright 2026 도겸.']), encoding='utf-8')
    specimen(pkg / 'MungtukMarker-Regular.ttf', pkg / 'specimen.png',
             ['뭉툭마커 Mungtuk Marker', '겸손할 수 있을 줄 알았다', '그런데 너무 힘들다 0123456789',
              '~다람쥐 헌 쳇바퀴에 타고파 · 뷁 쀍 똠방각하 · The quick brown fox jumps!?'])
    copy_builder(pkg); make_zip(pkg)


def western(tmp):
    print('황야웨스턴'); pkg = OUT / 'HwangyaWestern-1.0'
    finalize(tmp / 'two' / 'HwangyaWestern-Regular.ttf', pkg / 'HwangyaWestern-Regular.ttf')
    (pkg / 'OFL.txt').write_text(ofl_text([
        'Copyright (c) 2011 by Sorkin Type Co (www.sorkintype.com),',
        'with Reserved Font Name "Rye".',
        "Copyright 2017-2023 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'. (Noto Serif CJK)",
        'Modifications (황야웨스턴 / Hwangya Western) Copyright 2026 도겸.']), encoding='utf-8')
    specimen(pkg / 'HwangyaWestern-Regular.ttf', pkg / 'specimen.png',
             ['황야웨스턴 Hwangya Western', '황야의 무법자 WANTED', '석양이 지는 목장 0123456789',
              '~다람쥐 헌 쳇바퀴에 타고파 · 뷁 쀍 똠방각하 · The quick brown fox jumps!?'])
    copy_builder(pkg, fix_years=True); make_zip(pkg)


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    if '--zip' in sys.argv:              # README 만 고쳤을 때: 폰트는 그대로 두고 zip 만 다시 묶는다
        for pkg in sorted(p for p in OUT.iterdir() if p.is_dir() and p.name != '도구'): make_zip(pkg)
    else:
        main()
