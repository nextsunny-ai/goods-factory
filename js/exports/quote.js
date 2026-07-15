/* ============ 산출물: 견적서 (고객 제출용) ============ */
var GF_EXPORT_QUOTE = (function () {
  var esc = GF_UI.esc;

  var CSS = '*{margin:0;padding:0;box-sizing:border-box}'
    + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#1C1A17;line-height:1.6;background:#fff}'
    + '.page{max-width:800px;margin:0 auto;padding:48px 44px}'
    + 'h1{font-size:30px;font-weight:800;text-align:center;letter-spacing:.32em;text-indent:.32em;margin-bottom:6px}'
    + '.no{text-align:center;font-size:13px;color:#57534C;margin-bottom:26px}'
    + '.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px}'
    + '.box{border:1.5px solid #1C1A17;border-radius:8px;padding:14px 16px}'
    + '.box h3{font-size:12px;color:#8A857C;font-weight:700;margin-bottom:6px}'
    + '.box p{font-size:14px;margin:2px 0}'
    + 'table{width:100%;border-collapse:collapse;font-size:13.5px;margin:8px 0}'
    + 'th{background:#F6F5F2;padding:10px;border:1px solid #C9C3B8;font-weight:700;text-align:left}'
    + 'td{padding:10px;border:1px solid #C9C3B8}'
    + '.num{text-align:right;font-variant-numeric:tabular-nums}'
    + '.total td{font-weight:800;background:#FDEFE5}'
    + '.terms{margin-top:20px;font-size:13px;color:#3d3931}'
    + '.terms li{margin:3px 0}'
    + '.sign{margin-top:36px;text-align:right;font-size:14px}'
    + '.foot{margin-top:30px;padding-top:12px;border-top:1px solid #DED9CF;font-size:11.5px;color:#8A857C}'
    + '@media print{.page{padding:18px 6px}}';

  function build() {
    var st = GF_STORE.state;
    var proj = st.project, co = st.settings.company;
    var sum = GF_STORE.goodsSummary();
    var today = GF_UI.today();
    var supply = 0;
    sum.rows.forEach(function (r) { supply += r.price * r.qty; });
    var vat = Math.round(supply * 0.1);

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>견적서 ' + esc(proj.plan.ipName || '') + '</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + CSS + '</style></head><body><div class="page">'
      + '<h1>견 적 서</h1><div class="no">' + esc(proj.plan.ipName || '') + ' 굿즈 · 견적일 ' + today + '</div>'
      + '<div class="two">'
      + '<div class="box"><h3>수신</h3><p><b>(고객사명)</b></p><p style="color:#8A857C;font-size:12.5px">담당자 / 연락처</p></div>'
      + '<div class="box"><h3>공급자</h3><p><b>' + esc(co.name || '(회사명)') + '</b>' + (co.ceo ? ' · 대표 ' + esc(co.ceo) : '') + '</p>'
      + (co.biznum ? '<p style="font-size:12.5px">사업자 ' + esc(co.biznum) + '</p>' : '')
      + '<p style="font-size:12.5px">' + esc([co.contact, co.email].filter(Boolean).join(' / ')) + '</p></div>'
      + '</div>'
      + '<p style="font-size:14px;margin-bottom:6px">아래와 같이 견적합니다.</p>'
      + '<table><thead><tr><th style="width:34px">No</th><th>품목</th><th>규격</th><th class="num" style="width:64px">수량</th><th class="num" style="width:96px">단가</th><th class="num" style="width:110px">금액</th></tr></thead><tbody>';

    sum.rows.forEach(function (r, i) {
      h += '<tr><td style="text-align:center">' + (i + 1) + '</td>'
        + '<td><b>' + esc((proj.plan.ipName ? proj.plan.ipName + ' ' : '') + r.c.name) + '</b></td>'
        + '<td style="font-size:12px">' + esc(r.c.spec) + '</td>'
        + '<td class="num">' + r.qty.toLocaleString() + '</td>'
        + '<td class="num">' + r.price.toLocaleString() + '</td>'
        + '<td class="num">' + (r.price * r.qty).toLocaleString() + '</td></tr>';
    });
    h += '<tr class="total"><td colspan="5">공급가액</td><td class="num">' + supply.toLocaleString() + '</td></tr>'
      + '<tr class="total"><td colspan="5">부가세 (10%)</td><td class="num">' + vat.toLocaleString() + '</td></tr>'
      + '<tr class="total"><td colspan="5">합계 금액 (VAT 포함)</td><td class="num">' + (supply + vat).toLocaleString() + '</td></tr>'
      + '</tbody></table>'
      + '<ul class="terms">'
      + '<li>· 견적 유효기간: 견적일로부터 30일</li>'
      + '<li>· 결제 조건: 계약금 50% 선입금 / 잔금 50% 납품 후 (협의 가능)</li>'
      + '<li>· 상기 금액은 디자인 시안 확정 및 수량 기준이며, 사양 변경 시 조정될 수 있습니다.</li>'
      + '<li>· 납기: 발주 및 계약금 입금 후 별도 스케줄표 기준</li>'
      + '</ul>'
      + '<div class="sign">' + esc(co.name || '(회사명)') + ' <b>(인)</b></div>'
      + '<div class="foot">본 견적서는 GOODS FACTORY로 작성되었습니다. · ' + today + '</div>'
      + '</div></body></html>';
    return h;
  }

  function fileName() {
    return '견적서_' + (GF_STORE.state.project.plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.html';
  }
  return { build: build, fileName: fileName };
})();
