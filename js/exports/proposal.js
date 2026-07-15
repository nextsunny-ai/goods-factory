/* ============ 산출물: 제안서 (A4 인쇄용 HTML) ============
   용도: 라이선스 보유사·입점처·투자/협력사에 제출하는 굿즈 사업 제안서 */
var GF_EXPORT_PROPOSAL = (function () {
  var esc = GF_UI.esc;

  function build() {
    var st = GF_STORE.state;
    var proj = st.project;
    var plan = proj.plan;
    var co = st.settings.company;
    var sum = GF_STORE.goodsSummary();
    var feePct = Math.round(sum.feeRate * 1000) / 10;
    var today = GF_UI.today();

    var thm = GF_DOC_THEMES[proj.proposalStyle] || GF_DOC_THEMES.basic;
    var css = gfDocThemeCss(proj.proposalStyle)
      + '.page.cover{min-height:88vh;display:flex;flex-direction:column;justify-content:center;border-bottom:none;padding:56px 48px}'
      + '.cover .tag{font-size:13px;font-weight:700;color:' + thm.accent + ';letter-spacing:.14em}'
      + '.cover h1{font-size:38px;margin:14px 0 10px;line-height:1.3}'
      + '.cover .sub{font-size:16px}'
      + '.cover .meta{margin-top:56px;font-size:14px;border-top:1.5px solid ' + thm.coverBorder + ';padding-top:16px;margin-bottom:0}'
      + '@media print{.page.cover{min-height:auto;page-break-after:always}}';

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>' + esc(plan.ipName || '굿즈') + ' 사업 제안서</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + css + '</style></head><body>';

    /* ---- 표지 ---- */
    h += '<div class="page cover">'
      + '<div class="tag">GOODS BUSINESS PROPOSAL</div>'
      + '<h1>' + esc(plan.ipName || '(IP명)') + '<br>굿즈 상품화 제안서</h1>'
      + '<p class="sub">' + esc(plan.ipDesc || '') + '</p>'
      + '<div class="meta">'
      + (co.name ? esc(co.name) : '')
      + '</div></div>';

    h += '<div class="page">';

    /* ---- 1. 개요 ---- */
    h += '<h2>1. 사업 개요</h2><table>'
      + '<tr><th style="width:140px">대상 IP</th><td>' + esc(plan.ipName || '-') + ' (' + esc(plan.ipType) + ')</td></tr>'
      + '<tr><th>주요 타깃</th><td>' + esc(GF_STORE.targetName()) + (plan.ageGroup ? ' · ' + esc(plan.ageGroup) : '') + '</td></tr>'
      + '<tr><th>사업 목적</th><td>' + esc(plan.purpose) + '</td></tr>'
      + '<tr><th>판매 채널</th><td>' + esc(GF_STORE.channelNames().join(', ') || '-') + '</td></tr>'
      + '<tr><th>목표 일정</th><td>' + esc(plan.deadline || '협의') + '</td></tr>'
      + '<tr><th>제작 예산</th><td>' + (plan.budget ? GF_UI.won(plan.budget) : '협의') + '</td></tr>'
      + '</table>';

    /* ---- 2. 시장 분석 ---- */
    h += '<h2>2. 시장 분석</h2>';
    var t = GF_TARGETS[plan.target];
    if (t) {
      h += '<h3>타깃 소비 특성 — ' + esc(t.name) + '</h3><ul>'
        + t.traits.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    }
    h += '<h3>시장 지표</h3><ul>'
      + GF_MARKET_FACTS.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    if (proj.market.memo) {
      h += '<h3>자체 조사 결과</h3><p style="white-space:pre-line">' + esc(proj.market.memo) + '</p>';
    }
    if (proj.market.existingMemo || proj.market.edge) {
      h += '<h3>차별화 전략</h3>';
      if (proj.market.existingMemo) h += '<p style="white-space:pre-line"><b>기존 굿즈·빈틈:</b> ' + esc(proj.market.existingMemo) + '</p>';
      if (proj.market.edge) h += '<p style="white-space:pre-line"><b>우리의 경쟁력:</b> ' + esc(proj.market.edge) + '</p>';
    }
    if (proj.market.priceHigh) {
      h += '<div class="hl">본 기획의 주력 판매 가격대는 <b>' + GF_UI.wonRange([proj.market.priceLow, proj.market.priceHigh])
        + '</b> 구간으로, 타깃(' + esc(GF_STORE.targetName()) + ')의 통상 소비 범위 내에 있습니다.</div>';
    }

    /* ---- 3. 상품 구성 ---- */
    h += '<h2>3. 상품 구성 및 수익 구조</h2>';
    if (sum.rows.length) {
      h += '<table><thead><tr><th>품목</th><th>사양</th><th class="num">수량</th><th class="num">판매가</th><th class="num">제작비</th><th class="num">완판 매출</th></tr></thead><tbody>';
      sum.rows.forEach(function (r) {
        h += '<tr><td><b>' + esc(r.c.name) + '</b></td><td style="font-size:12px">' + esc(r.c.spec) + '</td>'
          + '<td class="num">' + r.qty.toLocaleString() + '</td>'
          + '<td class="num">' + GF_UI.won(r.price) + '</td>'
          + '<td class="num">' + GF_UI.won(r.cost) + '</td>'
          + '<td class="num">' + GF_UI.won(r.revenue) + '</td></tr>';
      });
      h += '<tr style="background:#F7F5F1;font-weight:700"><td colspan="4">합계</td>'
        + '<td class="num">' + GF_UI.won(sum.totalCost) + '</td>'
        + '<td class="num">' + GF_UI.won(sum.totalRevenue) + '</td></tr>'
        + '</tbody></table>'
        + '<div class="hl">총 제작비 <b>' + GF_UI.won(sum.totalCost) + '</b> · 완판 시 매출 <b>' + GF_UI.won(sum.totalRevenue) + '</b>'
        + ' · 예상 영업이익 <b>' + GF_UI.won(sum.totalProfit) + '</b>'
        + ' <span style="font-size:12px;color:#948E82">(채널 수수료 평균 ' + feePct + '%, 포장비 반영 / 단가는 견적 확정 전 참고치)</span></div>';
      var be = sum.totalRevenue > 0 ? Math.ceil(sum.totalCost / (sum.totalRevenue * (1 - sum.feeRate)) * 100) : 0;
      h += '<p>손익분기점은 전체 물량의 약 <b>' + be + '%</b> 판매 시점입니다.</p>';
    } else {
      h += '<p>(3단계에서 굿즈를 선택하면 구성표가 채워집니다)</p>';
    }

    /* ---- 4. 디자인 방향 ---- */
    h += '<h2>4. 디자인 방향</h2><table>'
      + '<tr><th style="width:140px">컨셉</th><td>' + esc(proj.design.concept || '-') + '</td></tr>'
      + '<tr><th>메인 컬러</th><td>' + esc(proj.design.palette || '-') + '</td></tr>'
      + '<tr><th>무드</th><td>' + esc(proj.design.mood || '-') + '</td></tr>'
      + '<tr><th>스타일</th><td>' + esc(proj.design.keywords || '-') + '</td></tr>'
      + '</table><p style="font-size:12.5px;color:#948E82">※ 디자인 시안 이미지는 별도 첨부</p>';

    /* ---- 5. 추진 일정 ---- */
    h += '<h2>5. 추진 일정</h2>';
    var maxLead = 0;
    sum.rows.forEach(function (r) { if (r.c.lead > maxLead) maxLead = r.c.lead; });
    h += '<table><thead><tr><th>단계</th><th>내용</th><th>기간</th></tr></thead><tbody>'
      + '<tr><td>1. 디자인 확정</td><td>아트웍·시안 확정, 발주 데이터 제작</td><td>1~2주</td></tr>'
      + '<tr><td>2. 샘플 제작</td><td>업체 발주, 샘플 검수 (1~2회 수정)</td><td>1~3주</td></tr>'
      + '<tr><td>3. 본 생산</td><td>전 품목 생산' + (maxLead ? ' (최장 품목 기준 약 ' + maxLead + '일)' : '') + '</td><td>' + (maxLead ? '약 ' + Math.ceil(maxLead / 7) + '주' : '품목별 상이') + '</td></tr>'
      + '<tr><td>4. 검수·입고</td><td>수량·품질 검수, 포장</td><td>1주</td></tr>'
      + '<tr><td>5. 판매 개시</td><td>' + esc(GF_STORE.channelNames().join(', ') || '채널') + ' 오픈' + (plan.deadline ? ' — 목표: ' + esc(plan.deadline) : '') + '</td><td>-</td></tr>'
      + '</tbody></table>';

    /* ---- 6. 제안사 ---- */
    if (co.name) {
      h += '<h2>6. 제안사 정보</h2><table>'
        + '<tr><th style="width:140px">회사명</th><td>' + esc(co.name) + '</td></tr>'
        + (co.ceo ? '<tr><th>대표</th><td>' + esc(co.ceo) + '</td></tr>' : '')
        + (co.biznum ? '<tr><th>사업자번호</th><td>' + esc(co.biznum) + '</td></tr>' : '')
        + (co.addr ? '<tr><th>주소</th><td>' + esc(co.addr) + '</td></tr>' : '')
        + (co.contact ? '<tr><th>연락처</th><td>' + esc(co.contact) + '</td></tr>' : '')
        + (co.email ? '<tr><th>이메일</th><td>' + esc(co.email) + '</td></tr>' : '')
        + '</table>';
    }

    h += '<div class="foot">본 제안서의 제작 단가·시장 수치는 견적 확정 전 참고치이며, 실제 계약 조건에 따라 달라질 수 있습니다. · ' + today + '</div>';
    h += '</div></body></html>';
    return h;
  }

  function fileName() {
    var plan = GF_STORE.state.project.plan;
    return '제안서_' + (plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.html';
  }

  return { build: build, fileName: fileName };
})();
