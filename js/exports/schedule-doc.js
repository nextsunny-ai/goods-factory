/* ============ 산출물: 제작 스케줄표 ============ */
var GF_EXPORT_SCHEDULE = (function () {
  var esc = GF_UI.esc;

  var CSS = '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#1C1A17;line-height:1.6;background:#fff}'
    + '.page{max-width:840px;margin:0 auto;padding:44px 40px}'
    + '.tag{font-size:12px;font-weight:800;color:#B84A18;letter-spacing:.06em}'
    + 'h1{font-size:25px;font-weight:800;margin:6px 0 2px}'
    + '.meta{font-size:12.5px;color:#8A857C;margin-bottom:24px}'
    + 'table{width:100%;border-collapse:collapse;font-size:13px;margin:10px 0}'
    + 'th{background:#F6F5F2;text-align:left;padding:9px 10px;border:1px solid #DED9CF;font-weight:700}'
    + 'td{padding:9px 10px;border:1px solid #DED9CF}'
    + '.num{text-align:right;font-variant-numeric:tabular-nums}'
    + '.bar{position:relative;height:20px;background:#F0EEE9;border-radius:4px;overflow:hidden}'
    + '.seg{position:absolute;top:2px;height:16px;border-radius:3px}'
    + '.hl{background:#FDEFE5;border:1.5px solid #F7D3BC;border-radius:10px;padding:14px 18px;margin:14px 0;font-size:13.5px}'
    + '.hl b{color:#B84A18}'
    + '.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;margin:8px 0}'
    + '.legend span{display:inline-flex;align-items:center;gap:5px}'
    + '.legend i{width:12px;height:12px;border-radius:3px;display:inline-block}'
    + '.foot{margin-top:36px;padding-top:12px;border-top:1px solid #DED9CF;font-size:11.5px;color:#8A857C}'
    + '@media print{.page{padding:18px 6px}}';

  function build() {
    var proj = GF_STORE.state.project;
    var data = GF_SCHEDULE.compute();
    var region = GF_REGIONS[data.region].label;
    var today = GF_UI.today();

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>제작 스케줄 ' + esc(proj.plan.ipName || '') + '</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + CSS + '</style></head><body><div class="page">'
      + '<div class="tag">PRODUCTION SCHEDULE</div><h1>' + esc(proj.plan.ipName || 'IP') + ' 굿즈 제작 스케줄</h1>'
      + '<div class="meta">제작지: ' + esc(region) + ' · 디자인 시작 ' + esc(proj.schedule.startDate) + ' · 작성 ' + today + '</div>';

    if (!data.rows.length) {
      h += '<p>선택된 굿즈가 없습니다.</p></div></body></html>';
      return h;
    }

    h += '<div class="legend"><span><i style="background:#8A85F0"></i>디자인</span><span><i style="background:#F0A93A"></i>샘플</span><span><i style="background:#4FB477"></i>검수·포장</span><span><i style="background:#EA6A2E"></i>본생산</span></div>';

    h += '<table><thead><tr><th>굿즈</th><th class="num">디자인</th><th class="num">샘플</th><th class="num">검수</th><th class="num">본생산</th><th class="num">포장</th><th class="num">합계</th><th>완료 예상</th></tr></thead><tbody>';
    data.rows.forEach(function (r) {
      h += '<tr><td><b>' + esc(r.c.name) + '</b></td>'
        + '<td class="num">' + r.s.design + '</td><td class="num">' + r.s.sample + '</td><td class="num">' + r.s.review + '</td>'
        + '<td class="num">' + r.s.prod + '</td><td class="num">' + r.s.qc + '</td>'
        + '<td class="num" style="font-weight:700">' + r.total + '일</td><td>' + GF_SCHEDULE.fmtFull(r.done) + '</td></tr>';
    });
    h += '</tbody></table>';

    /* 간단 바 차트 */
    h += '<h3 style="font-size:14px;margin:22px 0 8px">타임라인</h3><table><tbody>';
    data.rows.forEach(function (r) {
      var bar = '';
      r.segs.forEach(function (sg) {
        if (sg.b <= sg.a) return;
        var color = sg.key === 'design' ? '#8A85F0' : sg.key === 'sample' ? '#F0A93A' : sg.key === 'prod' ? '#EA6A2E' : '#4FB477';
        bar += '<div class="seg" style="left:' + (sg.a / data.maxTotal * 100) + '%;width:' + ((sg.b - sg.a) / data.maxTotal * 100) + '%;background:' + color + '"></div>';
      });
      h += '<tr><td style="width:150px;font-weight:700">' + esc(r.c.name) + '</td><td><div class="bar">' + bar + '</div></td></tr>';
    });
    h += '</tbody></table>';

    var maxRow = data.rows.reduce(function (a, b) { return b.total > a.total ? b : a; }, data.rows[0]);
    h += '<div class="hl">전체 라인 중 <b>' + esc(maxRow.c.name) + '</b>이(가) 가장 오래 걸립니다(<b>' + maxRow.total + '일</b>). '
      + '이 굿즈의 완료일이 전체 출시 가능일입니다: <b>' + GF_SCHEDULE.fmtFull(maxRow.done) + '</b>'
      + (proj.plan.deadline ? ' · 목표 일정: ' + esc(proj.plan.deadline) : '') + '</div>';

    h += '<div class="foot">단계 기간은 ' + esc(region) + ' 제작 참고치이며 업체·물량에 따라 달라집니다. 샘플 승인 지연 시 전체 일정이 밀립니다. · GOODS FACTORY</div>';
    h += '</div></body></html>';
    return h;
  }

  function fileName() {
    return '제작스케줄_' + (GF_STORE.state.project.plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.html';
  }
  return { build: build, fileName: fileName };
})();
