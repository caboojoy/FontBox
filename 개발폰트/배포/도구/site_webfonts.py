"""FontBox 사이트 미리보기용 웹폰트를 public/webfonts/ 에 만든다.

    python 개발폰트/배포/도구/site_webfonts.py

배포 패키지(release.py 결과)의 폰트를 읽는다. 천의체·수염체는 WOFF2 를 그대로 복사하고,
용량이 큰 뭉툭마커·황야웨스턴은 자주 쓰는 한글 2,350자(KS X 1001)와 영문·기호만 추린다.
전체 글자가 든 파일은 릴리스 zip 으로 배포한다.
"""
import gc, io, shutil, sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

OUT = Path(__file__).resolve().parent.parent            # 배포/
SITE = OUT.parent.parent / 'public' / 'webfonts'

COPY = ['Cheonui-2.1/Cheonui-Regular.woff2', 'Cheonui-2.1/Cheonui-Bold.woff2',
        'Suyeom-1.0/SuyeomBrush-Regular.woff2', 'Suyeom-1.0/SuyeomMustache-Regular.woff2']
SUBSET = ['MungtukMarker-1.0/MungtukMarker-Regular.ttf', 'HwangyaWestern-1.0/HwangyaWestern-Regular.ttf']


def ksx1001():
    """KS X 1001 완성형 한글 2,350자."""
    out = []
    for hi in range(0xB0, 0xC9):
        for lo in range(0xA1, 0xFF):
            out.append(ord(bytes([hi, lo]).decode('euc-kr')))
    return out


def main():
    SITE.mkdir(parents=True, exist_ok=True)
    for rel in COPY:
        shutil.copy2(OUT / rel, SITE / Path(rel).name)
        print('  %-34s %5.2f MB (전체)' % (Path(rel).name, (SITE / Path(rel).name).stat().st_size / 1e6))
    hangul = set(ksx1001())
    for rel in SUBSET:
        font = TTFont(OUT / rel)
        keep = [c for c in font.getBestCmap() if not 0xAC00 <= c <= 0xD7A3 or c in hangul]
        opts = subset.Options()
        opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.name_languages = ['*']
        opts.notdef_outline = True; opts.glyph_names = False; opts.flavor = 'woff2'
        sub = subset.Subsetter(opts); sub.populate(unicodes=keep); sub.subset(font)
        dst = SITE / (Path(rel).stem + '.woff2')
        font.flavor = 'woff2'; font.save(dst); font.close(); del font, sub
        gc.collect()
        print('  %-34s %5.2f MB (한글 2,350자)' % (dst.name, dst.stat().st_size / 1e6))


if __name__ == '__main__':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    main()
