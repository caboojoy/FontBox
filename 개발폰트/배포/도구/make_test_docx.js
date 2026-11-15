// 폰트 실사용 테스트용 워드 문서(폰트_실사용_테스트.docx) 생성.
// 준비: npm install docx (저장소의 package.json 에는 없다)   실행: node 개발폰트/배포/도구/make_test_docx.js 개발폰트/배포/폰트_실사용_테스트.docx
// 글꼴은 한글 이름으로 지정한다 — 한국어 윈도우의 워드는 영문 이름(Cheonui)으로는 찾지 못했다.
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, AlignmentType, LevelFormat, UnderlineType, VerticalAlign,
} = require('docx');

const UI = 'Malgun Gothic';
const ui = (text, o = {}) => new TextRun({ text, font: { ascii: UI, eastAsia: UI, hAnsi: UI }, size: 20, ...o });
const sample = (text, family, o = {}) =>
  new TextRun({ text, font: { ascii: family, eastAsia: family, hAnsi: family, cs: family }, ...o });

const label = (text) => new Paragraph({
  spacing: { before: 110, after: 30 }, keepNext: true,
  children: [ui(text, { size: 16, color: '6A5A48' })],
});
const line = (runs, o = {}) => new Paragraph({ spacing: { before: 0, after: 60, line: 240, lineRule: 'auto' }, children: runs, ...o });

const L1 = '병오년 새해 복 많이 받으세요';
const L2 = '다람쥐 헌 쳇바퀴에 타고파 0123456789';
const L3 = 'The quick brown fox jumps! (가) [나] "다" 1,234원';
const L4 = '뷁 쀍 똠방각하 – — é';

const FONTS = [
  { ko: '천의체', family: 'Cheonui', pkg: 'Cheonui-2.1', bold: true,
    note: '워드에서는 구름 장식이 붙지 않는 것이 정상입니다. 굵게는 Bold 파일로 바뀝니다.' },
  { ko: '천의체 장식', family: 'Cheonui Deco', pkg: 'Cheonui-2.1', bold: true,
    note: '모든 한글에 구름이 붙어 나옵니다. 인쇄·PDF에서는 구름이 단색일 수 있습니다.' },
  { ko: '수염체 붓털', family: 'Suyeom Brush', pkg: 'Suyeom-1.0',
    note: '한글 2,350자만 들어 있습니다. 마지막 줄의 "뷁 쀍 똠"은 다른 글꼴로 나오는 것이 정상입니다.' },
  { ko: '수염체 콧수염', family: 'Suyeom Mustache', pkg: 'Suyeom-1.0',
    note: '한글 2,350자만 들어 있습니다. 마지막 줄의 "뷁 쀍 똠"은 다른 글꼴로 나오는 것이 정상입니다.' },
  { ko: '뭉툭마커', family: 'Mungtuk Marker', pkg: 'MungtukMarker-1.0',
    note: '줄표(– —)와 é는 다른 글꼴로 나오는 것이 정상입니다.' },
  { ko: '황야웨스턴', family: 'Hwangya Western', pkg: 'HwangyaWestern-1.0',
    note: 'é는 다른 글꼴로 나오는 것이 정상입니다. 닳은 자국은 큰 글씨에서 보입니다.' },
];

const children = [];
children.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('폰트 실사용 테스트')] }));
children.push(new Paragraph({
  spacing: { after: 120 },
  children: [ui('바이브코딩 개발 폰트 5종(글꼴 6개)이 워드에서 제대로 나오는지 확인하는 문서입니다. 릴리스 fonts-v1.0의 파일을 설치한 뒤 이 문서를 여세요.')],
}));
children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('확인 순서')] }));
[
  '예전에 설치한 천의체·천의체 장식이 있으면 먼저 제거합니다 (설정 → 개인 설정 → 글꼴).',
  '릴리스의 zip 4개를 풀어 .ttf·.otf 파일 8개를 설치하고, 워드를 껐다가 다시 엽니다.',
  '아래 글꼴별 견본을 보고 맨 끝의 점검표에 표시합니다. 네모(□)나 다른 글꼴로 바뀐 글자가 있는지 봅니다.',
  '파일 → 다른 이름으로 저장 → PDF로 저장한 뒤, PDF에서도 같은지 확인합니다.',
  'A4로 한 부 인쇄해 가는 장식과 질감이 뭉개지지 않는지 봅니다.',
].forEach((t) => children.push(new Paragraph({ numbering: { reference: 'steps', level: 0 }, spacing: { after: 40 }, children: [ui(t)] })));
children.push(new Paragraph({
  spacing: { before: 120, after: 0 },
  children: [ui('견본이 맑은 고딕이나 굴림처럼 평범한 글꼴로 보이면 그 글꼴이 설치되지 않은 것입니다.', { color: '9A3412' })],
}));

FONTS.forEach((f, i) => {
  children.push(new Paragraph({
    heading: HeadingLevel.HEADING_1, pageBreakBefore: true,
    children: [new TextRun(`${i + 1}. ${f.ko} (${f.family})`)],
  }));
  children.push(new Paragraph({ spacing: { after: 60 }, keepNext: true, children: [ui(f.note, { size: 18, color: '6A5A48' })] }));

  children.push(label('10pt — 작은 글씨'));
  children.push(line([sample(L2, f.ko, { size: 20 })]));
  children.push(line([sample(L3, f.ko, { size: 20 })]));
  children.push(label('24pt — 제목 크기'));
  children.push(line([sample(L1, f.ko, { size: 48 })], { spacing: { before: 0, after: 60, line: 240, lineRule: 'auto' } }));
  children.push(line([sample(L2, f.ko, { size: 48 })], { spacing: { before: 0, after: 60, line: 240, lineRule: 'auto' } }));
  children.push(label('40pt — 큰 제목 (두 줄: 위아래가 겹치거나 잘리지 않는지)'));
  children.push(line([sample('새해 복 많이', f.ko, { size: 80 })], { spacing: { before: 0, after: 0, line: 240, lineRule: 'auto' } }));
  children.push(line([sample('받으세요 2026', f.ko, { size: 80 })], { spacing: { before: 0, after: 60, line: 240, lineRule: 'auto' } }));
  children.push(label('24pt 밑줄 — 글자 아래에 선이 보이는지'));
  children.push(line([sample('밑줄 테스트 Underline 123', f.ko, { size: 48, underline: { type: UnderlineType.SINGLE } })]));
  children.push(label(f.bold ? '24pt 굵게 — Bold 파일로 바뀌는지' : '24pt 굵게 — 이 글꼴은 Bold가 없어 워드가 인위적으로 두껍게 만듭니다'));
  children.push(line([sample('굵게 테스트 Bold 123', f.ko, { size: 48, bold: true })]));
  children.push(label('18pt 특수 문자 — 글꼴에 없는 글자는 다른 글꼴로 나옵니다'));
  children.push(line([sample(L4, f.ko, { size: 36 })]));

  if (f.family === 'Cheonui') {
    children.push(label('24pt 섞어 쓰기 — 단어 첫 글자만 "천의체 장식"으로 바꾼 예'));
    const mix = [['병', '오년 '], ['새', '해 '], ['복', ' 많이 받으세요']];
    children.push(line(mix.flatMap(([d, r]) => [
      sample(d, '천의체 장식', { size: 48, bold: true }), sample(r, '천의체', { size: 48, bold: true }),
    ]), { spacing: { before: 0, after: 60, line: 240, lineRule: 'auto' } }));
  }
});

// 점검표
const CHECKS = [
  '글꼴 목록에 한글 이름으로 나온다',
  '한글·영문·숫자·기호가 이 글꼴로 나온다',
  '10pt에서 글자가 깨지지 않는다',
  '큰 제목 두 줄이 겹치거나 잘리지 않는다',
  '밑줄이 보인다',
  '굵게가 적용된다',
  'PDF로 저장해도 글꼴이 그대로다',
  '인쇄물에서 장식·질감이 뭉개지지 않는다',
];
const W0 = 3506, WN = 920;                       // 3506 + 6×920 = 9026 (A4, 여백 1인치)
const border = { style: BorderStyle.SINGLE, size: 4, color: 'BFB39B' };
const borders = { top: border, bottom: border, left: border, right: border };
const cell = (runs, width, o = {}) => new TableCell({
  width: { size: width, type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
  margins: { top: 70, bottom: 70, left: 100, right: 100 }, ...o,
  children: [new Paragraph({ alignment: o.center ? AlignmentType.CENTER : AlignmentType.LEFT, children: runs })],
});
const head = { fill: 'EFE7D6', type: ShadingType.CLEAR, color: 'auto' };
const rows = [new TableRow({
  tableHeader: true,
  children: [cell([ui('확인 항목', { bold: true, size: 18 })], W0, { shading: head }),
    ...FONTS.map((f) => cell([ui(f.ko, { bold: true, size: 15 })], WN, { shading: head, center: true }))],
})];
CHECKS.forEach((c) => rows.push(new TableRow({
  children: [cell([ui(c, { size: 18 })], W0), ...FONTS.map(() => cell([ui('□', { size: 24 })], WN, { center: true }))],
})));

children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, children: [new TextRun('점검표')] }));
children.push(new Paragraph({ spacing: { after: 120 }, children: [ui('정상이면 □를 ■로 바꾸거나 인쇄해서 표시하세요. 문제가 있는 칸은 화면을 캡처해 두면 원인을 찾기 쉽습니다.')] }));
children.push(new Table({ width: { size: W0 + WN * FONTS.length, type: WidthType.DXA }, columnWidths: [W0, ...FONTS.map(() => WN)], rows }));
children.push(new Paragraph({ spacing: { before: 200 }, children: [ui('수염체는 한글 2,350자만 지원하므로 "뷁 쀍 똠"이 다른 글꼴로 나와도 정상입니다. 천의체는 워드에서 자동 구름 장식이 붙지 않으며, 장식이 필요한 글자만 "천의체 장식"으로 바꿔 씁니다.', { size: 18, color: '6A5A48' })] }));

const heading = (size, before, after) => ({
  run: { font: { ascii: UI, eastAsia: UI, hAnsi: UI }, size, bold: true, color: '1C1610' },
  paragraph: { spacing: { before, after }, keepNext: true },
});
const doc = new Document({
  creator: 'FontBox', title: '폰트 실사용 테스트',
  styles: {
    default: {
      document: { run: { font: { ascii: UI, eastAsia: UI, hAnsi: UI }, size: 20 } },
      title: heading(40, 0, 160),
      heading1: heading(28, 280, 100),
    },
  },
  numbering: { config: [{ reference: 'steps', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 420, hanging: 420 } }, run: { font: { ascii: UI, eastAsia: UI, hAnsi: UI } } } }] }] },
  sections: [{ properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } }, children }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(process.argv[2], buf); console.log('saved', process.argv[2], buf.length); });
