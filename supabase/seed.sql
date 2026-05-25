-- =============================================
-- seed.sql — FontBox 초기 폰트 데이터 (57개)
-- 실행 순서: 01_fonts_schema.sql 이후 한 번만 실행
-- 테이블: fonts.fonts (스키마 명시)
-- =============================================

insert into fonts.fonts
  (name, slug, designer, foundry, category, tags, license, is_commercial,
   cdn_url, css_family, weights, preview_ko, preview_en,
   language, supports_korean, supports_latin, is_featured)
values

-- 한글 폰트 25개
('Noto Sans KR','noto-sans-kr','Google','Google','gothic',
 '{"고딕","본문","깔끔","현대적","다목적"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@100;300;400;500;700;900&display=swap',
 'Noto Sans KR','{"100","300","400","500","700","900"}',
 '다람쥐 헌 쳇바퀴에 타고파',null,'korean',true,true,true),

('Noto Serif KR','noto-serif-kr','Google','Google','myeongjo',
 '{"명조","본문","전통","우아함","독서"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@300;400;600;700&display=swap',
 'Noto Serif KR','{"300","400","600","700"}',
 '세상의 모든 글자는 아름답다',null,'korean',true,true,true),

('나눔고딕','nanum-gothic','한재준','NAVER','gothic',
 '{"고딕","본문","기업","공공","깔끔"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap',
 'Nanum Gothic','{"400","700","800"}',
 '나눔의 정신으로 만든 무료 폰트',null,'korean',true,true,true),

('나눔명조','nanum-myeongjo','한재준','NAVER','myeongjo',
 '{"명조","본문","전통","격식","독서"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&display=swap',
 'Nanum Myeongjo','{"400","700","800"}',
 '한국의 전통 명조체',null,'korean',true,true,false),

('나눔손글씨 펜','nanum-pen','한재준','NAVER','handwriting',
 '{"손글씨","귀여운","개성","자유","일상"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap',
 'Nanum Pen Script','{"400"}',
 '손으로 쓴 것 같은 자연스러운 글씨',null,'korean',true,true,false),

('나눔손글씨 붓','nanum-brush','한재준','NAVER','handwriting',
 '{"손글씨","붓글씨","예술","전통","감성"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Nanum+Brush+Script&display=swap',
 'Nanum Brush Script','{"400"}',
 '붓으로 쓴 듯한 힘찬 획',null,'korean',true,false,false),

('Black Han Sans','black-han-sans','Jongsang Yoon','Google','display',
 '{"디스플레이","제목","강렬","임팩트","헤드라인"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&display=swap',
 'Black Han Sans','{"400"}',
 '강렬한 임팩트 헤드라인',null,'korean',true,true,true),

('Jua','jua','Woowahan Brothers','Google','display',
 '{"디스플레이","둥근","귀여운","제목","앱"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Jua&display=swap',
 'Jua','{"400"}',
 '동글동글 귀여운 제목 폰트',null,'korean',true,true,false),

('Gaegu','gaegu','TanType','Google','handwriting',
 '{"손글씨","자연스러운","일상","노트","캐주얼"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap',
 'Gaegu','{"300","400","700"}',
 '노트에 끄적인 손글씨 느낌',null,'korean',true,true,false),

('Dokdo','dokdo','NAVER','NAVER','display',
 '{"디스플레이","개성","독특","강렬"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Dokdo&display=swap',
 'Dokdo','{"400"}',
 '독특하고 개성 넘치는 폰트',null,'korean',true,false,false),

('Gowun Dodum','gowun-dodum','Google','Google','gothic',
 '{"고딕","둥근","귀여운","본문","가독성"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Gowun+Dodum&display=swap',
 'Gowun Dodum','{"400"}',
 '둥글둥글 따뜻한 고딕체',null,'korean',true,true,true),

('Gowun Batang','gowun-batang','Google','Google','myeongjo',
 '{"명조","바탕체","본문","독서","가독성"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap',
 'Gowun Batang','{"400","700"}',
 '편안하게 읽히는 바탕체',null,'korean',true,true,false),

('Gothic A1','gothic-a1','Yanghee Lee','Google','gothic',
 '{"고딕","현대적","다목적","깔끔","다양한굵기"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Gothic+A1:wght@100;200;300;400;500;600;700;800;900&display=swap',
 'Gothic A1','{"100","200","300","400","500","600","700","800","900"}',
 '9가지 굵기를 지원하는 다목적 고딕',null,'korean',true,true,true),

('Do Hyeon','do-hyeon','Jongsang Yoon','Google','gothic',
 '{"고딕","모던","깔끔","제목","UI"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap',
 'Do Hyeon','{"400"}',
 '모던하고 깔끔한 제목용 고딕',null,'korean',true,true,false),

('IBM Plex Sans KR','ibm-plex-sans-kr','Mike Abbink','IBM','gothic',
 '{"고딕","IBM","기업","테크","현대적"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@100;200;300;400;500;600;700&display=swap',
 'IBM Plex Sans KR','{"100","200","300","400","500","600","700"}',
 'IBM이 만든 테크 감성 고딕체',null,'korean',true,true,true),

('Sunflower','sunflower','Yanghee Lee','Google','gothic',
 '{"고딕","밝은","화사한","여성적","브랜딩"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Sunflower:wght@300;500;700&display=swap',
 'Sunflower','{"300","500","700"}',
 '밝고 화사한 해바라기 같은 폰트',null,'korean',true,true,false),

('Poor Story','poor-story','Yoon Design','Google','handwriting',
 '{"손글씨","캐릭터","웹툰","개성","독특"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Poor+Story&display=swap',
 'Poor Story','{"400"}',
 '웹툰 느낌의 독특한 손글씨',null,'korean',true,true,false),

('Gamja Flower','gamja-flower','Yoon Design','Google','handwriting',
 '{"손글씨","귀여운","동글동글","아동"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Gamja+Flower&display=swap',
 'Gamja Flower','{"400"}',
 '감자꽃처럼 귀여운 손글씨',null,'korean',true,true,false),

('Hi Melody','hi-melody','HiType','Google','handwriting',
 '{"손글씨","여성적","부드러운","감성","다이어리"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Hi+Melody&display=swap',
 'Hi Melody','{"400"}',
 '감성 다이어리 손글씨 폰트',null,'korean',true,true,false),

('Gugi','gugi','Jaemin Cha','Google','display',
 '{"디스플레이","레트로","게임","픽셀","개성"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Gugi&display=swap',
 'Gugi','{"400"}',
 '레트로 게임 감성의 독특한 폰트',null,'korean',true,true,false),

('나눔고딕코딩','nanum-gothic-coding','한재준','NAVER','monospace',
 '{"모노스페이스","코딩","개발자","등폭"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Nanum+Gothic+Coding:wght@400;700&display=swap',
 'Nanum Gothic Coding','{"400","700"}',
 'const hello = "안녕하세요";',null,'korean',true,true,false),

('Cute Font','cute-font','Yoon Design','Google','display',
 '{"디스플레이","귀여운","아동","밝은","팝"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Cute+Font&display=swap',
 'Cute Font','{"400"}',
 '귀엽고 발랄한 디스플레이 폰트',null,'korean',true,true,false),

('Kirang Haerang','kirang-haerang','Yoon Design','Google','display',
 '{"디스플레이","개성","빈티지","레트로"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Kirang+Haerang&display=swap',
 'Kirang Haerang','{"400"}',
 '빈티지 감성의 독특한 폰트',null,'korean',true,true,false),

('연성체','yeon-sung','Yoon Design','Google','handwriting',
 '{"손글씨","부드러운","감성","필기"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Yeon+Sung&display=swap',
 'Yeon Sung','{"400"}',
 '부드럽고 감성적인 연성체',null,'korean',true,true,false),

('Single Day','single-day','Yoon Design','Google','handwriting',
 '{"손글씨","일상","캐주얼"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Single+Day&display=swap',
 'Single Day','{"400"}',
 '하루하루 쌓이는 일상의 기록',null,'korean',true,true,false),

-- 영문 폰트 30개
('Inter','inter','Rasmus Andersson','Google','sans-serif',
 '{"sans-serif","modern","ui","clean","versatile"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;900&display=swap',
 'Inter','{"100","300","400","500","600","700","900"}',
 null,'The future of interface design','english',false,true,true),

('DM Sans','dm-sans','Colophon Foundry','Google','sans-serif',
 '{"sans-serif","geometric","modern","branding","clean"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap',
 'DM Sans','{"300","400","500","700"}',
 null,'Geometric Sans for Modern Brands','english',false,true,true),

('Outfit','outfit','On Brand','Google','sans-serif',
 '{"sans-serif","geometric","minimal","startup","tech"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;900&display=swap',
 'Outfit','{"100","300","400","500","600","700","900"}',
 null,'Clean Geometric for Startups','english',false,true,true),

('Plus Jakarta Sans','plus-jakarta-sans','Tokotype','Google','sans-serif',
 '{"sans-serif","modern","ui","dashboard","saas"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap',
 'Plus Jakarta Sans','{"300","400","500","600","700","800"}',
 null,'The perfect SaaS & Dashboard font','english',false,true,false),

('Manrope','manrope','Mikhail Sharanda','Google','sans-serif',
 '{"sans-serif","geometric","elegant","modern","variable"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap',
 'Manrope','{"200","300","400","500","600","700","800"}',
 null,'Elegant Geometric Variable Font','english',false,true,false),

('Nunito','nunito','Vernon Adams','Google','sans-serif',
 '{"sans-serif","rounded","friendly","app","ui"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;500;600;700;800;900&display=swap',
 'Nunito','{"200","300","400","500","600","700","800","900"}',
 null,'Friendly Rounded Sans for Apps','english',false,true,false),

('Rubik','rubik','Hubert Fischer','Google','sans-serif',
 '{"sans-serif","rounded","bold","branding","tech"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap',
 'Rubik','{"300","400","500","600","700","800","900"}',
 null,'Bold Rounded for Modern Brands','english',false,true,false),

('Playfair Display','playfair-display','Claus Eggers','Google','serif',
 '{"serif","elegant","editorial","luxury","magazine"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&display=swap',
 'Playfair Display','{"400","500","600","700","800","900"}',
 null,'Elegant Editorial Typography','english',false,true,true),

('Merriweather','merriweather','Sorkin Type','Google','serif',
 '{"serif","reading","body","comfortable","news"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap',
 'Merriweather','{"300","400","700","900"}',
 null,'Designed for comfortable long-form reading','english',false,true,false),

('Cormorant','cormorant','Christian Thalmann','Google','serif',
 '{"serif","luxury","fashion","elegant","display"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600;700&display=swap',
 'Cormorant','{"300","400","500","600","700"}',
 null,'Luxury Fashion Editorial Font','english',false,true,true),

('Lora','lora','Cyreal','Google','serif',
 '{"serif","modern","calligraphy","blog","reading"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
 'Lora','{"400","500","600","700"}',
 null,'Modern serif with calligraphic roots','english',false,true,false),

('DM Serif Display','dm-serif','Colophon Foundry','Google','serif',
 '{"serif","display","editorial","contrast","elegant"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap',
 'DM Serif Display','{"400"}',
 null,'High Contrast Display Serif','english',false,true,false),

('Oswald','oswald','Vernon Adams','Google','display',
 '{"display","bold","condensed","headline","poster"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap',
 'Oswald','{"200","300","400","500","600","700"}',
 null,'BOLD CONDENSED HEADLINES','english',false,true,true),

('Bebas Neue','bebas-neue','Ryoichi Tsunekawa','Google','display',
 '{"display","condensed","poster","impact","uppercase"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
 'Bebas Neue','{"400"}',
 null,'POWERFUL DISPLAY IMPACT','english',false,true,false),

('Space Grotesk','space-grotesk','Florian Karsten','Google','display',
 '{"display","tech","futuristic","startup","modern"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
 'Space Grotesk','{"300","400","500","600","700"}',
 null,'Tech & Futuristic Display Font','english',false,true,false),

('Anton','anton','Vernon Adams','Google','display',
 '{"display","bold","impact","sports","headline"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Anton&display=swap',
 'Anton','{"400"}',
 null,'LOUD BOLD HEADLINE FONT','english',false,true,false),

('Ultra','ultra','Cyreal','Google','display',
 '{"display","heavy","serif","poster","impactful"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Ultra&display=swap',
 'Ultra','{"400"}',
 null,'Ultra Heavy Serif Display','english',false,true,false),

('Dancing Script','dancing-script','Impallari Type','Google','script',
 '{"script","elegant","wedding","invitation","cursive"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap',
 'Dancing Script','{"400","600","700"}',
 null,'Elegant Script for Special Occasions','english',false,true,true),

('Pacifico','pacifico','Vernon Adams','Google','script',
 '{"script","fun","casual","logo","retro"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
 'Pacifico','{"400"}',
 null,'Fun & Casual Script Logo','english',false,true,false),

('Great Vibes','great-vibes','TypeSETit','Google','script',
 '{"script","luxury","calligraphy","wedding","formal"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap',
 'Great Vibes','{"400"}',
 null,'Luxurious Calligraphy Script','english',false,true,false),

('Sacramento','sacramento','Astigmatic','Google','script',
 '{"script","thin","elegant","minimalist","branding"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Sacramento&display=swap',
 'Sacramento','{"400"}',
 null,'Minimal & Elegant Thin Script','english',false,true,false),

('Satisfy','satisfy','Sideshow','Google','script',
 '{"script","casual","flowing","signature","brand"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap',
 'Satisfy','{"400"}',
 null,'Flowing Casual Script','english',false,true,false),

('Roboto Slab','roboto-slab','Christian Robertson','Google','slab-serif',
 '{"slab-serif","robust","reading","editorial","versatile"}','apache-2',true,
 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@100;300;400;500;700;900&display=swap',
 'Roboto Slab','{"100","300","400","500","700","900"}',
 null,'Robust Slab Serif for Editorial','english',false,true,false),

('Courier Prime','courier-prime','Quote-Unquote','Google','slab-serif',
 '{"slab-serif","typewriter","retro","screenplay","classic"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap',
 'Courier Prime','{"400","700"}',
 null,'Classic Typewriter Style Font','english',false,true,false),

('Fira Code','fira-code','Nikita Prokopov','Google','monospace',
 '{"monospace","coding","developer","ligatures","terminal"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
 'Fira Code','{"300","400","500","600","700"}',
 null,'const code = () => "beautiful"','english',false,true,true),

('JetBrains Mono','jetbrains-mono','JetBrains','JetBrains','monospace',
 '{"monospace","coding","developer","ide","terminal"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;300;400;500;700&display=swap',
 'JetBrains Mono','{"100","300","400","500","700"}',
 null,'function dev() { return joy; }','english',false,true,true),

('Source Code Pro','source-code-pro','Paul D. Hunt','Adobe','monospace',
 '{"monospace","coding","adobe","clear","terminal"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400;500;600;700;900&display=swap',
 'Source Code Pro','{"200","300","400","500","600","700","900"}',
 null,'Monospace for Serious Coders','english',false,true,false),

('Space Mono','space-mono','Colophon Foundry','Google','monospace',
 '{"monospace","tech","retro","terminal","geometric"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap',
 'Space Mono','{"400","700"}',
 null,'>>> Retro Terminal Aesthetic','english',false,true,false),

-- 한+영 폰트 2개
('Noto Sans','noto-sans','Google','Google','sans-serif',
 '{"sans-serif","다국어","유니코드","글로벌"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@100;300;400;500;700;900&display=swap',
 'Noto Sans','{"100","300","400","500","700","900"}',
 '모든 언어를 위한 폰트','Universal Font for Every Language','both',true,true,false),

('IBM Plex Sans','ibm-plex-sans','Mike Abbink','IBM','sans-serif',
 '{"sans-serif","IBM","tech","global","corporate"}','ofl',true,
 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;300;400;500;600;700&display=swap',
 'IBM Plex Sans','{"100","300","400","500","600","700"}',
 'IBM 테크 감성','IBM Plex Sans — Tech Corporate','both',false,true,false);
