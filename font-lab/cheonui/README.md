# 천의체 (Cheonui) 2.1 — 소스와 문서

십이지신도의 구름(운문)과 천의를 장식으로 담은 한글 제목용 서체입니다. 사용법은 [사용안내.md](사용안내.md)를 보세요.

이 폴더에는 **소스와 문서만** 들어 있습니다. 폰트 파일(`.ttf`, `.woff2`, `.otf`)은 저장소에 넣지 않았습니다(각 약 9MB). 완성된 폰트는 작업 폴더 `바이브코딩_개발폰트/천의체/`에 있고, 아래 방법으로 다시 만들 수 있습니다. `demo.html`은 같은 폴더에 `.woff2` 파일이 있어야 동작합니다.

## 구성

| 경로 | 내용 |
|---|---|
| `src/build2.py` | 2.x 생성기: 본명조를 서브셋하고 장식 글리프 16종, COLR/CPAL 컬러, GSUB(`calt`, `ss01`~`ss03`), PUA 장식 문자를 추가 |
| `src/post.py` | 2.1 후처리: 어도비용 OpenType-SVG 컬러 추가(`svg`), 천의체 장식(Deco) 글꼴 생성(`deco`) |
| `src/build.py`, `src/variants.py` | 리본(천의) 형상 생성 함수, 구름·불꽃·매듭 장식 시안 (build2가 import함) |
| `src/spec2.py` | HarfBuzz 셰이핑으로 견본 이미지를 렌더링 |
| `legacy-1.1/` | 1.1 버전(송명체 바탕, 글자 축소 + 리본) 생성기와 견본 |
| `docs/` | 바탕·장식 시안 비교, 워드·포토샵 호환성 확인 결과 |

## 다시 만들기

필요한 것: Python 3, `fonttools`, `skia-pathops`, `uharfbuzz`, `Pillow`, `brotli`(woff2용).

1. [Noto Serif KR](https://fonts.google.com/noto/specimen/Noto+Serif+KR) 가변 폰트에서 wght 400·700 정적 인스턴스를 만들어 `NotoSerifKR-400.ttf`, `NotoSerifKR-700.ttf`로 저장합니다.
   ```bash
   fonttools varLib.instancer NotoSerifKR[wght].ttf wght=700 -o NotoSerifKR-700.ttf
   ```
2. 천의체 2.0 생성 (Regular, Bold 각각):
   ```bash
   python src/build2.py NotoSerifKR-700.ttf Cheonui-Bold.ttf Bold
   ```
3. 2.1 후처리 (SVG 컬러 추가 → 장식 글꼴 생성):
   ```bash
   python src/post.py svg Cheonui-Bold.ttf out/Cheonui-Bold.ttf
   python src/post.py deco out/Cheonui-Bold.ttf out/CheonuiDeco-Bold.ttf Bold
   ```

`build2.py`는 `src/` 안에서 실행해야 `build`, `variants` 모듈을 찾습니다.

## 라이선스

SIL Open Font License 1.1 ([OFL.txt](OFL.txt)). 바탕 글자는 © 2017-2023 Adobe (Source Han Serif / Noto Serif KR, 예약 이름 "Source")이고, 1.1은 송명체(© 2018 The SongMyung Project Authors) 기반입니다.
