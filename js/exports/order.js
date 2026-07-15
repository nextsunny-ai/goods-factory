/* ============ 산출물: 발주서 (인쇄용 HTML + 엑셀용 CSV) ============ */
var GF_EXPORT_ORDER = (function () {
  var esc = GF_UI.esc;

  function poNumber() {
    var d = new Date();
    return 'PO-' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0')
      + '-' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
  }

  /* vendor: {name, type, contact, memo} 또는 null(공란으로 출력) */
  function build(vendor) {
    var st = GF_STORE.state;
    var proj = st.project;
    var co = st.settings.company;
    var sum = GF_STORE.goodsSummary();
    var today = GF_UI.today();
    var no = poNumber();

    /* 제작처 유형이 지정된 경우 해당 유형 품목만, 아니면 전체 */
    var rows = sum.rows.filter(function (r) {
      return !vendor || !vendor.type || vendor.type === '기타' || r.c.vendorType === vendor.type;
    });
    if (!rows.length) rows = sum.rows;

    var total = 0;
    rows.forEach(function (r) { total += r.unitCost * r.qty; });
    var vat = Math.round(total * 0.1);

    var css = '*{margin:0;padding:0;box-sizing:border-box}'
      + 'body{font-family:"Pretendard","Malgun Gothic",sans-serif;color:#221F1A;line-height:1.6;background:#fff}'
      + '.page{max-width:800px;margin:0 auto;padding:48px 40px}'
      + 'h1{font-size:30px;font-weight:800;text-align:center;letter-spacing:.35em;text-indent:.35em;margin-bottom:6px}'
      + '.no{text-align:center;font-size:13px;color:#5C574E;margin-bottom:28px}'
      + '.two{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}'
      + '.box{border:1.5px solid #221F1A;border-radius:8px;padding:14px 16px}'
      + '.box h3{font-size:13px;color:#948E82;font-weight:700;margin-bottom:6px}'
      + '.box p{font-size:14px;margin:2px 0}'
      + 'table{width:100%;border-collapse:collapse;font-size:13.5px;margin:8px 0 4px}'
      + 'th{background:#F7F5F1;padding:9px 10px;border:1px solid #B9B3A6;font-weight:700}'
      + 'td{padding:9px 10px;border:1px solid #B9B3A6}'
      + '.num{text-align:right;font-variant-numeric:tabular-nums}'
      + '.total td{font-weight:800;background:#FDF6EF}'
      + '.terms{margin-top:22px;font-size:13px}'
      + '.terms th{width:120px;text-align:left}'
      + '.sign{margin-top:44px;display:flex;justify-content:space-between;font-size:14px}'
      + '.sign .s{text-align:center;width:45%}'
      + '.sign .line{border-bottom:1px solid #221F1A;height:44px;margin-bottom:6px}'
      + '@media print{.page{padding:16px 4px}}';

    var h = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>발주서 ' + no + '</title>'
      + '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
      + '<style>' + css + '</style></head><body><div class="page">'
      + '<h1>발 주 서</h1><div class="no">발주번호: ' + no + ' · 발주일: ' + today + '</div>'

      + '<div class="two">'
      + '<div class="box"><h3>수신 (제작처)</h3>'
      + '<p><b>' + esc(vendor && vendor.name ? vendor.name : '(제작처명)') + '</b>' + (vendor && vendor.type ? ' · ' + esc(vendor.type) : '') + '</p>'
      + '<p>' + esc(vendor && vendor.contact ? vendor.contact : '연락처: ') + '</p>'
      + (vendor && vendor.memo ? '<p style="color:#5C574E;font-size:12.5px">' + esc(vendor.memo) + '</p>' : '')
      + '</div>'
      + '<div class="box"><h3>발신 (발주사)</h3>'
      + '<p><b>' + esc(co.name || '(회사명)') + '</b>' + (co.ceo ? ' · 대표 ' + esc(co.ceo) : '') + '</p>'
      + (co.biznum ? '<p>사업자번호: ' + esc(co.biznum) + '</p>' : '')
      + '<p>' + esc([co.contact, co.email].filter(Boolean).join(' / ') || '연락처: ') + '</p>'
      + (co.addr ? '<p style="font-size:12.5px">' + esc(co.addr) + '</p>' : '')
      + '</div></div>'

      + '<table><thead><tr><th style="width:34px">No</th><th>품명</th><th>사양</th>'
      + '<th style="width:70px" class="num">수량</th><th style="width:90px" class="num">단가(원)</th><th style="width:110px" class="num">금액(원)</th></tr></thead><tbody>';

    rows.forEach(function (r, i) {
      h += '<tr><td style="text-align:center">' + (i + 1) + '</td>'
        + '<td><b>' + esc((proj.plan.ipName ? proj.plan.ipName + ' ' : '') + r.c.name) + '</b></td>'
        + '<td style="font-size:12px">' + esc(r.c.spec) + '</td>'
        + '<td class="num">' + r.qty.toLocaleString() + '</td>'
        + '<td class="num">' + r.unitCost.toLocaleString() + '</td>'
        + '<td class="num">' + (r.unitCost * r.qty).toLocaleString() + '</td></tr>';
    });

    h += '<tr class="total"><td colspan="5">공급가액 합계</td><td class="num">' + total.toLocaleString() + '</td></tr>'
      + '<tr class="total"><td colspan="5">부가세 (10%)</td><td class="num">' + vat.toLocaleString() + '</td></tr>'
      + '<tr class="total"><td colspan="5">총 발주 금액 (VAT 포함)</td><td class="num">' + (total + vat).toLocaleString() + '</td></tr>'
      + '</tbody></table>'

      + '<table class="terms"><tbody>'
      + '<tr><th>희망 납기</th><td>' + esc(proj.plan.deadline ? proj.plan.deadline + ' 이전 납품 요청' : '(협의)') + '</td></tr>'
      + '<tr><th>납품 장소</th><td>' + esc(co.addr || '(협의)') + '</td></tr>'
      + '<tr><th>결제 조건</th><td>계약금 50% 선입금 / 잔금 50% 납품 검수 후 지급 (협의 가능)</td></tr>'
      + '<tr><th>요청 사항</th><td>① 본 생산 전 샘플 1회 제공 및 승인 후 진행 ② 인쇄 데이터 규격(칼선·여백·색상 프로파일) 회신 요청 ③ 불량률 1% 초과 시 재작업 협의</td></tr>'
      + '</tbody></table>'

      + '<div class="sign">'
      + '<div class="s"><div class="line"></div>발주사: ' + esc(co.name || '') + ' (인)</div>'
      + '<div class="s"><div class="line"></div>제작처: ' + esc(vendor && vendor.name ? vendor.name : '') + ' (인)</div>'
      + '</div>'
      + '</div></body></html>';
    return h;
  }

  /* 엑셀용 CSV (BOM 포함 — 한글 깨짐 방지) */
  function buildCsv() {
    var proj = GF_STORE.state.project;
    var sum = GF_STORE.goodsSummary();
    var lines = [['No', '품명', '카테고리', '사양', '수량', '단가(원)', '금액(원)', '제작처유형', '통상 제작기간(일)']];
    sum.rows.forEach(function (r, i) {
      lines.push([i + 1, (proj.plan.ipName ? proj.plan.ipName + ' ' : '') + r.c.name, r.c.cat, r.c.spec,
        r.qty, r.unitCost, r.unitCost * r.qty, r.c.vendorType, r.c.lead]);
    });
    var total = sum.rows.reduce(function (a, r) { return a + r.unitCost * r.qty; }, 0);
    lines.push([]);
    lines.push(['', '공급가액 합계', '', '', '', '', total]);
    lines.push(['', '부가세(10%)', '', '', '', '', Math.round(total * 0.1)]);
    lines.push(['', '총 발주금액', '', '', '', '', total + Math.round(total * 0.1)]);
    var csv = lines.map(function (row) {
      return row.map(function (cell) {
        var s = String(cell === undefined ? '' : cell);
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',');
    }).join('\r\n');
    return '﻿' + csv;
  }

  function fileName(ext) {
    var plan = GF_STORE.state.project.plan;
    return '발주서_' + (plan.ipName || '굿즈').replace(/[\\/:*?"<>|]/g, '_') + '_' + GF_UI.today() + '.' + (ext || 'html');
  }

  return { build: build, buildCsv: buildCsv, fileName: fileName };
})();
