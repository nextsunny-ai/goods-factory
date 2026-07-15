/* ============ 6단계: 굿즈 제작 스케줄 ============
   품목마다 샘플·본생산 기간이 다르고, 국내/중국이 다름 → 굿즈별 타임라인 */
var GF_SCHEDULE = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseDate(s) {
    if (!s) return new Date();
    var p = s.split('-'); var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? new Date() : d;
  }
  function addDays(date, n) { var d = new Date(date.getTime()); d.setDate(d.getDate() + n); return d; }
  function fmt(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }
  function fmtFull(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  /* 선택 굿즈들의 스케줄 계산 */
  function compute() {
    var proj = GF_STORE.state.project;
    var region = proj.plan.region || 'domestic';
    var designDays = proj.schedule.designDays || 10;
    var start = parseDate(proj.schedule.startDate || todayStr());
    var rows = [];
    var maxTotal = 0;
    proj.goods.forEach(function (g) {
      var c = GF_STORE.catalogById(g.catalogId);
      if (!c) return;
      var s = gfItemSchedule(c, region, designDays);
      if (s.total > maxTotal) maxTotal = s.total;
      /* 누적 오프셋 */
      var o0 = 0;
      var o1 = s.design;
      var o2 = o1 + s.sample;
      var o3 = o2 + s.review;
      var o4 = o3 + s.prod;
      var o5 = o4 + s.qc;
      rows.push({ c: c, s: s,
        segs: [
          { key: 'design', label: '디자인', a: o0, b: o1 },
          { key: 'sample', label: '샘플', a: o1, b: o2 },
          { key: 'review', label: '검수', a: o2, b: o3 },
          { key: 'prod', label: '본생산', a: o3, b: o4 },
          { key: 'qc', label: '포장', a: o4, b: o5 }
        ],
        done: addDays(start, s.total), total: s.total });
    });
    return { rows: rows, maxTotal: maxTotal, start: start, region: region, designDays: designDays };
  }

  function render(root) {
    var proj = GF_STORE.state.project;
    proj.schedule = proj.schedule || { startDate: '', designDays: 10 };
    if (!proj.schedule.startDate) proj.schedule.startDate = todayStr();

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">STEP 6</span>'
      + '  <h1>제작 스케줄</h1>'
      + '  <p>굿즈마다 샘플·생산 기간이 다르고(피규어는 길고 아크릴은 짧음), 제작지(국내/중국)에 따라 달라집니다. 아래는 선택한 굿즈별 실제 일정입니다.</p>'
      + '</div>';

    if (!proj.goods.length) {
      html += '<div class="card"><p style="color:var(--ink-3);font-size:14px">3단계에서 굿즈를 먼저 선택하면 굿즈별 스케줄이 계산됩니다.</p></div>';
      html += footer();
      root.innerHTML = html;
      bindNav();
      return;
    }

    html += '<div class="card">'
      + '<div class="form-grid">'
      + '<div class="field"><label>디자인 시작일 <small>여기서부터 역산</small></label><input type="date" id="sc-start" value="' + esc(proj.schedule.startDate) + '"></div>'
      + '<div class="field"><label>디자인 확정 기간 <small>일 — 아트웍 완성까지</small></label><input type="number" id="sc-design" min="1" value="' + (proj.schedule.designDays || 10) + '"></div>'
      + '</div>'
      + '<div style="margin-top:6px;font-size:12.5px;color:var(--ink-2)">제작지: <b>' + GF_REGIONS[proj.plan.region || 'domestic'].label + '</b> (3단계에서 변경) — 중국은 샘플 왕복·통관으로 더 걸립니다.</div>'
      + '</div>';

    html += '<div class="card"><h3>굿즈별 타임라인</h3><div id="ganttArea"></div></div>';

    html += '<div class="card"><h3>단계별 일정 표</h3><div class="tbl-wrap" id="schTable"></div></div>';

    html += footer();
    root.innerHTML = html;

    renderGantt();
    renderTable();

    $('#sc-start').addEventListener('change', function () { proj.schedule.startDate = this.value || todayStr(); GF_STORE.save(); renderGantt(); renderTable(); });
    $('#sc-design').addEventListener('input', function () { proj.schedule.designDays = Number(this.value) || 10; GF_STORE.save(); renderGantt(); renderTable(); });
    bindNav();
  }

  function footer() {
    return '<div class="step-footer">'
      + '<button class="btn btn-ghost" id="scPrev">← 목업</button>'
      + '<button class="btn btn-primary" id="scNext">다음 → 산출물</button></div>';
  }
  function bindNav() {
    $('#scPrev').addEventListener('click', function () { GF_APP.go(5); });
    $('#scNext').addEventListener('click', function () { GF_APP.go(7); });
  }

  function renderGantt() {
    var box = $('#ganttArea');
    if (!box) return;
    var data = compute();
    var h = '<div class="gantt-legend" style="margin-bottom:12px">'
      + '<span><i class="seg-design" style="background:#8A85F0"></i>디자인 확정</span>'
      + '<span><i style="background:#F0A93A"></i>샘플 제작</span>'
      + '<span><i style="background:#4FB477"></i>샘플 검수</span>'
      + '<span><i class="seg-prod" style="background:var(--accent)"></i>본 생산</span>'
      + '<span><i style="background:#4FB477"></i>포장·출고</span>'
      + '</div>';
    h += '<div class="gantt"><div class="gantt-head"><div>굿즈</div><div>일정 (총 ' + data.maxTotal + '일 기준)</div></div>';
    data.rows.forEach(function (r) {
      h += '<div class="gantt-row"><div class="gantt-label">' + esc(r.c.name)
        + '<small>' + r.total + '일 · 완료 ' + fmt(r.done) + '</small></div>'
        + '<div class="gantt-track">';
      r.segs.forEach(function (sg) {
        if (sg.b <= sg.a) return;
        var left = (sg.a / data.maxTotal * 100);
        var width = ((sg.b - sg.a) / data.maxTotal * 100);
        var cls = sg.key === 'design' ? 'seg-design' : sg.key === 'sample' ? 'seg-sample' : sg.key === 'prod' ? 'seg-prod' : 'seg-qc';
        h += '<div class="gantt-seg ' + cls + '" style="left:' + left + '%;width:' + width + '%" title="' + sg.label + ' ' + (sg.b - sg.a) + '일">' + (width > 8 ? sg.label : '') + '</div>';
      });
      h += '</div></div>';
    });
    h += '</div>';

    /* 목표일 대비 */
    if (GF_STORE.state.project.plan.deadline) {
      var maxRow = data.rows.reduce(function (a, b) { return b.total > a.total ? b : a; }, data.rows[0]);
      h += '<div class="note" style="margin-top:14px">가장 오래 걸리는 <b>' + esc(maxRow.c.name) + '</b> 기준 총 <b>' + maxRow.total + '일</b>. '
        + '목표 일정 "<b>' + esc(GF_STORE.state.project.plan.deadline) + '</b>"에 맞추려면 이 굿즈는 <b>' + fmtFull(GF_STORE_backDate(maxRow.total)) + '</b>까지 디자인을 시작해야 합니다.</div>';
    }
    box.innerHTML = h;
  }

  function renderTable() {
    var box = $('#schTable');
    if (!box) return;
    var data = compute();
    var h = '<table class="tbl"><thead><tr><th>굿즈</th><th class="num">디자인</th><th class="num">샘플</th><th class="num">검수</th><th class="num">본생산</th><th class="num">포장</th><th class="num">합계</th><th>완료 예상</th></tr></thead><tbody>';
    data.rows.forEach(function (r) {
      h += '<tr><td><b>' + esc(r.c.name) + '</b></td>'
        + '<td class="num">' + r.s.design + '일</td><td class="num">' + r.s.sample + '일</td><td class="num">' + r.s.review + '일</td>'
        + '<td class="num">' + r.s.prod + '일</td><td class="num">' + r.s.qc + '일</td>'
        + '<td class="num" style="font-weight:700">' + r.total + '일</td><td>' + fmtFull(r.done) + '</td></tr>';
    });
    h += '</tbody></table>';
    box.innerHTML = h;
  }

  return { render: render, compute: compute, fmtFull: fmtFull, addDays: addDays, parseDate: parseDate, todayStr: todayStr };
})();

/* 목표일 − N일 (뷰에서 사용) */
function GF_STORE_backDate(totalDays) {
  var dl = GF_STORE.state.project.plan.deadline;
  var base;
  if (dl && /^\d{4}-\d{2}-\d{2}/.test(dl)) { var p = dl.slice(0, 10).split('-'); base = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  else base = new Date();
  base.setDate(base.getDate() - totalDays);
  return base;
}
