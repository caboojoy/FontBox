"""배포 패키지 검증. 문제가 하나라도 있으면 종료 코드 1.

    python 배포/도구/verify.py

필요: pip install fonttools brotli uharfbuzz   (선택: opentype-sanitizer — 브라우저와 같은 검사기)
"""
import io, os, subprocess, sys
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb

OUT = Path(__file__).resolve().parent.parent
HANGUL = {'Suyeom': 2350}                        # 그 밖에는 11,172자 전부
RESERVED = ('source', 'rye', 'noto', 'gamja')    # 원본 폰트의 예약 이름·상표: 폰트 이름에 쓰면 안 된다
fails = []


def check(font, ok, msg):
    if not ok: fails.append('%s: %s' % (font, msg))
    return ok


def shape(path, text, feats=None):
    font = hb.Font(hb.Face(hb.Blob.from_file_path(str(path))))
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, feats or {})
    return [(font.glyph_to_string(i.codepoint), p.x_advance) for i, p in zip(buf.glyph_infos, buf.glyph_positions)]


def ots(path):
    try:
        import ots as o
    except ImportError:
        return None
    r = subprocess.run([sys.executable, '-m', 'ots', str(path)], capture_output=True, text=True)
    out = (r.stdout + r.stderr).strip()
    return 'PASS' if r.returncode == 0 and 'WARNING' not in out else out[:200]


def verify(path):
    n = path.name; f = TTFont(path); c = lambda ok, msg: check(n, ok, msg)
    name, os2, head, hhea, post = f['name'], f['OS/2'], f['head'], f['hhea'], f['post']
    g = lambda i, lang=0x409: (name.getName(i, 3, 1, lang).toUnicode() if name.getName(i, 3, 1, lang) else None)
    for i in (0, 1, 2, 3, 4, 5, 6, 13, 14): c(g(i), 'name ID %d 없음' % i)
    c(g(1, 0x412), '한글 글꼴 이름 없음')
    c('2026 도겸' in (g(0) or '') or '2026 by 도겸' in (g(0) or ''), '저작권자 이름 없음')
    c(not any(r in (g(1) + g(4) + g(6)).lower() for r in RESERVED), '폰트 이름에 예약 이름 포함')
    c('SIL Open Font License' in g(13) and g(14).startswith('https://'), '라이선스 표기')
    c(g(5) == 'Version %.3f' % head.fontRevision and g(3).startswith('%.3f;' % head.fontRevision), '버전 문자열 불일치')
    c(g(6) == path.stem, 'PostScript 이름과 파일 이름 불일치')
    c(os2.fsType == 0, '임베딩 제한(fsType)')
    bold = g(2) == 'Bold'
    c(os2.fsSelection & 0b1100001 == (0b100000 if bold else 0b1000000), 'fsSelection 스타일 비트')
    c(head.macStyle & 1 == int(bold) and os2.usWeightClass == (700 if bold else 400), '굵기 값')
    c((hhea.ascent, -hhea.descent, hhea.lineGap, os2.sTypoLineGap) == (os2.usWinAscent, os2.usWinDescent, 0, 0),
      'hhea/win 줄 높이 불일치')
    c(post.underlineThickness > 0 and os2.sxHeight > 0 and os2.sCapHeight > 0, '밑줄·x높이 값')
    cmap = f.getBestCmap()
    want = next((v for k, v in HANGUL.items() if n.startswith(k)), 11172)
    c(sum(0xAC00 <= u <= 0xD7A3 for u in cmap) == want, '한글 글자 수')
    c(all(u in cmap for u in range(0x20, 0x7F)) and 0xA0 in cmap, 'ASCII·NBSP 누락')
    gs = f.getGlyphSet(); lo = hi = 0; empty = 0
    for u, gn in cmap.items():
        if not (0x21 <= u < 0x7F or 0xAC00 <= u <= 0xD7A3): continue
        pen = BoundsPen(gs); gs[gn].draw(pen)
        if pen.bounds is None: empty += 1; continue
        lo, hi = min(lo, pen.bounds[1]), max(hi, pen.bounds[3])
    c(empty == 0, '빈 글리프 %d개' % empty)
    c(hi <= os2.usWinAscent and -lo <= os2.usWinDescent, '글자가 줄 높이 밖으로 나감 (%d..%d)' % (lo, hi))
    r = ots(path)
    if r is not None: c(r == 'PASS', 'OTS: %s' % r)
    # 웹폰트: 같은 내용인지
    w = path.with_suffix('.woff2')
    if c(w.exists(), 'woff2 없음'):
        wf = TTFont(w)
        c(wf.getBestCmap().keys() == cmap.keys() and wf['maxp'].numGlyphs == f['maxp'].numGlyphs
          and wf['name'].getDebugName(5) == g(5), 'woff2 내용이 다름')
        r = ots(w)
        if r is not None: c(r == 'PASS', 'woff2 OTS: %s' % r)
    # 셰이핑
    s = shape(path, '가 나 Ab1', {'calt': False})
    c(all(gn != '.notdef' for gn, _ in s) and s[1][1] == s[3][1], '기본 문자 셰이핑')
    if n.startswith('Cheonui-'):
        zero = lambda t, **ft: [i for i, (_, adv) in enumerate(shape(path, t, ft)) if adv == 0]
        c(zero('새해 복') == [0, 4], 'calt: 단어 첫 글자 장식')
        c(zero('새해', ss01=True) == [0, 2], 'ss01: 모든 글자 장식')
        c(len(shape(path, '새해 복', {'calt': False})) == 4, 'calt 끄기')
        a, b = shape(path, '새해'), shape(path, '새해', {'ss02': True})
        c(a[0] != b[0] and a[1:] == b[1:], 'ss02: 리본 장식')
        c('COLR' in f and 'SVG ' in f and len(f['CPAL'].palettes) == 3, '컬러 테이블')
    if n.startswith('CheonuiDeco-'):
        c(len(shape(path, '새해 복')) == 4 and f['glyf'][cmap[0xC0C8]].isComposite(), 'Deco: 장식 내장 글리프')
    return '%-30s %5d글리프  한글 %5d  v%.3f  %s' % (n, f['maxp'].numGlyphs, want, head.fontRevision, g(1, 0x412))


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    for pkg in sorted(p for p in OUT.iterdir() if p.is_dir() and p.name != '도구'):
        print(pkg.name)
        fonts = sorted(list(pkg.glob('*.ttf')) + list(pkg.glob('*.otf')))
        check(pkg.name, fonts, '폰트 없음')
        for p in fonts: print('  ' + verify(p))
        lic = pkg / 'OFL.txt'
        check(pkg.name, lic.exists() and 'SIL OPEN FONT LICENSE Version 1.1' in lic.read_text(encoding='utf-8')
              and 'Copyright' in lic.read_text(encoding='utf-8').split('\n')[0], 'OFL.txt')
        check(pkg.name, (pkg / 'README.md').exists(), 'README.md 없음')
        check(pkg.name, (OUT / (pkg.name + '.zip')).exists(), 'zip 없음')
    print('\n'.join(['', '실패 %d건' % len(fails)] + fails) if fails else '\n모두 통과')
    sys.exit(1 if fails else 0)
