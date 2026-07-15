/* ============ 상태 관리 + 멀티 프로젝트 + 자동저장 ============ */
var GF_STORE = (function () {
  var KEY_INDEX = 'gf_index_v1';        /* { activeId, projects:[{id,name,updatedAt}] } */
  var KEY_PROJ = 'gf_proj_';            /* + id = 프로젝트 전체 데이터 */
  var KEY_SETTINGS = 'gf_settings_v1';  /* 회사·제작처·AI (프로젝트 공유) */
  var KEY_OLD = 'gf_project_v1';        /* v1.2 이하 단일 프로젝트 (마이그레이션용) */
  var saveTimer = null;

  function genId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function defaultProject() {
    return {
      version: 2,
      id: null,
      name: '새 굿즈 프로젝트',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      plan: {
        ipName: '', ipType: '캐릭터', ipDesc: '',
        target: 'fandom', ageGroup: '20~30대',
        budget: 3000000, purpose: '온라인 판매',
        channels: ['smartstore'], deadline: '',
        region: 'domestic', planMode: 'manual', targetLine: ''
      },
      refs: [],
      genImages: [],            /* AI(제미나이)로 생성한 이미지 {img, title} */
      mockups: {},
      schedule: { startDate: '', designDays: 10 },
      market: { checked: [], memo: '', priceLow: 0, priceHigh: 0, trends: [], existingMemo: '', edge: '' },
      goods: [],            /* {catalogId, qty, unitCost, price, edge} */
      design: { concept: '', palette: '', keywords: '', styleId: 'detail', mood: '', keepColors: true },
      proposalStyle: 'basic',   /* 제안서 디자인 양식 */
      docEdits: {},
      progress: { sent: false, confirmed: false, ordered: false },
      detail: {
        title: '', subtitle: '',
        features: ['', '', '', '', ''],
        cuts: [
          { img: '', label: '앞·옆·뒤', caption: '' },
          { img: '', label: '디테일', caption: '' },
          { img: '', label: '패키지', caption: '' },
          { img: '', label: '사용 예시', caption: '' }
        ],
        heroImg: '',
        specs: { size: '', material: '', power: '', contents: '', cert: '' },
        price: '', options: '',
        shipping: '결제 후 평균 2~3일 내 출고됩니다. 제주·도서산간 지역은 추가 배송비가 발생할 수 있습니다.',
        refund: '단순 변심에 의한 교환·반품은 수령 후 7일 이내 가능하며 왕복 배송비가 부과됩니다. 불량·오배송은 판매자 부담으로 교환해 드립니다.',
        caution: '용도 외 사용을 삼가주세요. 어린이가 사용할 경우 보호자의 지도가 필요합니다.'
      },
      updatedStep: 1
    };
  }

  function defaultSettings() {
    return {
      company: { name: '', ceo: '', contact: '', email: '', biznum: '', addr: '' },
      vendors: [],
      ai: { claudeLinked: false, geminiKey: '' }
    };
  }

  var state = { project: defaultProject(), settings: defaultSettings() };

  /* ---- 인덱스 ---- */
  function readIndex() {
    try { var raw = localStorage.getItem(KEY_INDEX); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeIndex(idx) { try { localStorage.setItem(KEY_INDEX, JSON.stringify(idx)); } catch (e) {} }

  function listProjects() {
    var idx = readIndex();
    if (!idx) return [];
    return idx.projects.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
  }
  function activeId() { var idx = readIndex(); return idx ? idx.activeId : null; }

  /* ---- 저장 ---- */
  function persist() {
    state.project.updatedAt = Date.now();
    if (!state.project.id) state.project.id = genId();
    try {
      localStorage.setItem(KEY_PROJ + state.project.id, JSON.stringify(state.project));
      localStorage.setItem(KEY_SETTINGS, JSON.stringify(state.settings));
      /* 인덱스 갱신 */
      var idx = readIndex() || { activeId: state.project.id, projects: [] };
      idx.activeId = state.project.id;
      var found = false;
      idx.projects.forEach(function (p) {
        if (p.id === state.project.id) { p.name = state.project.name; p.updatedAt = state.project.updatedAt; found = true; }
      });
      if (!found) idx.projects.push({ id: state.project.id, name: state.project.name, updatedAt: state.project.updatedAt });
      writeIndex(idx);
      setSaveStatus(true);
    } catch (e) {
      GF_UI.toast('저장 공간이 부족합니다 — 이미지 수를 줄이거나, 안 쓰는 프로젝트를 파일로 저장 후 삭제하세요');
    }
  }

  function save() {
    setSaveStatus(false);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 600);
  }

  function setSaveStatus(saved) {
    var el = GF_UI.$('#saveStatus');
    if (!el) return;
    el.textContent = saved ? '저장됨 ✓' : '저장 중…';
    el.classList.toggle('saved', saved);
  }

  /* ---- 초기 로드 (마이그레이션 포함) ---- */
  function init() {
    /* 설정 */
    try { var s = localStorage.getItem(KEY_SETTINGS); if (s) state.settings = mergeDeep(defaultSettings(), JSON.parse(s)); } catch (e) {}

    var idx = readIndex();
    if (!idx) {
      /* v1.2 단일 프로젝트 마이그레이션 */
      var old = null;
      try { old = localStorage.getItem(KEY_OLD); } catch (e) {}
      if (old) {
        try {
          var op = mergeDeep(defaultProject(), JSON.parse(old));
          op.id = genId();
          state.project = op;
          localStorage.setItem(KEY_PROJ + op.id, JSON.stringify(op));
          writeIndex({ activeId: op.id, projects: [{ id: op.id, name: op.name, updatedAt: op.updatedAt }] });
          localStorage.removeItem(KEY_OLD);
          return { migrated: true, hadContent: !!(op.plan.ipName || op.goods.length) };
        } catch (e) {}
      }
      /* 완전 신규 */
      state.project = defaultProject();
      return { migrated: false, hadContent: false };
    }

    /* 활성 프로젝트 로드 */
    if (idx.activeId) {
      try {
        var raw = localStorage.getItem(KEY_PROJ + idx.activeId);
        if (raw) { state.project = mergeDeep(defaultProject(), JSON.parse(raw)); state.project.id = idx.activeId; }
      } catch (e) {}
    }
    return { migrated: false, hadContent: !!(state.project.plan.ipName || state.project.goods.length) };
  }

  /* ---- 프로젝트 관리 ---- */
  function newProject(name) {
    var p = defaultProject();
    p.id = genId();
    if (name) p.name = name;
    state.project = p;
    persist();
    return p.id;
  }

  function openProject(id) {
    try {
      var raw = localStorage.getItem(KEY_PROJ + id);
      if (!raw) return false;
      state.project = mergeDeep(defaultProject(), JSON.parse(raw));
      state.project.id = id;
      var idx = readIndex(); if (idx) { idx.activeId = id; writeIndex(idx); }
      return true;
    } catch (e) { return false; }
  }

  function duplicateProject(id) {
    try {
      var raw = localStorage.getItem(KEY_PROJ + id);
      if (!raw) return null;
      var p = mergeDeep(defaultProject(), JSON.parse(raw));
      p.id = genId();
      p.name = (p.name || '프로젝트') + ' (사본)';
      p.createdAt = Date.now(); p.updatedAt = Date.now();
      localStorage.setItem(KEY_PROJ + p.id, JSON.stringify(p));
      var idx = readIndex() || { activeId: null, projects: [] };
      idx.projects.push({ id: p.id, name: p.name, updatedAt: p.updatedAt });
      writeIndex(idx);
      return p.id;
    } catch (e) { return null; }
  }

  function renameProject(id, name) {
    var idx = readIndex(); if (!idx) return;
    idx.projects.forEach(function (p) { if (p.id === id) p.name = name; });
    writeIndex(idx);
    try {
      var raw = localStorage.getItem(KEY_PROJ + id);
      if (raw) { var p = JSON.parse(raw); p.name = name; localStorage.setItem(KEY_PROJ + id, JSON.stringify(p)); }
    } catch (e) {}
    if (state.project.id === id) state.project.name = name;
  }

  /* 삭제 = 파일 백업 후 제거 (옛 작업 보존) */
  function deleteProject(id) {
    exportJsonById(id);
    try { localStorage.removeItem(KEY_PROJ + id); } catch (e) {}
    var idx = readIndex(); if (!idx) return;
    idx.projects = idx.projects.filter(function (p) { return p.id !== id; });
    if (idx.activeId === id) {
      if (idx.projects.length) { idx.activeId = idx.projects[0].id; openProject(idx.projects[0].id); }
      else { var nid = genId(); idx.activeId = nid; state.project = defaultProject(); state.project.id = nid; }
    }
    writeIndex(idx);
    if (!idx.projects.length) persist();
  }

  function resetProject() {   /* 하위호환: 현재 프로젝트를 새 것으로 (신규 프로젝트 생성) */
    newProject();
  }

  function mergeDeep(base, over) {
    if (Array.isArray(base)) return (over !== undefined) ? over : base;
    if (typeof base === 'object' && base !== null) {
      var out = {};
      Object.keys(base).forEach(function (k) { out[k] = (over && over[k] !== undefined) ? mergeDeep(base[k], over[k]) : base[k]; });
      if (over) Object.keys(over).forEach(function (k) { if (out[k] === undefined) out[k] = over[k]; });
      return out;
    }
    return (over !== undefined) ? over : base;
  }

  /* ---- JSON 내보내기/불러오기 ---- */
  function exportJson() { exportProjectObj(state.project); GF_UI.toast('프로젝트 파일을 저장했습니다'); }
  function exportJsonById(id) {
    try { var raw = localStorage.getItem(KEY_PROJ + id); if (raw) exportProjectObj(JSON.parse(raw)); } catch (e) {}
  }
  function exportProjectObj(proj) {
    var data = JSON.stringify({ project: proj, settings: state.settings }, null, 2);
    var name = (proj.name || '굿즈프로젝트').replace(/[\\/:*?"<>|]/g, '_');
    GF_UI.download('굿즈팩토리_' + name + '_' + GF_UI.today() + '.json', data, 'application/json;charset=utf-8');
  }

  function importJson(file, done) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (!data.project) throw new Error('bad');
        var p = mergeDeep(defaultProject(), data.project);
        p.id = genId();     /* 새 프로젝트로 추가 (기존 것 안 덮음) */
        state.project = p;
        if (data.settings) state.settings = mergeDeep(defaultSettings(), data.settings);
        persist();
        done(true);
      } catch (err) { done(false); }
    };
    reader.readAsText(file);
  }

  /* ---- 파생 데이터 헬퍼 ---- */
  function catalogById(id) {
    for (var i = 0; i < GF_CATALOG.length; i++) if (GF_CATALOG[i].id === id) return GF_CATALOG[i];
    return null;
  }
  function targetName() { var t = state.project.plan.target; return (GF_TARGETS[t] && GF_TARGETS[t].name) || t; }
  function channelNames() {
    return state.project.plan.channels.map(function (id) {
      for (var i = 0; i < GF_CHANNELS.length; i++) if (GF_CHANNELS[i].id === id) return GF_CHANNELS[i].name;
      return id;
    });
  }

  function goodsSummary() {
    var rows = [];
    var totalCost = 0, totalRevenue = 0, totalProfit = 0;
    var feeRate = avgFeeRate();
    var region = state.project.plan.region || 'domestic';
    state.project.goods.forEach(function (g) {
      var c = catalogById(g.catalogId);
      if (!c) return;
      var qty = g.qty || gfRegionMoq(c.moq, region);
      var defCost = gfRegionCostMid(c, region);
      var unitCost = (g.unitCost !== undefined && g.unitCost !== null && g.unitCost !== '') ? Number(g.unitCost) : defCost;
      var price = (g.price !== undefined && g.price !== null && g.price !== '') ? Number(g.price) : suggestPrice(c);
      var lead = gfRegionLead(c.lead, region);
      var cost = unitCost * qty;
      var revenue = price * qty;
      var fee = revenue * feeRate;
      var packing = 600 * qty;
      var profit = revenue - cost - fee - packing;
      var costRatio = price > 0 ? (unitCost / price * 100) : 0;
      rows.push({ g: g, c: c, qty: qty, unitCost: unitCost, price: price, lead: lead,
        cost: cost, revenue: revenue, profit: profit, costRatio: costRatio });
      totalCost += cost; totalRevenue += revenue; totalProfit += profit;
    });
    return { rows: rows, totalCost: totalCost, totalRevenue: totalRevenue, totalProfit: totalProfit, feeRate: feeRate, region: region };
  }

  function avgFeeRate() {
    var chs = state.project.plan.channels;
    if (!chs.length) return 0.06;
    var sum = 0, n = 0;
    chs.forEach(function (id) { GF_CHANNELS.forEach(function (ch) { if (ch.id === id) { sum += (ch.fee[0] + ch.fee[1]) / 2; n++; } }); });
    return n ? (sum / n / 100) : 0.06;
  }
  function suggestPrice(c) { var mid = (c.price[0] + c.price[1]) / 2; return Math.round(mid / 500) * 500; }
  function recommendScore(c) {
    var plan = state.project.plan;
    var fit = (c.fit && c.fit[plan.target]) || 0;
    var entryCost = c.moq * ((c.cost[0] + c.cost[1]) / 2);
    var budgetOk = plan.budget > 0 ? (entryCost <= plan.budget * 0.5 ? 1.5 : (entryCost <= plan.budget ? 0.7 : 0)) : 1;
    return fit * budgetOk;
  }

  return {
    state: state, save: save, persist: persist, init: init,
    listProjects: listProjects, activeId: activeId,
    newProject: newProject, openProject: openProject, duplicateProject: duplicateProject,
    renameProject: renameProject, deleteProject: deleteProject, resetProject: resetProject,
    exportJson: exportJson, importJson: importJson,
    catalogById: catalogById, targetName: targetName, channelNames: channelNames,
    goodsSummary: goodsSummary, suggestPrice: suggestPrice, recommendScore: recommendScore, avgFeeRate: avgFeeRate
  };
})();
