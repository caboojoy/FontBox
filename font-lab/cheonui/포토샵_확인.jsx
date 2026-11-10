// 천의체 포토샵 확인용 스크립트
// 사용법: 포토샵 > 파일 > 스크립트 > 찾아보기... 에서 이 파일을 선택하세요.
// 새 문서에 시험 문구 4줄을 만듭니다. 저장하거나 기존 문서를 건드리지 않습니다.
#target photoshop
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
var doc = app.documents.add(1800, 1150, 72, "천의체 확인", NewDocumentMode.RGB, DocumentFill.WHITE);
var bg = new SolidColor(); bg.rgb.hexValue = "ECDEBE";
doc.selection.selectAll(); doc.selection.fill(bg); doc.selection.deselect();
function add(s, size, y, font) {
  var l = doc.artLayers.add(); l.kind = LayerKind.TEXT;
  var t = l.textItem; t.contents = s; t.font = font; t.size = new UnitValue(size, "px");
  var c = new SolidColor(); c.rgb.hexValue = "1C1610"; t.color = c; t.position = [60, y];
}
add("1. 십이 지신  (장식 문자 직접 입력)", 80, 170, "Cheonui-Bold");
add("2. 십이지신도  (천의체 장식)", 80, 420, "CheonuiDeco-Bold");
add("3. 병오년 새해 복  (자동 장식)", 80, 670, "Cheonui-Bold");
add("1번이 컬러면 SVG 지원 · 2번은 단색 구름이 정상 · 3번은 문자 패널 → OpenType → 문맥에 따른 대체 켜서 확인", 30, 1000, "Cheonui-Regular");
