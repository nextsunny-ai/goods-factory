/* ============ 3단계: 굿즈 선정 + 마진 계산 ============ */
var GF_STEP3 = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;
  var curCat = '전체';

  function picked(catalogId) {
    return GF_STORE.state.project.goods.some(function (g) { return g.catalogId === catalogId; });
  }

  function render(root) {
    var proj = GF_STORE.state.project;

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 3</span>'
      + '  <h1>굿즈 선정</h1>'
      + '  <p>카탈로그에서 만들 굿즈를 고르면 수량·단가·판매가 기준으로 마진이 자동 계산됩니다. <b>추천</b> 표시는 1단계 조건(타깃·예산)에 잘 맞는 품목입니다.</p>'
      + '</div>'

      + '<div class="card"><h3>제작지 — 단가와 납기가 달라집니다</h3>'
      + '<p class="desc">시간 여유가 있으면 중국(단가↓·납기↑), 급하면 국내(단가↑·납기↓). 고르면 아래 단가·납기가 다시 계산됩니다.</p>'
      + '<div class="chip-group" id="regionChips">'
      + Object.keys(GF_REGIONS).map(function (id) {
          var r = GF_REGIONS[id];
          var on = (proj.plan.region || 'domestic') === id;
          return '<button class="chip' + (on ? ' on' : '') + '" data-region="' + id + '">' + r.label + '</button>';
        }).join('')
      + '</div>'
      + '<p class="desc" id="regionDesc" style="margin-top:10px;margin-bottom:0"></p>'
      + '</div>'

      + '<div class="card">'
      + '  <div class="catalog-filters" id="catFilters"></div>'
      + '  <div class="catalog-grid" id="catalogGrid"></div>'
      + '  <div class="note" style="margin-top:14px">단가·가격은 2026년 국내 시장 <b>참고치</b>입니다. 실제 견적을 받으면 아래 표에서 숫자만 바꾸세요 — 마진이 다시 계산됩니다.</div>'
      + '</div>'

      + '<div class="card"><h3>선택한 굿즈 — 수량·마진 계산</h3><div id="marginArea"></div></div>'

      + '<div class="card"><h3>이 단계의 AI 프롬프트</h3><div id="p3-prompts"></div></div>'

      + GF_EXPORT_STEPDOC.barHtml(3)

      + '<div class="step-footer">'
      + '  <button class="btn btn-ghost" id="btnPrev3">← 시장 분석</button>'
      + '  <button class="btn btn-primary" id="btnNext3">다음 → 디자인·프롬프트</button>'
      + '</div>';

    root.innerHTML = html;
    GF_EXPORT_STEPDOC.bindBar(3);
    renderFilters();
    renderGrid();
    renderMargin();
    renderPrompts();
    renderRegionDesc();

    GF_UI.$all('[data-region]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        var region = chip.getAttribute('data-region');
        proj.plan.region = region;
        /* 선택 굿즈 단가를 제작지 기준으로 갱신 (직접 수정값은 덮어씀) */
        proj.goods.forEach(function (g) {
          var c = GF_STORE.catalogById(g.catalogId);
          if (c) g.unitCost = gfRegionCostMid(c, region);
        });
        GF_STORE.save();
        GF_UI.$all('[data-region]').forEach(function (x) { x.classList.toggle('on', x === chip); });
        renderRegionDesc();
        renderGrid();
        renderMargin();
        GF_UI.toast(GF_REGIONS[region].label + ' 기준으로 단가·납기를 갱신했습니다');
      });
    });

    $('#btnPrev3').addEventListener('click', function () { GF_APP.go(2); });
    $('#btnNext3').addEventListener('click', function () {
      if (!proj.goods.length) { GF_UI.toast('굿즈를 1개 이상 선택해주세요'); return; }
      GF_APP.go(4);
    });
  }

  function renderFilters() {
    var box = $('#catFilters');
    box.innerHTML = GF_CATEGORIES.map(function (c) {
      return '<button class="chip' + (c === curCat ? ' on' : '') + '" data-cat="' + c + '">' + c + '</button>';
    }).join('');
    GF_UI.$all('[data-cat]', box).forEach(function (chip) {
      chip.addEventListener('click', function () {
        curCat = chip.getAttribute('data-cat');
        renderFilters(); renderGrid();
      });
    });
  }

  function renderRegionDesc() {
    var el = $('#regionDesc');
    if (!el) return;
    el.textContent = GF_REGIONS[GF_STORE.state.project.plan.region || 'domestic'].desc;
  }

  function renderGrid() {
    var grid = $('#catalogGrid');
    var region = GF_STORE.state.project.plan.region || 'domestic';
    var items = GF_CATALOG.filter(function (c) { return curCat === '전체' || c.cat === curCat; });
    /* 추천 점수순 정렬 */
    items = items.slice().sort(function (a, b) { return GF_STORE.recommendScore(b) - GF_STORE.recommendScore(a); });
    var topIds = GF_CATALOG.slice().sort(function (a, b) { return GF_STORE.recommendScore(b) - GF_STORE.recommendScore(a); })
      .slice(0, 8).filter(function (c) { return GF_STORE.recommendScore(c) >= 4; }).map(function (c) { return c.id; });

    grid.innerHTML = items.map(function (c) {
      var isPicked = picked(c.id);
      var badge = isPicked ? '<span class="g-badge">선택됨</span>'
        : (topIds.indexOf(c.id) >= 0 ? '<span class="g-reco">추천</span>' : '');
      return '<div class="goods-card' + (isPicked ? ' picked' : '') + '" data-goods="' + c.id + '">'
        + badge
        + '<div class="g-cat">' + esc(c.cat) + '</div>'
        + '<div class="g-name">' + esc(c.name) + '</div>'
        + '<div class="g-meta">시장가 ' + GF_UI.wonRange(c.price) + '<br>단가 ' + GF_UI.wonRange(gfRegionCost(c.cat, c.cost, region))
        + ' · ' + gfRegionMoq(c.moq, region) + '개~ · ' + gfRegionLead(c.lead, region) + '일</div>'
        + (function () { var s = gfSaturation(c.id), L = GF_SAT_LABEL[s]; return '<div style="margin-top:7px"><span style="font-size:10.5px;font-weight:700;color:' + L.color + ';background:' + L.bg + ';border-radius:20px;padding:2px 8px">' + L.txt + '</span></div>'; })()
        + '<div class="g-meta" style="margin-top:6px; color:var(--ink-3); font-size:11.5px">' + esc(c.desc) + '</div>'
        + '</div>';
    }).join('');

    GF_UI.$all('[data-goods]', grid).forEach(function (card) {
      card.addEventListener('click', function () {
        var id = card.getAttribute('data-goods');
        var goods = GF_STORE.state.project.goods;
        var idx = -1;
        goods.forEach(function (g, i) { if (g.catalogId === id) idx = i; });
        if (idx >= 0) { goods.splice(idx, 1); }
        else {
          var c = GF_STORE.catalogById(id);
          goods.push({ catalogId: id, qty: c.moq, unitCost: Math.round((c.cost[0] + c.cost[1]) / 2), price: GF_STORE.suggestPrice(c) });
        }
        GF_STORE.save();
        renderGrid(); renderMargin(); renderPrompts();
      });
    });
  }

  function renderMargin() {
    var area = $('#marginArea');
    var proj = GF_STORE.state.project;
    if (!proj.goods.length) {
      area.innerHTML = '<p style="color:var(--ink-3); font-size:13.5px; padding:8px 0">위 카탈로그에서 굿즈를 선택하면 여기에 계산표가 나타납니다.</p>';
      return;
    }
    var sum = GF_STORE.goodsSummary();
    var feePct = Math.round(sum.feeRate * 1000) / 10;

    var h = '<table class="tbl"><thead><tr>'
      + '<th>품목</th><th style="width:86px">수량</th><th style="width:104px">개당 단가(원)</th><th style="width:104px">판매가(원)</th>'
      + '<th class="num">원가율</th><th class="num">총 제작비</th><th class="num">예상 이익*</th><th></th></tr></thead><tbody>';

    sum.rows.forEach(function (r, i) {
      var ratioColor = r.costRatio <= 30 ? 'var(--green)' : (r.costRatio <= 40 ? 'var(--accent-deep)' : 'var(--red)');
      h += '<tr>'
        + '<td><b>' + esc(r.c.name) + '</b><br><small style="color:var(--ink-3)">시장가 ' + GF_UI.wonRange(r.c.price) + ' · 납기 약 ' + r.lead + '일</small></td>'
        + '<td><input type="number" data-mrow="' + i + '" data-mkey="qty" value="' + r.qty + '" min="1" style="width:76px"></td>'
        + '<td><input type="number" data-mrow="' + i + '" data-mkey="unitCost" value="' + r.unitCost + '" min="0" step="100" style="width:94px"></td>'
        + '<td><input type="number" data-mrow="' + i + '" data-mkey="price" value="' + r.price + '" min="0" step="500" style="width:94px"></td>'
        + '<td class="num" style="color:' + ratioColor + '; font-weight:700">' + Math.round(r.costRatio) + '%</td>'
        + '<td class="num">' + GF_UI.won(r.cost) + '</td>'
        + '<td class="num" style="font-weight:700; color:' + (r.profit >= 0 ? 'var(--green)' : 'var(--red)') + '">' + GF_UI.won(r.profit) + '</td>'
        + '<td><button class="btn btn-xs btn-ghost" data-mdel="' + i + '">삭제</button></td>'
        + '</tr>';
    });
    h += '</tbody></table>';

    var budget = proj.plan.budget || 0;
    var over = budget > 0 && sum.totalCost > budget;
    var budgetPct = budget > 0 ? Math.round(sum.totalCost / budget * 100) : 0;
    var maxLead = 0;
    sum.rows.forEach(function (r) { if (r.lead > maxLead) maxLead = r.lead; });
    var regionLabel = GF_REGIONS[sum.region].short;
    h += '<div class="stat-row" style="margin-top:16px">'
      + '<div class="stat' + (over ? ' warn' : '') + '"><div class="s-label">총 제작비 (' + regionLabel + ')</div><div class="s-value">' + GF_UI.won(sum.totalCost) + '</div>'
      + '<div class="s-sub">예산 ' + (budget ? GF_UI.won(budget) + ' 대비 ' + budgetPct + '%' : '미입력') + (over ? ' — 초과!' : '') + '</div></div>'
      + '<div class="stat"><div class="s-label">완판 시 매출</div><div class="s-value">' + GF_UI.won(sum.totalRevenue) + '</div><div class="s-sub">전량 판매 기준</div></div>'
      + '<div class="stat good"><div class="s-label">예상 이익*</div><div class="s-value">' + GF_UI.won(sum.totalProfit) + '</div>'
      + '<div class="s-sub">수수료 ' + feePct + '% + 포장비 반영</div></div>'
      + '<div class="stat"><div class="s-label">예상 제작 납기</div><div class="s-value">약 ' + maxLead + '일</div>'
      + '<div class="s-sub">가장 오래 걸리는 품목 기준 (+샘플 2주 별도)</div></div>'
      + '</div>';
    if (over) {
      h += '<div class="note warn" style="margin-top:12px"><b>예산 초과.</b> 총 제작비가 예산(' + GF_UI.won(budget) + ')을 ' + (budgetPct - 100) + '% 넘습니다. 수량을 줄이거나, '
        + (sum.region === 'domestic' ? '제작지를 <b>중국</b>으로 바꿔 단가를 낮추거나, ' : '') + '품목을 조정하세요.</div>';
    }
    /* 일정 경고: 목표일까지 남은 기간 vs 필요 기간(납기+샘플2주+배송) */
    if (proj.plan.deadline && maxLead) {
      var need = maxLead + 14 + 7;
      h += '<div class="note" style="margin-top:' + (over ? '8' : '12') + 'px">목표 일정 "<b>' + esc(proj.plan.deadline) + '</b>" 기준, 디자인 확정부터 <b>약 ' + need + '일</b>(샘플 2주 + 제작 ' + maxLead + '일 + 검수·배송) 필요합니다. 이 기간을 역산해 발주 마감일을 잡으세요.'
        + (sum.region === 'china' ? ' 중국 제작은 통관 지연 여지가 있어 일주일 더 여유를 두는 걸 권합니다.' : '') + '</div>';
    }
    h += '<p style="font-size:11.5px; color:var(--ink-3); margin-top:8px">* 예상 이익 = 매출 − 제작비 − 채널 수수료(선택 채널 평균 ' + feePct + '%) − 포장비(개당 600원). 배송비는 구매자 부담 가정. 단가·납기는 ' + regionLabel + ' 제작 참고치.</p>';

    /* 굿즈별 차별화 포인트 — 흔한 품목일수록 필수 */
    h += '<hr class="divider"><h3>굿즈별 차별화 포인트</h3>'
      + '<p class="desc">"흔함" 표시 품목은 그대로면 안 팔립니다. 어떻게 다르게 만들지 한 줄로 적어두면 기획안·제안서에 들어갑니다.</p>';
    sum.rows.forEach(function (r, i) {
      var s = gfSaturation(r.c.id), L = GF_SAT_LABEL[s];
      h += '<div style="border:1px solid var(--line);border-radius:var(--r-sm);padding:11px 13px;margin-bottom:8px;background:#fff">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><b style="font-size:13.5px">' + esc(r.c.name) + '</b>'
        + '<span style="font-size:10.5px;font-weight:700;color:' + L.color + ';background:' + L.bg + ';border-radius:20px;padding:2px 8px">' + L.txt + '</span></div>'
        + '<input type="text" data-edge="' + i + '" value="' + esc(r.g.edge || '') + '" placeholder="차별화: ' + esc(gfDiffTip(r.c.cat)) + '" style="width:100%;padding:8px 11px;border:1px solid var(--line-2);border-radius:var(--r-xs);font-size:12.5px">'
        + '</div>';
    });

    area.innerHTML = h;

    GF_UI.$all('[data-edge]', area).forEach(function (inp) {
      inp.addEventListener('input', function () {
        var g = proj.goods[Number(inp.getAttribute('data-edge'))];
        if (g) { g.edge = this.value; GF_STORE.save(); }
      });
    });

    GF_UI.$all('[data-mrow]', area).forEach(function (inp) {
      inp.addEventListener('change', function () {
        var i = Number(inp.getAttribute('data-mrow'));
        var key = inp.getAttribute('data-mkey');
        var g = proj.goods[i];
        if (!g) return;
        g[key] = Number(inp.value) || 0;
        GF_STORE.save();
        renderMargin();
      });
    });
    GF_UI.$all('[data-mdel]', area).forEach(function (btn) {
      btn.addEventListener('click', function () {
        proj.goods.splice(Number(btn.getAttribute('data-mdel')), 1);
        GF_STORE.save();
        renderGrid(); renderMargin(); renderPrompts();
      });
    });
  }

  function goodsNames() {
    return GF_STORE.state.project.goods.map(function (g) {
      var c = GF_STORE.catalogById(g.catalogId);
      return c ? c.name : '';
    }).filter(Boolean);
  }

  function renderPrompts() {
    var box = $('#p3-prompts');
    if (!box) return;
    box.innerHTML = GF_UI.promptListHtml(GF_PROMPTS.step3(GF_STEP1.promptCtx(), goodsNames()), 's3-');
    GF_UI.bindPromptCopy(box);
  }

  return { render: render, goodsNames: goodsNames };
})();
