/* ============ 산출물: 단계별 결과 문서 (1~4단계) ============
   각 단계 화면 하단 "이 단계 결과 문서"에서 뷰어로 열림 (수정·다운로드 가능) */
var GF_EXPORT_STEPDOC = (function () {
  var esc = GF_UI.esc;

  var CSS = '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#221F1A;line-height:1.7;letter-spacing:-0.01em;background:#fff}'
    + '.page{max-width:800px;margin:0 auto;padding:48px 44px 70px}'
    + '.tag{font-size:12px;font-weight:700;color:#E8590C;letter-spacing:.12em}'
    + 'h1{font-size:26px;font-weight:800;margin:8px 0 2px;letter-spacing:-0.02em}'
    + '.meta{font-size:12.5px;color:#948E82;margin-bottom:26px}'
    + 'h2{font-size:17px;font-weight:800;margin:30px 0 10px;padding-bottom:7px;border-bottom:2px solid #221F1A}'
    + 'h3{font-size:14.5px;font-weight:700;margin:16px 0 6px}'
    + 'p,li{font-size:13.5px;color:#3d3931}ul{padding-left:20px}li{margin:3px 0}'
    + 'table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}'
    + 'th{background:#F7F5F1;text-align:left;padding:8px 11px;border:1px solid #E7E3DB;font-weight:700}'
    + 'td{padding:8px 11px;border:1px solid #E7E3DB}'
    + '.num{text-align:right;font-variant-numeric:tabular-nums}'
    + '.hl{background:#FDF6EF;border:1.5px solid #F2D9C2;border-radius:10px;padding:14px 18px;margin:12px 0;font-size:13.5px}'
    + '.hl b{color:#B23F04}'
    + '.sw{display:inline-block;width:16px;height:16px;border-radius:4px;border:1px solid rgba(0,0,0,.12);vertical-align:-3px;margin-right:3px}'
    + '.prompt{background:#FBFAF8;border:1px dashed #D6D0C4;border-radius:8px;padding:11px 14px;font-size:12.5px;white-space:pre-wrap;word-break:break-all;margin:6px 0 12px}'
    + '.foot{margin-top:44px;padding-top:12px;border-top:1px solid #D6D0C4;font-size:11.5px;color:#948E82}'
    + '@media print{.page{padding:20px 6px}}';

  function shell(tagText, title, body) {
    var proj = GF_STORE.state.project;
    return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>' + esc(title) + '</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + CSS + '</style></head><body><div class="page">'
      + '<div class="tag">' + esc(tagText) + '</div><h1>' + esc(title) + '</h1>'
      + '<div class="meta">프로젝트: ' + esc(proj.name) + ' · 작성일: ' + GF_UI.today() + ' · 굿즈 팩토리 생성</div>'
      + body
      + '<div class="foot">본 문서의 수치는 견적 확정 전 참고치입니다. 문서 내용은 뷰어의 수정 모드에서 자유롭게 고칠 수 있습니다.</div>'
      + '</div></body></html>';
  }

  /* ---- 1단계: 기획서 ---- */
  function buildStep1() {
    var plan = GF_STORE.state.project.plan;
    var t = GF_TARGETS[plan.target];
    var b = '<h2>1. 기획 개요</h2><table>'
      + '<tr><th style="width:130px">IP</th><td>' + esc(plan.ipName || '-') + ' (' + esc(plan.ipType) + ')</td></tr>'
      + '<tr><th>IP 소개</th><td>' + esc(plan.ipDesc || '-') + '</td></tr>'
      + '<tr><th>주요 타깃</th><td>' + esc(GF_STORE.targetName()) + (plan.ageGroup ? ' · ' + esc(plan.ageGroup) : '') + '</td></tr>'
      + '<tr><th>제작 목적</th><td>' + esc(plan.purpose) + '</td></tr>'
      + '<tr><th>판매 채널</th><td>' + esc(GF_STORE.channelNames().join(', ') || '-') + '</td></tr>'
      + '<tr><th>제작 예산</th><td>' + (plan.budget ? GF_UI.won(plan.budget) : '-') + '</td></tr>'
      + '<tr><th>목표 일정</th><td>' + esc(plan.deadline || '-') + '</td></tr></table>';
    if (t) {
      b += '<h2>2. 타깃 특성</h2><ul>' + t.traits.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    }
    b += '<h2>3. 이 기획의 방향 (메모)</h2><p>여기에 기획 의도·차별점·참고 사례를 정리하세요. (뷰어의 수정 모드에서 바로 작성 가능)</p>';
    return shell('STEP 1 REPORT', (plan.ipName || 'IP') + ' 굿즈 기획서', b);
  }

  /* ---- 2단계: 시장분석 보고서 ---- */
  function buildStep2() {
    var proj = GF_STORE.state.project;
    var plan = proj.plan;
    var mk = proj.market;
    var t = GF_TARGETS[plan.target];
    var ranked = GF_CATALOG.slice().sort(function (a, b2) { return GF_STORE.recommendScore(b2) - GF_STORE.recommendScore(a); });
    var top = ranked.slice(0, 6).filter(function (c) { return GF_STORE.recommendScore(c) > 0; });

    var b = '';
    if (mk.priceHigh) {
      b += '<div class="hl">권장 판매 가격대: <b>' + GF_UI.wonRange([mk.priceLow, mk.priceHigh]) + '</b> · 권장 원가율 <b>20~30%</b> · 무료배송 기준 객단가 <b>3만원 이상</b> 유도</div>';
    }
    if (top.length) {
      b += '<h2>1. 조건에 맞는 굿즈 유형</h2><table><thead><tr><th>굿즈</th><th class="num">시장 소비자가</th><th class="num">제작단가(참고)</th><th class="num">최소수량</th><th class="num">제작기간</th></tr></thead><tbody>';
      top.forEach(function (c) {
        b += '<tr><td><b>' + esc(c.name) + '</b> <span style="color:#948E82;font-size:11.5px">' + esc(c.cat) + '</span></td>'
          + '<td class="num">' + GF_UI.wonRange(c.price) + '</td><td class="num">' + GF_UI.wonRange(c.cost) + '</td>'
          + '<td class="num">' + c.moq + '개~</td><td class="num">약 ' + c.lead + '일</td></tr>';
      });
      b += '</tbody></table>';
    }
    if (t) {
      b += '<h2>2. 타깃 소비 특성 — ' + esc(t.name) + '</h2><ul>'
        + t.traits.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    }
    b += '<h2>3. 판매 채널 비교</h2><table><thead><tr><th></th><th>채널</th><th class="num">수수료</th><th>강점</th><th>주의</th></tr></thead><tbody>';
    GF_CHANNELS.forEach(function (ch) {
      var on = plan.channels.indexOf(ch.id) >= 0;
      b += '<tr><td>' + (on ? '✔' : '') + '</td><td><b>' + esc(ch.name) + '</b></td><td class="num">' + ch.fee[0] + '~' + ch.fee[1] + '%</td>'
        + '<td style="font-size:12px">' + esc(ch.pros) + '</td><td style="font-size:12px">' + esc(ch.cons) + '</td></tr>';
    });
    b += '</tbody></table>';
    b += '<h2>4. 시장조사 체크리스트 (' + mk.checked.length + '/' + GF_MARKET_CHECKLIST.length + ')</h2>';
    GF_MARKET_CHECKLIST.forEach(function (item) {
      b += '<p>' + (mk.checked.indexOf(item.id) >= 0 ? '☑' : '☐') + ' ' + esc(item.label) + '</p>';
    });
    if (mk.memo) b += '<h2>5. 자체 조사 결과</h2><p style="white-space:pre-line">' + esc(mk.memo) + '</p>';
    b += '<h2>' + (mk.memo ? '6' : '5') + '. 시장 지표</h2><ul>'
      + GF_MARKET_FACTS.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>';
    return shell('STEP 2 REPORT', (plan.ipName || 'IP') + ' 시장분석 보고서', b);
  }

  /* ---- 3단계: 굿즈 구성안 ---- */
  function buildStep3() {
    var proj = GF_STORE.state.project;
    var sum = GF_STORE.goodsSummary();
    var feePct = Math.round(sum.feeRate * 1000) / 10;
    var b = '';
    if (sum.rows.length) {
      b += '<h2>1. 굿즈 구성 · 수익 계산</h2>'
        + '<table><thead><tr><th>품목</th><th>사양</th><th class="num">수량</th><th class="num">단가</th><th class="num">판매가</th><th class="num">원가율</th><th class="num">제작비</th><th class="num">완판매출</th><th class="num">예상이익</th></tr></thead><tbody>';
      sum.rows.forEach(function (r) {
        b += '<tr><td><b>' + esc(r.c.name) + '</b></td><td style="font-size:11.5px">' + esc(r.c.spec) + '</td>'
          + '<td class="num">' + r.qty.toLocaleString() + '</td><td class="num">' + GF_UI.won(r.unitCost) + '</td>'
          + '<td class="num">' + GF_UI.won(r.price) + '</td><td class="num">' + Math.round(r.costRatio) + '%</td>'
          + '<td class="num">' + GF_UI.won(r.cost) + '</td><td class="num">' + GF_UI.won(r.revenue) + '</td>'
          + '<td class="num">' + GF_UI.won(r.profit) + '</td></tr>';
      });
      b += '</tbody></table>'
        + '<div class="hl">총 제작비 <b>' + GF_UI.won(sum.totalCost) + '</b> · 완판 매출 <b>' + GF_UI.won(sum.totalRevenue)
        + '</b> · 예상 이익 <b>' + GF_UI.won(sum.totalProfit) + '</b> (채널 수수료 평균 ' + feePct + '% + 포장비 개당 600원 반영)</div>';
      var be = sum.totalRevenue > 0 ? Math.ceil(sum.totalCost / (sum.totalRevenue * (1 - sum.feeRate)) * 100) : 0;
      b += '<p>손익분기점 = 전체 물량의 약 <b>' + be + '%</b> 판매 시점.</p>';
      b += '<h2>2. 발주 참고</h2><ul>';
      sum.rows.forEach(function (r) {
        b += '<li><b>' + esc(r.c.name) + '</b> — 제작처 유형: ' + esc(r.c.vendorType) + ' · 통상 제작기간 약 ' + r.c.lead + '일 · 최소수량 ' + r.c.moq + '개</li>';
      });
      b += '</ul>';
    } else {
      b += '<p>선택된 굿즈가 없습니다. 3단계 카탈로그에서 굿즈를 선택하세요.</p>';
    }
    return shell('STEP 3 REPORT', (proj.plan.ipName || 'IP') + ' 굿즈 구성안', b);
  }

  /* ---- 4단계: 디자인 컨셉 + 프롬프트 문서 ---- */
  function buildStep4() {
    var proj = GF_STORE.state.project;
    var d = proj.design;
    var b = '<h2>1. 디자인 컨셉</h2><table>'
      + '<tr><th style="width:130px">컨셉</th><td>' + esc(d.concept || '-') + '</td></tr>'
      + '<tr><th>메인 컬러</th><td>' + esc(d.palette || '-') + '</td></tr>'
      + '<tr><th>무드</th><td>' + esc(d.mood || '-') + '</td></tr>'
      + '<tr><th>스타일</th><td>' + esc(d.keywords || '-') + '</td></tr></table>';
    /* 선택한 프리셋 팔레트 스와치 */
    var preset = null;
    GF_CONCEPTS.forEach(function (c) { if (c.name === d.concept || (d.concept || '').indexOf(c.name) === 0) preset = c; });
    if (preset) {
      b += '<p>팔레트: ' + preset.palette.map(function (hex) { return '<span class="sw" style="background:' + hex + '"></span>' + hex; }).join(' &nbsp; ') + '</p>';
    }
    var prompts = GF_STEP4.buildImagePrompts();
    b += '<h2>2. 이미지 생성 프롬프트 (' + prompts.length + '개)</h2>'
      + '<p style="font-size:12px;color:#948E82">제미나이·챗GPT 이미지 생성에 붙여넣으세요. IP 원본 이미지를 함께 첨부하면 일관성이 좋아집니다.</p>';
    prompts.forEach(function (p, i) {
      b += '<h3>' + (i + 1) + '. ' + esc(p.title) + '</h3><div class="prompt">' + esc(p.text) + '</div>';
    });
    var txt = GF_PROMPTS.step4text(GF_STEP1.promptCtx(), GF_STEP3.goodsNames());
    b += '<h2>3. 컨셉 보조 프롬프트</h2>';
    txt.forEach(function (p) {
      b += '<h3>' + esc(p.title) + '</h3><div class="prompt">' + esc(p.text) + '</div>';
    });
    return shell('STEP 4 REPORT', (proj.plan.ipName || 'IP') + ' 디자인 컨셉 · 프롬프트 문서', b);
  }

  function fileName(step) {
    var names = { 1: '기획서', 2: '시장분석보고서', 3: '굿즈구성안', 4: '디자인컨셉문서' };
    var ip = (GF_STORE.state.project.plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_');
    return names[step] + '_' + ip + '_' + GF_UI.today() + '.html';
  }

  function docTitle(step) {
    var names = { 1: '기획서', 2: '시장분석 보고서', 3: '굿즈 구성안', 4: '디자인 컨셉 문서' };
    return names[step];
  }

  function openInViewer(step) {
    var builders = { 1: buildStep1, 2: buildStep2, 3: buildStep3, 4: buildStep4 };
    GF_VIEWER.open({
      docKey: 'step' + step,
      title: docTitle(step) + ' — ' + (GF_STORE.state.project.plan.ipName || GF_STORE.state.project.name),
      buildFn: builders[step],
      fileName: fileName(step)
    });
  }

  /* 각 단계 하단에 붙는 공통 버튼 바 HTML */
  function barHtml(step) {
    return '<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:12px">'
      + '<div><h3 style="margin-bottom:2px">이 단계 결과 문서 — ' + docTitle(step) + '</h3>'
      + '<p style="font-size:12.5px;color:var(--ink-2)">지금까지 입력한 내용으로 문서가 만들어집니다. 열어서 직접 고치고 저장·인쇄할 수 있습니다.</p></div>'
      + '<button class="btn btn-primary" id="stepDocBtn' + step + '" style="flex-shrink:0">문서 열기 (보기·수정)</button></div>';
  }
  function bindBar(step) {
    var btn = GF_UI.$('#stepDocBtn' + step);
    if (btn) btn.addEventListener('click', function () { openInViewer(step); });
  }

  return { openInViewer: openInViewer, barHtml: barHtml, bindBar: bindBar,
    buildStep1: buildStep1, buildStep2: buildStep2, buildStep3: buildStep3, buildStep4: buildStep4, fileName: fileName };
})();
