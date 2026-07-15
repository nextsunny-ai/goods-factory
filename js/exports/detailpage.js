/* ============ 산출물: 상세페이지 HTML 생성 ============
   레이아웃 기준: 타이틀+감성 서브카피 / 히어로 컷 / 번호 상세컷 그리드
   / 매력 포인트 / 기본 사양표 + 확장(가격·옵션 / 배송·교환 / 주의사항)
   → 스마트스토어·자사몰에 이미지로 캡처하거나 그대로 쓸 수 있는 단일 HTML */
var GF_EXPORT_DETAIL = (function () {
  var esc = GF_UI.esc;

  function ph(label) { /* 이미지 없을 때 자리 표시 */
    return '<div class="ph"><span>' + esc(label) + '<br><small>이미지 교체 필요</small></span></div>';
  }
  function img(src, alt) {
    return src ? '<img src="' + src + '" alt="' + esc(alt) + '">' : ph(alt);
  }

  function build() {
    var proj = GF_STORE.state.project;
    var dt = proj.detail;
    var plan = proj.plan;
    var title = dt.title || (plan.ipName ? plan.ipName + ' 굿즈' : '상품명');
    var features = dt.features.filter(function (f) { return f && f.trim(); });
    var cuts = dt.cuts.filter(function (c) { return (c.label && c.label.trim()) || c.img; });

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">'
      + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      + '<title>' + esc(title) + ' — 상세페이지</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>'
      + '*{margin:0;padding:0;box-sizing:border-box}'
      + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#221F1A;background:#fff;line-height:1.65;letter-spacing:-0.01em}'
      + '.wrap{max-width:860px;margin:0 auto;padding:52px 28px 80px}'
      + 'h1{font-size:32px;font-weight:800;text-align:center;letter-spacing:-0.02em}'
      + '.sub{font-size:17px;color:#5C574E;text-align:center;margin-top:8px}'
      + '.hero{margin:36px 0 10px;border-radius:14px;overflow:hidden;background:#F7F5F1}'
      + '.hero img{width:100%;display:block}'
      + '.hero-cap{text-align:center;font-size:13px;color:#948E82;margin-bottom:36px}'
      + '.sec{margin-top:52px}'
      + '.sec-title{font-size:20px;font-weight:800;padding-bottom:10px;border-bottom:2px solid #221F1A;margin-bottom:20px}'
      + '.cuts{display:grid;grid-template-columns:1fr 1fr;gap:22px 18px}'
      + '.cut .cut-label{font-size:15px;font-weight:800;margin-bottom:8px}'
      + '.cut .cut-label b{color:#E8590C;margin-right:6px}'
      + '.cut .frame{border-radius:10px;overflow:hidden;background:#F7F5F1;aspect-ratio:4/3}'
      + '.cut .frame img{width:100%;height:100%;object-fit:cover;display:block}'
      + '.cut .cap{font-size:12.5px;color:#5C574E;margin-top:6px}'
      + '.ph{width:100%;height:100%;min-height:170px;display:flex;align-items:center;justify-content:center;'
      + 'border:2px dashed #D6D0C4;border-radius:10px;color:#948E82;font-size:13px;text-align:center;background:#FBFAF8}'
      + '.feat{display:grid;grid-template-columns:1fr 1fr;gap:10px 26px}'
      + '.feat li{list-style:none;font-size:15px;padding:9px 0;border-bottom:1px solid #EEEAE2;display:flex;gap:10px}'
      + '.feat li b{color:#E8590C;flex-shrink:0}'
      + 'table{width:100%;border-collapse:collapse;font-size:14.5px}'
      + 'th{width:150px;text-align:left;background:#F7F5F1;padding:11px 14px;border:1px solid #E7E3DB;font-weight:700}'
      + 'td{padding:11px 14px;border:1px solid #E7E3DB}'
      + '.price-box{background:#FDF6EF;border:1.5px solid #F2D9C2;border-radius:12px;padding:22px 26px;text-align:center}'
      + '.price-box .p{font-size:30px;font-weight:800;color:#B23F04}'
      + '.price-box .opt{font-size:14px;color:#5C574E;margin-top:6px;white-space:pre-line}'
      + '.info p{font-size:13.5px;color:#5C574E;margin:6px 0;white-space:pre-line}'
      + '.info h4{font-size:14.5px;margin-top:16px}'
      + '@media(max-width:640px){.cuts,.feat{grid-template-columns:1fr}h1{font-size:24px}}'
      + '@media print{.wrap{padding:20px}}'
      + '</style></head><body><div class="wrap">';

    /* 타이틀 */
    h += '<h1>' + esc(title) + '</h1>';
    if (dt.subtitle) h += '<p class="sub">' + esc(dt.subtitle) + '</p>';

    /* 히어로 */
    h += '<div class="hero">' + img(dt.heroImg, '메인 컷') + '</div>';
    if (dt.specs.size) h += '<p class="hero-cap">사이즈 : ' + esc(dt.specs.size) + '</p>';

    /* 상세컷 */
    if (cuts.length) {
      h += '<div class="sec"><div class="sec-title">상세 컷</div><div class="cuts">';
      cuts.forEach(function (c, i) {
        h += '<div class="cut"><div class="cut-label"><b>' + (i + 1) + '.</b>' + esc(c.label || '상세컷') + '</div>'
          + '<div class="frame">' + img(c.img, c.label || '상세컷 ' + (i + 1)) + '</div>'
          + (c.caption ? '<div class="cap">' + esc(c.caption) + '</div>' : '')
          + '</div>';
      });
      h += '</div></div>';
    }

    /* 매력 포인트 */
    if (features.length) {
      h += '<div class="sec"><div class="sec-title">★ 매력 포인트</div><ul class="feat">';
      features.forEach(function (f, i) { h += '<li><b>' + (i + 1) + '.</b><span>' + esc(f) + '</span></li>'; });
      h += '</ul></div>';
    }

    /* 가격·옵션 */
    if (dt.price || dt.options) {
      h += '<div class="sec"><div class="sec-title">가격 · 구성 옵션</div><div class="price-box">';
      if (dt.price) h += '<div class="p">' + esc(dt.price) + '</div>';
      if (dt.options) h += '<div class="opt">' + esc(dt.options) + '</div>';
      h += '</div></div>';
    }

    /* 기본 사양 */
    var s = dt.specs;
    h += '<div class="sec"><div class="sec-title">기본 사양</div><table>';
    if (s.size) h += '<tr><th>사이즈 (Size)</th><td>' + esc(s.size) + '</td></tr>';
    if (s.material) h += '<tr><th>재질 (Material)</th><td>' + esc(s.material) + '</td></tr>';
    if (s.power) h += '<tr><th>전원 (Power)</th><td>' + esc(s.power) + '</td></tr>';
    if (s.contents) h += '<tr><th>구성 (Contents)</th><td>' + esc(s.contents) + '</td></tr>';
    if (s.cert) h += '<tr><th>인증 정보</th><td>' + esc(s.cert) + '</td></tr>';
    h += '</table></div>';

    /* 배송·교환·주의 */
    h += '<div class="sec info"><div class="sec-title">구매 안내</div>'
      + '<h4>배송 안내</h4><p>' + esc(dt.shipping) + '</p>'
      + '<h4>교환 · 반품</h4><p>' + esc(dt.refund) + '</p>'
      + '<h4>취급 주의사항</h4><p>' + esc(dt.caution) + '</p>'
      + '</div>';

    h += '</div></body></html>';
    return h;
  }

  function fileName() {
    var proj = GF_STORE.state.project;
    var t = (proj.detail.title || proj.plan.ipName || '상품').replace(/[\\/:*?"<>|]/g, '_');
    return '상세페이지_' + t + '_' + GF_UI.today() + '.html';
  }

  return { build: build, fileName: fileName };
})();
