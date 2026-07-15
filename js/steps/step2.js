/* ============ 2단계: 시장 분석 ============ */
var GF_STEP2 = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  function render(root) {
    var proj = GF_STORE.state.project;
    var plan = proj.plan;
    var mk = proj.market;
    var t = GF_TARGETS[plan.target] || GF_TARGETS.fandom;

    /* 예산 기준 추천 굿즈 상위 6개 → 권장 가격대 산출 */
    var ranked = GF_CATALOG.slice().sort(function (a, b) { return GF_STORE.recommendScore(b) - GF_STORE.recommendScore(a); });
    var top = ranked.slice(0, 6).filter(function (c) { return GF_STORE.recommendScore(c) > 0; });
    var priceLo = top.length ? Math.min.apply(null, top.map(function (c) { return c.price[0]; })) : 0;
    var priceHi = top.length ? Math.max.apply(null, top.map(function (c) { return c.price[1]; })) : 0;
    mk.priceLow = priceLo; mk.priceHigh = priceHi;

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 2</span>'
      + '  <h1>시장 분석</h1>'
      + '  <p>' + esc(plan.ipName || 'IP') + ' × ' + esc(GF_STORE.targetName()) + ' 기준으로 가격대·채널·체크리스트를 정리합니다.</p>'
      + '</div>';

    /* 권장 가격대 */
    html += '<div class="card"><h3>권장 판매 가격대</h3>'
      + '<p class="desc">입력한 타깃·예산에 맞는 굿즈 유형들의 국내 시장 평균 가격대입니다. (2026 참고치 — 3단계에서 품목별로 정밀 계산)</p>'
      + '<div class="stat-row">'
      + '  <div class="stat"><div class="s-label">주력 가격대</div><div class="s-value">' + (top.length ? Math.round((priceLo+priceHi)/2/1000) + '천원대' : '-') + '</div><div class="s-sub">객단가 중심 구간</div></div>'
      + '  <div class="stat"><div class="s-label">전체 범위</div><div class="s-value" style="font-size:16px">' + (top.length ? GF_UI.wonRange([priceLo, priceHi]) : '-') + '</div><div class="s-sub">엔트리~프리미엄</div></div>'
      + '  <div class="stat"><div class="s-label">권장 원가율</div><div class="s-value">20~30%</div><div class="s-sub">40% 초과 = 적자 위험</div></div>'
      + '  <div class="stat"><div class="s-label">무료배송 기준</div><div class="s-value">3만원+</div><div class="s-sub">세트 구성으로 유도</div></div>'
      + '</div>';
    if (top.length) {
      html += '<hr class="divider"><h3>이 조건에 잘 맞는 굿즈 TOP ' + top.length + '</h3><table class="tbl"><thead><tr>'
        + '<th>굿즈</th><th>시장 소비자가</th><th>제작단가(참고)</th><th>최소수량</th><th>제작기간</th></tr></thead><tbody>';
      top.forEach(function (c) {
        html += '<tr><td><b>' + esc(c.name) + '</b><br><small style="color:var(--ink-3)">' + esc(c.cat) + '</small></td>'
          + '<td class="num">' + GF_UI.wonRange(c.price) + '</td>'
          + '<td class="num">' + GF_UI.wonRange(c.cost) + '</td>'
          + '<td class="num">' + c.moq + '개~</td><td class="num">약 ' + c.lead + '일</td></tr>';
      });
      html += '</tbody></table><div class="note">위 표는 참고 시세입니다. <b>3단계</b>에서 굿즈를 고르면 수량·수수료까지 반영한 실제 마진이 계산됩니다.</div>';
    }
    html += '</div>';

    /* 2026 트렌드 */
    html += '<div class="card"><h3>2026 굿즈 트렌드 <small style="font-weight:400;color:var(--ink-3)">— 흔한 10종 말고, 트렌드를 반영하세요</small></h3>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      + GF_TRENDS_2026.map(function (tr) {
          return '<div style="border:1px solid var(--line);border-radius:var(--r-sm);padding:11px 13px;background:' + (tr.hot ? 'var(--accent-soft)' : 'var(--surface-2)') + '">'
            + '<div style="font-size:13.5px;font-weight:700">' + (tr.hot ? '🔥 ' : '') + esc(tr.name) + '</div>'
            + '<div style="font-size:12px;color:var(--ink-2);margin-top:3px;line-height:1.5">' + esc(tr.note) + '</div></div>';
        }).join('')
      + '</div></div>';

    /* 타깃 인사이트 */
    html += '<div class="card"><h3>타깃 인사이트 — ' + esc(t.name) + '</h3><ul style="padding-left:18px; font-size:13.5px; color:var(--ink-2)">'
      + t.traits.map(function (s) { return '<li style="margin:5px 0">' + esc(s) + '</li>'; }).join('')
      + '</ul></div>';

    /* 채널 비교 */
    html += '<div class="card"><h3>판매 채널 비교</h3>'
      + '<p class="desc">1단계에서 고른 채널은 표시되어 있습니다. 수수료는 마진 계산에 자동 반영됩니다.</p>'
      + '<table class="tbl"><thead><tr><th></th><th>채널</th><th>수수료</th><th>강점</th><th>주의</th></tr></thead><tbody>';
    GF_CHANNELS.forEach(function (ch) {
      var on = plan.channels.indexOf(ch.id) >= 0;
      html += '<tr' + (on ? ' style="background:var(--accent-soft)"' : '') + '>'
        + '<td>' + (on ? '✔' : '') + '</td>'
        + '<td><b>' + esc(ch.name) + '</b><br><small style="color:var(--ink-3)">' + esc(ch.tip) + '</small></td>'
        + '<td class="num">' + ch.fee[0] + '~' + ch.fee[1] + '%</td>'
        + '<td style="font-size:12.5px">' + esc(ch.pros) + '</td>'
        + '<td style="font-size:12.5px; color:var(--ink-2)">' + esc(ch.cons) + '</td></tr>';
    });
    html += '</tbody></table></div>';

    /* 체크리스트 */
    html += '<div class="card"><h3>시장조사 체크리스트</h3>'
      + '<p class="desc">아래 6가지를 확인하면 실패 확률이 크게 줄어듭니다. 항목을 누르면 방법이 보입니다.</p><div>';
    GF_MARKET_CHECKLIST.forEach(function (item) {
      var on = mk.checked.indexOf(item.id) >= 0;
      html += '<div style="border-bottom:1px solid var(--line); padding:10px 2px">'
        + '<label style="display:flex; gap:10px; align-items:flex-start; cursor:pointer; font-size:14px; font-weight:600">'
        + '<input type="checkbox" data-check="' + item.id + '"' + (on ? ' checked' : '') + ' style="margin-top:4px; width:16px; height:16px; accent-color:var(--accent)">'
        + '<span>' + esc(item.label) + '<br><small style="font-weight:400; color:var(--ink-3)">방법: ' + esc(item.how) + '</small></span></label></div>';
    });
    html += '</div>'
      + '<div class="field" style="margin-top:14px"><label>조사 메모 <small>조사하며 알게 된 것 — 제안서·종합문서에 들어갑니다</small></label>'
      + '<textarea id="f-marketMemo" placeholder="예: 유사 굿즈 아크릴 스탠드 평균 15,000원, 리뷰에 포장 불만 많음 → 우리는 지관 포장">' + esc(mk.memo) + '</textarea></div>'
      + '</div>';

    /* 차별화 전략 — 흔한 굿즈 피하기 */
    html += '<div class="card"><h3>차별화 전략 <small style="font-weight:400;color:var(--ink-3)">— 이미 나온 굿즈는 매니아가 안 삽니다</small></h3>'
      + '<div class="note warn">기계적으로 흔한 10종을 뽑으면 재고만 쌓입니다. <b>①이미 나온 굿즈를 피하거나 ②디자인·안 나온 장면·특수 후가공으로 차별화</b>해야 잘 팔립니다.</div>'
      + '<div style="margin:12px 0">';
    GF_DIFF_CHECK.forEach(function (item) {
      var on = mk.checked.indexOf(item.id) >= 0;
      html += '<label style="display:flex; gap:10px; align-items:flex-start; cursor:pointer; font-size:13.5px; font-weight:600; padding:6px 2px">'
        + '<input type="checkbox" data-check="' + item.id + '"' + (on ? ' checked' : '') + ' style="margin-top:3px; width:16px; height:16px; accent-color:var(--accent)">'
        + '<span>' + esc(item.label) + '</span></label>';
    });
    html += '</div>'
      + '<div class="form-grid">'
      + '<div class="field full"><label>이미 나온 이 IP 굿즈 <small>무엇이 있고, 뭐가 안 나왔나</small></label>'
      + '<textarea id="f-existingMemo" placeholder="예: 공식 아크릴 키링·티셔츠는 이미 있음. 디오라마·미니 캐비닛·설정화 포스터는 아직 없음 → 우리가 그쪽으로">' + esc(mk.existingMemo || '') + '</textarea></div>'
      + '<div class="field full"><label>우리 차별화 포인트 <small>기획안·제안서에 반영됩니다</small></label>'
      + '<textarea id="f-edge" placeholder="예: ①레이어드 디오라마(안 나온 포맷) ②시크릿 랜덤 뱃지 ③오락실 설정화 포스터(비하인드)">' + esc(mk.edge || '') + '</textarea></div>'
      + '</div>'
      + '<div style="margin-top:6px">' + GF_UI.promptListHtml([{ title:'이미 나온 굿즈 + 트렌드 조사', use:'검색 가능한 AI(제미나이·챗GPT 검색)', text:'"' + esc(plan.ipName || 'IP') + '" 관련해서 이미 출시된 공식/비공식 굿즈를 최대한 조사해줘. 어떤 품목이 이미 많이 나왔는지, 반대로 아직 안 나온 굿즈 유형은 뭔지 정리해줘. 그리고 지금 한국 굿즈 시장에서 뜨는 트렌드에 비춰, 이 IP로 만들면 경쟁력 있을 "덜 흔한" 굿즈 5가지를 추천해줘.' }], 's2diff-') + '</div>'
      + '</div>';

    /* 시장 참고 지표 */
    html += '<div class="card"><h3>인용할 수 있는 시장 지표</h3><ul style="padding-left:18px; font-size:13px; color:var(--ink-2)">'
      + GF_MARKET_FACTS.map(function (s) { return '<li style="margin:4px 0">' + esc(s) + '</li>'; }).join('')
      + '</ul></div>';

    /* 프롬프트 */
    html += '<div class="card"><h3>이 단계의 AI 프롬프트</h3>'
      + '<p class="desc">검색이 되는 AI(제미나이, 챗GPT 검색모드)에 붙여넣으면 실제 시세 조사를 시켜줍니다.</p>'
      + '<div id="p2-prompts">' + GF_UI.promptListHtml(GF_PROMPTS.step2(GF_STEP1.promptCtx()), 's2-') + '</div></div>';

    html += GF_EXPORT_STEPDOC.barHtml(2);

    html += '<div class="step-footer">'
      + '  <button class="btn btn-ghost" id="btnPrev2">← 기획 입력</button>'
      + '  <button class="btn btn-primary" id="btnNext2">다음 → 굿즈 선정</button>'
      + '</div>';

    root.innerHTML = html;
    GF_EXPORT_STEPDOC.bindBar(2);
    GF_UI.bindPromptCopy(root);

    GF_UI.$all('[data-check]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var id = cb.getAttribute('data-check');
        var idx = mk.checked.indexOf(id);
        if (cb.checked && idx < 0) mk.checked.push(id);
        if (!cb.checked && idx >= 0) mk.checked.splice(idx, 1);
        GF_STORE.save();
      });
    });
    $('#f-marketMemo').addEventListener('input', function () { mk.memo = this.value; GF_STORE.save(); });
    var exM = $('#f-existingMemo'); if (exM) exM.addEventListener('input', function () { mk.existingMemo = this.value; GF_STORE.save(); });
    var edg = $('#f-edge'); if (edg) edg.addEventListener('input', function () { mk.edge = this.value; GF_STORE.save(); });
    $('#btnPrev2').addEventListener('click', function () { GF_APP.go(1); });
    $('#btnNext2').addEventListener('click', function () { GF_APP.go(3); });
  }

  return { render: render };
})();
