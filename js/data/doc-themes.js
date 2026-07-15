/* ============================================================
   문서 디자인 테마 (v1.3) — 제안서·기획안·디자인제안 공용
   같은 내용, 비주얼만 다름. 5종.
   ============================================================ */
var GF_DOC_THEMES = {
  basic: { name: '기본 (깔끔·중립)', desc: '어디에나 무난한 프로페셔널',
    bg:'#fff', paper:'#fff', ink:'#1C1A17', ink2:'#3d3931', ink3:'#8A857C',
    accent:'#EA6A2E', accentDeep:'#B84A18', accentSoft:'#FDEFE5', accentLine:'#F7D3BC', line:'#DED9CF',
    headBg:'#F6F5F2', headBar:'#EA6A2E', headColor:'#1C1A17', coverBorder:'#1C1A17',
    tag:'#B84A18', radius:'10px', font:'"Pretendard","Malgun Gothic",sans-serif', headFont:'inherit',
    h1w:'800', h1sp:'-0.02em', hlBg:'#FDEFE5', hlBorder:'#F7D3BC', hlColor:'#B84A18' },

  kids: { name: '귀여움 · 키즈', desc: '밝고 통통, 아이·패밀리 타깃',
    bg:'#FFFDF5', paper:'#fff', ink:'#3A2E22', ink2:'#5c5040', ink3:'#A79B86',
    accent:'#FF8A3D', accentDeep:'#E8590C', accentSoft:'#FFF1DF', accentLine:'#FFD9B0', line:'#FCE7C9',
    headBg:'#FFF3D6', headBar:'#FFC233', headColor:'#7A4A12', coverBorder:'#FFC233',
    tag:'#E8590C', radius:'18px', font:'"Pretendard","Malgun Gothic",sans-serif', headFont:'inherit',
    h1w:'800', h1sp:'-0.01em', hlBg:'#FFF3D6', hlBorder:'#FFD9B0', hlColor:'#C9760C' },

  lovely: { name: '러블리 · 파스텔', desc: '부드러운 감성, 팬시·소녀 타깃',
    bg:'#FFF7FA', paper:'#fff', ink:'#4A3542', ink2:'#6b5460', ink3:'#B49AA6',
    accent:'#EA6AA0', accentDeep:'#C24A80', accentSoft:'#FDEBF3', accentLine:'#F6C9DD', line:'#F1DEE7',
    headBg:'#FBEAF2', headBar:'#EA6AA0', headColor:'#7A3A5A', coverBorder:'#EA6AA0',
    tag:'#C24A80', radius:'16px', font:'"Pretendard","Malgun Gothic",sans-serif', headFont:'inherit',
    h1w:'700', h1sp:'-0.01em', hlBg:'#FBEAF2', hlBorder:'#F6C9DD', hlColor:'#C24A80' },

  luxury: { name: '럭셔리 · 고급', desc: '아이보리+골드, 프리미엄·한정판',
    bg:'#FBF9F4', paper:'#FFFDF8', ink:'#26221A', ink2:'#4a4438', ink3:'#9a9078',
    accent:'#A9852F', accentDeep:'#836423', accentSoft:'#F5EEDD', accentLine:'#E4D3A6', line:'#E7E0D0',
    headBg:'#F5EEDD', headBar:'#A9852F', headColor:'#3A3020', coverBorder:'#26221A',
    tag:'#A9852F', radius:'4px', font:'"Pretendard","Malgun Gothic",sans-serif', headFont:'Georgia,"Nanum Myeongjo",serif',
    h1w:'700', h1sp:'0.01em', hlBg:'#F5EEDD', hlBorder:'#E4D3A6', hlColor:'#836423' },

  dark: { name: '다크 · 그로테스크', desc: '검정+강렬 레드, 호러·매니아·게임',
    bg:'#17151A', paper:'#1E1B22', ink:'#EDE8F0', ink2:'#B8B2C0', ink3:'#7C7488',
    accent:'#E23A4E', accentDeep:'#FF5566', accentSoft:'#2A1A20', accentLine:'#4A2730', line:'#332E3A',
    headBg:'#251F2C', headBar:'#E23A4E', headColor:'#F3EEF6', coverBorder:'#E23A4E',
    tag:'#FF5566', radius:'6px', font:'"Pretendard","Malgun Gothic",sans-serif', headFont:'inherit',
    h1w:'800', h1sp:'-0.02em', hlBg:'#2A1A20', hlBorder:'#4A2730', hlColor:'#FF7A88' }
};

/* 토큰 → 3개 문서 공용 CSS */
function gfDocThemeCss(id) {
  var t = GF_DOC_THEMES[id] || GF_DOC_THEMES.basic;
  return '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:' + t.font + ';color:' + t.ink + ';line-height:1.7;background:' + t.bg + '}'
    + '.page{max-width:820px;margin:0 auto;padding:52px 46px;background:' + t.paper + '}'
    + '.cover{border-bottom:2px solid ' + t.coverBorder + ';padding-bottom:22px;margin-bottom:8px}'
    + '.page.cover{border-bottom:none}'   /* proposal 표지 페이지 */
    + '.tag{font-size:12px;font-weight:800;color:' + t.tag + ';letter-spacing:.1em}'
    + 'h1{font-size:31px;font-weight:' + t.h1w + ';margin:10px 0 6px;letter-spacing:' + t.h1sp + ';font-family:' + t.headFont + ';color:' + t.ink + '}'
    + '.cover .sub,.cover p{font-size:15px;color:' + t.ink2 + '}'
    + '.meta,.cover .meta{font-size:12.5px;color:' + t.ink3 + ';margin-top:10px}'
    + 'h2{font-size:18px;font-weight:800;margin:32px 0 12px;padding:8px 14px;background:' + t.headBg + ';border-left:4px solid ' + t.headBar + ';border-radius:0 ' + t.radius + ' ' + t.radius + ' 0;color:' + t.headColor + ';font-family:' + t.headFont + '}'
    + 'h3{font-size:14.5px;font-weight:700;margin:16px 0 6px;color:' + t.ink + '}'
    + 'p,li{font-size:14px;color:' + t.ink2 + '}ul{padding-left:20px}li{margin:3px 0}'
    + 'table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}'
    + 'th{background:' + t.headBg + ';text-align:left;padding:9px 11px;border:1px solid ' + t.line + ';font-weight:700;color:' + t.ink + '}'
    + 'td{padding:9px 11px;border:1px solid ' + t.line + ';color:' + t.ink2 + '}'
    + '.num{text-align:right;font-variant-numeric:tabular-nums}'
    + '.total td{font-weight:800;background:' + t.accentSoft + ';color:' + t.ink + '}'
    + '.hl{background:' + t.hlBg + ';border:1.5px solid ' + t.hlBorder + ';border-radius:' + t.radius + ';padding:14px 18px;margin:12px 0;font-size:13.5px;color:' + t.ink2 + '}'
    + '.hl b{color:' + t.hlColor + '}'
    + '.sw{display:inline-block;width:15px;height:15px;border-radius:4px;border:1px solid rgba(128,128,128,.3);vertical-align:-3px;margin-right:2px}'
    /* designquote 전용 */
    + '.concept{display:flex;gap:16px;align-items:center;background:' + t.headBg + ';border-radius:' + t.radius + ';padding:16px 20px;margin:12px 0}'
    + '.pal{display:flex;gap:6px}.pal span{width:34px;height:34px;border-radius:8px;border:1px solid rgba(128,128,128,.25)}'
    + '.mocks{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}'
    + '.mock{border:1px solid ' + t.line + ';border-radius:' + t.radius + ';overflow:hidden;background:' + t.paper + '}'
    + '.mock .st{aspect-ratio:1/1;background:' + t.bg + ';display:flex;align-items:center;justify-content:center}.mock .st svg{width:100%;height:100%}'
    + '.mock .nm{font-size:11.5px;font-weight:700;padding:7px 10px;text-align:center;color:' + t.ink + '}'
    /* proposal 표지 */
    + '.cover-tag{font-size:13px;font-weight:700;color:' + t.accent + ';letter-spacing:.14em}'
    + '.cover-h1{font-size:38px;font-weight:' + t.h1w + ';margin:14px 0 10px;letter-spacing:' + t.h1sp + ';line-height:1.3;font-family:' + t.headFont + ';color:' + t.ink + '}'
    + '.foot{margin-top:44px;padding-top:12px;border-top:1px solid ' + t.line + ';font-size:11.5px;color:' + t.ink3 + '}'
    + '@media print{.page{padding:22px 8px}h2{page-break-after:avoid}}';
}
