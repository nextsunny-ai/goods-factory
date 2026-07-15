/* ============ 산출물: 굿즈 디자인 제안 + 견적 ============
   디자인 컨셉 + 목업/시안 + 굿즈별 견적 (디자인 제안과 가격을 함께 보여주는 제출용) */
var GF_EXPORT_DESIGNQUOTE = (function () {
  var esc = GF_UI.esc;

  var CSS = '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#1C1A17;line-height:1.65;background:#fff}'
    + '.page{max-width:840px;margin:0 auto;padding:50px 44px}'
    + '.tag{font-size:12px;font-weight:800;color:#B84A18;letter-spacing:.08em}'
    + 'h1{font-size:28px;font-weight:800;margin:8px 0 4px;letter-spacing:-0.02em}'
    + '.meta{font-size:12.5px;color:#8A857C;margin-bottom:6px}'
    + 'h2{font-size:18px;font-weight:800;margin:32px 0 12px;padding-bottom:7px;border-bottom:2px solid #1C1A17}'
    + 'p,li{font-size:14px;color:#3d3931}'
    + '.concept{display:flex;gap:16px;align-items:center;background:#F6F5F2;border-radius:12px;padding:16px 20px;margin:12px 0}'
    + '.pal{display:flex;gap:6px}.pal span{width:34px;height:34px;border-radius:8px;border:1px solid rgba(0,0,0,.1)}'
    + '.mocks{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:12px 0}'
    + '.mock{border:1px solid #DED9CF;border-radius:10px;overflow:hidden;background:#fff}'
    + '.mock .st{aspect-ratio:1/1;background:#FAFAF8;display:flex;align-items:center;justify-content:center}'
    + '.mock .st svg{width:100%;height:100%}'
    + '.mock .nm{font-size:11.5px;font-weight:700;padding:7px 10px;text-align:center}'
    + 'table{width:100%;border-collapse:collapse;font-size:13.5px;margin:10px 0}'
    + 'th{background:#F6F5F2;text-align:left;padding:10px;border:1px solid #DED9CF;font-weight:700}'
    + 'td{padding:10px;border:1px solid #DED9CF}'
    + '.num{text-align:right;font-variant-numeric:tabular-nums}'
    + '.total td{font-weight:800;background:#FDEFE5}'
    + '.foot{margin-top:40px;padding-top:12px;border-top:1px solid #DED9CF;font-size:11.5px;color:#8A857C}'
    + '@media print{.page{padding:20px 8px}}';

  function build() {
    var st = GF_STORE.state, proj = st.project, plan = proj.plan, co = st.settings.company;
    var d = proj.design, sum = GF_STORE.goodsSummary();
    var today = GF_UI.today();
    var supply = 0; sum.rows.forEach(function (r) { supply += r.price * r.qty; });

    /* 컨셉 팔레트 스와치 */
    var preset = null;
    GF_CONCEPTS.forEach(function (c) { if (c.name === d.concept || (d.concept || '').indexOf(c.name) === 0) preset = c; });
    var palHtml = preset ? '<div class="pal">' + preset.palette.map(function (x) { return '<span style="background:' + x + '"></span>'; }).join('') + '</div>' : '';

    /* 목업 미리보기 (디자인 이미지 있으면) */
    var design = proj.mockups && proj.mockups.current;
    var mockHtml = '';
    if (design && typeof GF_MOCKUPS !== 'undefined') {
      mockHtml = '<h2>디자인 적용 예시 (목업)</h2><div class="mocks">'
        + GF_MOCKUPS.slice(0, 6).map(function (m) {
            return '<div class="mock"><div class="st">' + m.render(design) + '</div><div class="nm">' + esc(m.name) + '</div></div>';
          }).join('') + '</div>';
    }

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>' + esc(plan.ipName || '') + ' 디자인 제안·견적</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + gfDocThemeCss(proj.proposalStyle) + '</style></head><body><div class="page">'
      + '<div class="tag">DESIGN PROPOSAL & QUOTE</div><h1>' + esc(plan.ipName || '(IP명)') + ' 굿즈 디자인 제안 · 견적</h1>'
      + '<div class="meta">' + (co.name ? esc(co.name) : '') + '</div>'

      + '<h2>디자인 컨셉</h2>'
      + '<div class="concept">' + palHtml + '<div><div style="font-size:16px;font-weight:800">' + esc(d.concept || '(컨셉 미정)') + '</div>'
      + '<div style="font-size:13px;color:#57534C">' + esc([d.mood, d.keywords, d.palette].filter(Boolean).join(' · ') || '') + '</div></div></div>'

      + mockHtml

      + '<h2>굿즈 구성 및 견적</h2>';
    if (sum.rows.length) {
      h += '<table><thead><tr><th>품목</th><th>규격</th><th class="num">수량</th><th class="num">단가</th><th class="num">금액</th></tr></thead><tbody>';
      sum.rows.forEach(function (r) {
        h += '<tr><td><b>' + esc(r.c.name) + '</b></td><td style="font-size:12px">' + esc(r.c.spec) + '</td>'
          + '<td class="num">' + r.qty.toLocaleString() + '</td><td class="num">' + r.price.toLocaleString() + '원</td>'
          + '<td class="num">' + (r.price * r.qty).toLocaleString() + '원</td></tr>';
      });
      h += '<tr class="total"><td colspan="4">공급가액 합계</td><td class="num">' + supply.toLocaleString() + '원</td></tr>'
        + '<tr class="total"><td colspan="4">부가세 포함</td><td class="num">' + Math.round(supply * 1.1).toLocaleString() + '원</td></tr></tbody></table>'
        + '<p style="font-size:12px;color:#8A857C">※ 디자인 시안 확정·수량 기준 견적이며 사양 변경 시 조정됩니다. 상세 납기는 별첨 스케줄표 참조.</p>';
    } else h += '<p>(굿즈 미선택)</p>';

    h += '<div class="foot">본 문서의 금액은 견적 확정 전 참고치입니다. · GOODS FACTORY · ' + today + '</div>';
    h += '</div></body></html>';
    return h;
  }

  function fileName() {
    return '디자인제안견적_' + (GF_STORE.state.project.plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.html';
  }
  return { build: build, fileName: fileName };
})();
