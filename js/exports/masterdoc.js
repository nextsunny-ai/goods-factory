/* ============ 산출물: 종합 문서 (프로젝트 전체 내용 한 파일) ============ */
var GF_EXPORT_MASTER = (function () {
  var esc = GF_UI.esc;

  function build() {
    var st = GF_STORE.state;
    var proj = st.project;
    var plan = proj.plan;
    var sum = GF_STORE.goodsSummary();
    var today = GF_UI.today();

    var css = '*{margin:0;padding:0;box-sizing:border-box}'
      + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#221F1A;line-height:1.7;background:#fff}'
      + '.page{max-width:820px;margin:0 auto;padding:48px 40px 80px}'
      + 'h1{font-size:28px;font-weight:800;letter-spacing:-0.02em}'
      + '.meta{font-size:13px;color:#948E82;margin:4px 0 30px}'
      + 'h2{font-size:19px;font-weight:800;margin:38px 0 12px;padding:8px 14px;background:#F7F5F1;border-left:4px solid #E8590C;border-radius:0 8px 8px 0}'
      + 'h3{font-size:15px;font-weight:700;margin:18px 0 6px}'
      + 'p,li{font-size:14px;color:#3d3931}ul{padding-left:20px}li{margin:3px 0}'
      + 'table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}'
      + 'th{background:#F7F5F1;text-align:left;padding:8px 11px;border:1px solid #E7E3DB;font-weight:700}'
      + 'td{padding:8px 11px;border:1px solid #E7E3DB}'
      + '.num{text-align:right;font-variant-numeric:tabular-nums}'
      + '.prompt{background:#FBFAF8;border:1px dashed #D6D0C4;border-radius:8px;padding:12px 15px;font-size:12.5px;'
      + 'white-space:pre-wrap;word-break:break-all;color:#3d3931;margin:8px 0 14px}'
      + '.ptitle{font-size:13.5px;font-weight:700;margin-top:12px}'
      + '.puse{font-size:11.5px;color:#948E82}'
      + '.hl{background:#FDF6EF;border:1.5px solid #F2D9C2;border-radius:10px;padding:14px 18px;margin:12px 0;font-size:14px}'
      + '.hl b{color:#B23F04}'
      + '.check{font-size:13.5px;margin:3px 0}'
      + '@media print{.page{padding:20px 6px}h2{page-break-after:avoid}}';

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>' + esc(proj.name) + ' — 종합 문서</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + css + '</style></head><body><div class="page">';

    h += '<h1>' + esc(proj.name) + ' — 굿즈 프로젝트 종합 문서</h1>'
      + '<div class="meta">굿즈 팩토리 생성 · ' + today + ' · 기획→시장분석→굿즈선정→디자인→산출물 전 과정 기록</div>';

    /* 1. 기획 */
    h += '<h2>1. 기획 개요</h2><table>'
      + '<tr><th style="width:130px">IP</th><td>' + esc(plan.ipName || '-') + ' (' + esc(plan.ipType) + ')</td></tr>'
      + '<tr><th>IP 소개</th><td>' + esc(plan.ipDesc || '-') + '</td></tr>'
      + '<tr><th>타깃</th><td>' + esc(GF_STORE.targetName()) + (plan.ageGroup ? ' · ' + esc(plan.ageGroup) : '') + '</td></tr>'
      + '<tr><th>목적 / 채널</th><td>' + esc(plan.purpose) + ' / ' + esc(GF_STORE.channelNames().join(', ') || '-') + '</td></tr>'
      + '<tr><th>예산 / 일정</th><td>' + (plan.budget ? GF_UI.won(plan.budget) : '-') + ' / ' + esc(plan.deadline || '-') + '</td></tr></table>';

    /* 2. 시장 분석 */
    h += '<h2>2. 시장 분석</h2>';
    if (proj.market.priceHigh) {
      h += '<div class="hl">권장 판매 가격대: <b>' + GF_UI.wonRange([proj.market.priceLow, proj.market.priceHigh]) + '</b> (타깃·예산 기준 참고치)</div>';
    }
    h += '<h3>체크리스트 진행 상황 (' + proj.market.checked.length + '/' + GF_MARKET_CHECKLIST.length + ')</h3>';
    GF_MARKET_CHECKLIST.forEach(function (item) {
      var done = proj.market.checked.indexOf(item.id) >= 0;
      h += '<p class="check">' + (done ? '☑' : '☐') + ' ' + esc(item.label) + '</p>';
    });
    if (proj.market.memo) h += '<h3>조사 메모</h3><p style="white-space:pre-line">' + esc(proj.market.memo) + '</p>';

    /* 3. 굿즈 구성 */
    h += '<h2>3. 굿즈 구성 · 수익 계산</h2>';
    if (sum.rows.length) {
      h += '<table><thead><tr><th>품목</th><th class="num">수량</th><th class="num">단가</th><th class="num">판매가</th><th class="num">원가율</th><th class="num">제작비</th><th class="num">완판매출</th><th class="num">예상이익</th></tr></thead><tbody>';
      sum.rows.forEach(function (r) {
        h += '<tr><td><b>' + esc(r.c.name) + '</b></td><td class="num">' + r.qty.toLocaleString() + '</td>'
          + '<td class="num">' + GF_UI.won(r.unitCost) + '</td><td class="num">' + GF_UI.won(r.price) + '</td>'
          + '<td class="num">' + Math.round(r.costRatio) + '%</td><td class="num">' + GF_UI.won(r.cost) + '</td>'
          + '<td class="num">' + GF_UI.won(r.revenue) + '</td><td class="num">' + GF_UI.won(r.profit) + '</td></tr>';
      });
      h += '</tbody></table>'
        + '<div class="hl">총 제작비 <b>' + GF_UI.won(sum.totalCost) + '</b> · 완판 매출 <b>' + GF_UI.won(sum.totalRevenue)
        + '</b> · 예상 이익 <b>' + GF_UI.won(sum.totalProfit) + '</b> (채널 수수료 평균 '
        + Math.round(sum.feeRate * 1000) / 10 + '% + 포장비 반영)</div>';
    } else {
      h += '<p>선택된 굿즈 없음</p>';
    }

    /* 4. 디자인 */
    var d = proj.design;
    h += '<h2>4. 디자인 방향</h2><table>'
      + '<tr><th style="width:130px">컨셉</th><td>' + esc(d.concept || '-') + '</td></tr>'
      + '<tr><th>메인 컬러</th><td>' + esc(d.palette || '-') + '</td></tr>'
      + '<tr><th>무드 / 스타일</th><td>' + esc([d.mood, d.keywords].filter(Boolean).join(' / ') || '-') + '</td></tr></table>';

    /* 5. 프롬프트 전체 모음 */
    h += '<h2>5. AI 프롬프트 전체 모음</h2>'
      + '<p style="font-size:12.5px;color:#948E82">챗GPT·제미나이·클로드에 붙여넣어 사용. 이미지 프롬프트는 IP 레퍼런스 이미지 첨부 권장.</p>';
    var ctx1 = GF_STEP1.promptCtx();
    var names = GF_STEP3.goodsNames();
    var groups = [
      { name: '기획', list: GF_PROMPTS.step1(ctx1) },
      { name: '시장조사', list: GF_PROMPTS.step2(ctx1) },
      { name: '굿즈 구성', list: GF_PROMPTS.step3(ctx1, names) },
      { name: '디자인 컨셉', list: GF_PROMPTS.step4text(ctx1, names) },
      { name: '이미지 생성', list: GF_STEP4.buildImagePrompts() },
      { name: '산출물 다듬기', list: GF_PROMPTS.step5(ctx1) }
    ];
    groups.forEach(function (grp) {
      if (!grp.list.length) return;
      h += '<h3>' + grp.name + ' (' + grp.list.length + '개)</h3>';
      grp.list.forEach(function (p) {
        h += '<div class="ptitle">· ' + esc(p.title) + ' <span class="puse">— ' + esc(p.use || '') + '</span></div>'
          + '<div class="prompt">' + esc(p.text) + '</div>';
      });
    });

    /* 6. 상세페이지 요약 */
    var dt = proj.detail;
    h += '<h2>6. 상세페이지 구성 요약</h2><table>'
      + '<tr><th style="width:130px">상품명</th><td>' + esc(dt.title || '-') + '</td></tr>'
      + '<tr><th>서브 카피</th><td>' + esc(dt.subtitle || '-') + '</td></tr>'
      + '<tr><th>매력 포인트</th><td>' + (dt.features.filter(Boolean).map(esc).join('<br>') || '-') + '</td></tr>'
      + '<tr><th>사양</th><td>' + esc([dt.specs.size && '사이즈 ' + dt.specs.size, dt.specs.material && '재질 ' + dt.specs.material,
          dt.specs.power && '전원 ' + dt.specs.power, dt.specs.contents && '구성 ' + dt.specs.contents].filter(Boolean).join(' · ') || '-') + '</td></tr>'
      + '<tr><th>가격 / 옵션</th><td>' + esc([dt.price, dt.options].filter(Boolean).join(' / ') || '-') + '</td></tr></table>'
      + '<p style="font-size:12.5px;color:#948E82">※ 완성본은 "상세페이지 HTML" 산출물 파일 참조</p>';

    /* 7. 다음 할 일 */
    h += '<h2>7. 다음 할 일 (체크리스트)</h2><ul>'
      + '<li>☐ 미완료 시장조사 체크리스트 마저 확인</li>'
      + '<li>☐ 제작처 2곳 이상 견적 요청 (견적 메일 프롬프트 활용) → 단가 확정 후 3단계 표 업데이트</li>'
      + '<li>☐ 이미지 프롬프트로 시안 생성 → 상세페이지 컷 슬롯에 업로드</li>'
      + '<li>☐ 샘플 발주 → 검수 → 본 발주 (발주서 산출물 사용)</li>'
      + '<li>☐ 라이선스/저작권 사용 범위 최종 확인</li>'
      + (dt.specs.cert ? '' : '<li>☐ KC 인증 필요 여부 확인 (완구·전자·유아 품목)</li>')
      + '</ul>';

    h += '<p style="margin-top:40px;font-size:11.5px;color:#948E82">본 문서의 단가·시장 수치는 참고치이며 실제 견적·계약에 따라 달라질 수 있습니다. — 굿즈 팩토리 v1.0</p>';
    h += '</div></body></html>';
    return h;
  }

  function fileName() {
    var proj = GF_STORE.state.project;
    return '종합문서_' + (proj.plan.ipName || proj.name || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.html';
  }

  return { build: build, fileName: fileName };
})();
