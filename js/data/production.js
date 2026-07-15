/* ============================================================
   제작지(국내/중국) 단가·납기 (v1.1)
   - 시간 여유 있으면 중국(단가↓·납기↑), 급하면 국내(단가↑·납기↓)
   - 카테고리별 중국 절감률이 다름 (봉제·피규어=크게, 지류=작게)
   - 모든 수치는 참고치. 실제 견적으로 확정할 것.
   ============================================================ */
var GF_REGIONS = {
  domestic: { id:'domestic', label:'국내 제작', short:'국내',
    desc:'납기 빠름 · 소통·수정 쉬움 · 소량 가능. 단가는 다소 높음. 급하거나 소량·시즌 임박일 때.' },
  china:    { id:'china', label:'중국(해외) 제작', short:'중국',
    desc:'단가 절감 큼(품목별 30~50%). 대신 납기 김 · 최소수량↑ · 통관·샘플 왕복 필요. 시간 여유 있고 물량 많을 때.' }
};

/* 카테고리별 중국 제작 단가 배수 (국내 대비) */
var GF_CHINA_COST_MUL = {
  '아크릴': 0.72, '지류·문구': 0.82, '패브릭': 0.55, '리빙': 0.62,
  '배지·금속': 0.55, '테크': 0.60, '피규어·토이': 0.50, '컬렉션·패키지': 0.65
};

/* 제작지 반영 단가 범위 [lo, hi] */
function gfRegionCost(cat, costArr, region) {
  if (region !== 'china') return costArr;
  var m = GF_CHINA_COST_MUL[cat] || 0.65;
  return [Math.round(costArr[0] * m / 10) * 10, Math.round(costArr[1] * m / 10) * 10];
}

/* 제작지 반영 단가 중앙값 */
function gfRegionCostMid(c, region) {
  var arr = gfRegionCost(c.cat, c.cost, region);
  return Math.round((arr[0] + arr[1]) / 2);
}

/* 제작지 반영 납기(일): 중국 = 국내 리드타임 x1.7 + 통관·배송 20일 */
function gfRegionLead(lead, region) {
  return region === 'china' ? Math.round(lead * 1.7) + 20 : lead;
}

/* 제작지 반영 최소수량: 중국은 통상 MOQ 상향 */
function gfRegionMoq(moq, region) {
  return region === 'china' ? Math.round(moq * 1.5 / 50) * 50 : moq;
}

/* 카테고리별 샘플 제작 기간(일) — 품목마다 다름 (피규어·봉제 길고, 지류·아크릴 짧음) */
var GF_SAMPLE_DAYS = {
  '아크릴': 7, '지류·문구': 5, '패브릭': 18, '리빙': 10,
  '배지·금속': 14, '테크': 10, '피규어·토이': 30, '컬렉션·패키지': 10
};
function gfSampleDays(cat, region) {
  var d = GF_SAMPLE_DAYS[cat] || 10;
  return region === 'china' ? d + 10 : d;   /* 중국은 샘플 왕복 배송 +10일 */
}

/* 한 품목의 제작 단계별 소요일 (디자인 확정 이후 기준)
   반환: { sample, review, prod, qc, total } */
function gfItemSchedule(c, region, designDays) {
  var sample = gfSampleDays(c.cat, region);
  var review = 7;                       /* 샘플 검수·수정 */
  var prod = gfRegionLead(c.lead, region);
  var qc = 5;                           /* 검수·포장·출고 준비 */
  return { design: designDays || 10, sample: sample, review: review, prod: prod, qc: qc,
    total: (designDays || 10) + sample + review + prod + qc };
}
