/* ============ 산출물: 굿즈 기획안 ============
   기획 개요 + 시장 요약 + 굿즈 라인업 + 컨셉 방향 + 일정 요약 (제출·공유용) */
var GF_EXPORT_PLAN = (function () {
  var esc = GF_UI.esc;

  var CSS = '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#1C1A17;line-height:1.7;background:#fff}'
    + '.page{max-width:820px;margin:0 auto;padding:52px 46px}'
    + '.cover{border-bottom:2px solid #1C1A17;padding-bottom:22px;margin-bottom:8px}'
    + '.tag{font-size:12px;font-weight:800;color:#B84A18;letter-spacing:.1em}'
    + 'h1{font-size:32px;font-weight:800;margin:10px 0 6px;letter-spacing:-0.02em}'
    + '.cover p{font-size:15px;color:#57534C}'
    + '.cover .meta{font-size:12.5px;color:#8A857C;margin-top:10px}'
    + 'h2{font-size:19px;font-weight:800;margin:34px 0 12px;padding:7px 13px;background:#F6F5F2;border-left:4px solid #EA6A2E;border-radius:0 8px 8px 0}'
    + 'h3{font-size:14.5px;font-weight:700;margin:16px 0 6px}'
    + 'p,li{font-size:14px;color:#3d3931}ul{padding-left:20px}li{margin:3px 0}'
    + 'table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}'
    + 'th{background:#F6F5F2;text-align:left;padding:9px 11px;border:1px solid #DED9CF;font-weight:700}'
    + 'td{padding:9px 11px;border:1px solid #DED9CF}'
    + '.num{text-align:right;font-variant-numeric:tabular-nums}'
    + '.sw{display:inline-block;width:15px;height:15px;border-radius:4px;border:1px solid rgba(0,0,0,.12);vertical-align:-3px;margin-right:2px}'
    + '.foot{margin-top:44px;padding-top:12px;border-top:1px solid #DED9CF;font-size:11.5px;color:#8A857C}'
    + '@media print{.page{padding:22px 8px}h2{page-break-after:avoid}}';

  function build() {
    var st = GF_STORE.state, proj = st.project, plan = proj.plan, co = st.settings.company;
    var sum = GF_STORE.goodsSummary();
    var today = GF_UI.today();

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>' + esc(plan.ipName || '굿즈') + ' 기획안</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + gfDocThemeCss(proj.proposalStyle) + '</style></head><body><div class="page">'
      + '<div class="cover"><div class="tag">GOODS PLANNING</div><h1>' + esc(plan.ipName || '(IP명)') + ' 굿즈 기획안</h1>'
      + '<p>' + esc(plan.ipDesc || '') + '</p>'
      + '<div class="meta">' + (co.name ? esc(co.name) : '') + '</div></div>';

    h += '<h2>1. 기획 개요</h2><table>'
      + '<tr><th style="width:130px">대상 IP</th><td>' + esc(plan.ipName || '-') + ' (' + esc(plan.ipType) + ')</td></tr>'
      + '<tr><th>주요 타깃</th><td>' + esc(GF_STORE.targetName()) + (plan.ageGroup ? ' · ' + esc(plan.ageGroup) : '') + '</td></tr>'
      + '<tr><th>제작 목적</th><td>' + esc(plan.purpose) + '</td></tr>'
      + '<tr><th>판매 채널</th><td>' + esc(GF_STORE.channelNames().join(', ') || '-') + '</td></tr>'
      + '<tr><th>제작지 / 예산</th><td>' + esc(GF_REGIONS[plan.region || 'domestic'].label) + ' / ' + (plan.budget ? GF_UI.won(plan.budget) : '협의') + '</td></tr>'
      + '<tr><th>목표 일정</th><td>' + esc(plan.deadline || '협의') + '</td></tr></table>';

    /* 시장 요약 */
    h += '<h2>2. 시장 요약</h2>';
    var t = GF_TARGETS[plan.target];
    if (t) { h += '<h3>타깃 소비 특성 — ' + esc(t.name) + '</h3><ul>' + t.traits.slice(0, 3).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>'; }
    if (proj.market.priceHigh) h += '<p>권장 판매 가격대: <b>' + GF_UI.wonRange([proj.market.priceLow, proj.market.priceHigh]) + '</b> (참고치)</p>';
    if (proj.market.memo) h += '<h3>자체 조사</h3><p style="white-space:pre-line">' + esc(proj.market.memo) + '</p>';

    /* 굿즈 라인업 */
    h += '<h2>3. 굿즈 라인업 (' + sum.rows.length + '종)</h2>';
    if (sum.rows.length) {
      var anyEdge = sum.rows.some(function (r) { return r.g.edge; });
      h += '<table><thead><tr><th>품목</th><th class="num">수량</th><th class="num">판매가</th>' + (anyEdge ? '<th>차별화 포인트</th>' : '<th>규격</th>') + '</tr></thead><tbody>';
      sum.rows.forEach(function (r) {
        h += '<tr><td><b>' + esc(r.c.name) + '</b></td>'
          + '<td class="num">' + r.qty.toLocaleString() + '</td><td class="num">' + GF_UI.won(r.price) + '</td>'
          + '<td style="font-size:12px">' + esc(anyEdge ? (r.g.edge || '—') : r.c.spec) + '</td></tr>';
      });
      h += '</tbody></table><p style="font-size:12.5px;color:#8A857C">총 제작비 ' + GF_UI.won(sum.totalCost) + ' · 완판 매출 ' + GF_UI.won(sum.totalRevenue) + ' (참고치)</p>';
    } else h += '<p>(굿즈 미선택)</p>';

    /* 차별화 전략 */
    if (proj.market.edge || proj.market.existingMemo) {
      h += '<h2>3-1. 차별화 전략</h2>';
      if (proj.market.existingMemo) h += '<h3>이미 나온 굿즈 / 빈틈</h3><p style="white-space:pre-line">' + esc(proj.market.existingMemo) + '</p>';
      if (proj.market.edge) h += '<h3>우리의 경쟁력</h3><p style="white-space:pre-line">' + esc(proj.market.edge) + '</p>';
    }

    /* 컨셉 */
    var d = proj.design;
    h += '<h2>4. 디자인 컨셉 방향</h2><table>'
      + '<tr><th style="width:130px">컨셉</th><td>' + esc(d.concept || '-') + '</td></tr>'
      + '<tr><th>메인 컬러</th><td>' + esc(d.palette || '-') + '</td></tr>'
      + '<tr><th>무드 / 스타일</th><td>' + esc([d.mood, d.keywords].filter(Boolean).join(' / ') || '-') + '</td></tr></table>';

    /* 일정 요약 */
    if (sum.rows.length) {
      var maxLead = 0; sum.rows.forEach(function (r) { if (r.lead > maxLead) maxLead = r.lead; });
      h += '<h2>5. 일정 요약</h2><p>가장 오래 걸리는 품목 기준 본생산 약 <b>' + maxLead + '일</b>, 디자인 확정부터 출고까지 약 <b>' + (maxLead + (proj.schedule.designDays || 10) + 26) + '일</b> 예상. 상세는 별첨 제작 스케줄표 참조.</p>';
    }

    h += '<div class="foot">본 기획안의 수치는 견적 확정 전 참고치입니다. · GOODS FACTORY · ' + today + '</div>';
    h += '</div></body></html>';
    return h;
  }

  function fileName() {
    return '굿즈기획안_' + (GF_STORE.state.project.plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.html';
  }
  return { build: build, fileName: fileName };
})();
