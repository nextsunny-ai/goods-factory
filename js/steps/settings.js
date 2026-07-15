/* ============ 설정: 내 회사 정보 + 제작처 리스트 ============ */
var GF_SETTINGS = (function () {
  var $ = GF_UI.$, esc = GF_UI.esc;

  function render(root) {
    var st = GF_STORE.state.settings;
    var co = st.company;

    var html = ''
      + '<div class="page-head">'
      + '  <span class="step-tag">설정</span>'
      + '  <h1>내 정보 · 제작처 관리</h1>'
      + '  <p>여기 입력한 정보는 제안서 표지와 발주서 발신처에 자동으로 들어갑니다. 이 컴퓨터(브라우저)에만 저장됩니다.</p>'
      + '</div>'

      + '<div class="card"><h3>내 회사(판매자) 정보</h3>'
      + '<div class="form-grid">'
      + '  <div class="field"><label>회사명·상호</label><input type="text" id="co-name" value="' + esc(co.name) + '"></div>'
      + '  <div class="field"><label>대표자</label><input type="text" id="co-ceo" value="' + esc(co.ceo) + '"></div>'
      + '  <div class="field"><label>연락처</label><input type="text" id="co-contact" value="' + esc(co.contact) + '"></div>'
      + '  <div class="field"><label>이메일</label><input type="text" id="co-email" value="' + esc(co.email) + '"></div>'
      + '  <div class="field"><label>사업자등록번호</label><input type="text" id="co-biznum" value="' + esc(co.biznum) + '"></div>'
      + '  <div class="field"><label>주소 <small>발주서의 납품 장소로도 사용</small></label><input type="text" id="co-addr" value="' + esc(co.addr) + '"></div>'
      + '</div></div>'

      + '<div class="card"><h3>제작처 리스트</h3>'
      + '<p class="desc">거래하는 제작 업체를 등록해두면 발주서에서 골라 쓸 수 있습니다. 유형을 지정하면 그 유형 품목만 발주서에 담깁니다.</p>'
      + '<div id="vendorList"></div>'
      + '<button class="btn btn-sm btn-soft" id="btnAddVendor" style="margin-top:6px">+ 제작처 추가</button>'
      + '</div>'

      + '<div class="card"><h3>AI 연결 <span class="ai-badge" style="vertical-align:2px">준비 중</span></h3>'
      + '<p class="desc">다음 버전에서 제공됩니다. 연결하면 아래 기능이 자동화됩니다 — 지금은 각 단계의 프롬프트 복사로 같은 결과를 만들 수 있습니다.</p>'
      + '<ul style="padding-left:18px;font-size:13.5px;color:var(--ink-2)">'
      + '<li style="margin:4px 0"><b>클로드 구독 로그인</b> — 시장분석·카피·제안서 문구 자동 작성 (본인 구독으로, 추가 비용 없음)</li>'
      + '<li style="margin:4px 0"><b>제미나이 API 키</b> — 이미지 시안 자동 생성 (텍스트 무료 / 이미지는 구글 결제 등록 필요)</li>'
      + '<li style="margin:4px 0"><b>챗GPT</b> — 구독 연결은 공식 미지원. API 키(별도 충전)만 가능</li>'
      + '</ul></div>';

    root.innerHTML = html;
    renderVendors();

    [['co-name','name'],['co-ceo','ceo'],['co-contact','contact'],['co-email','email'],['co-biznum','biznum'],['co-addr','addr']]
      .forEach(function (pair) {
        $('#' + pair[0]).addEventListener('input', function () { co[pair[1]] = this.value; GF_STORE.save(); });
      });

    $('#btnAddVendor').addEventListener('click', function () {
      st.vendors.push({ name: '', type: '', contact: '', memo: '' });
      GF_STORE.save(); renderVendors();
    });
  }

  function renderVendors() {
    var st = GF_STORE.state.settings;
    var box = $('#vendorList');
    if (!st.vendors.length) {
      box.innerHTML = '<p style="color:var(--ink-3);font-size:13px;padding:4px 0 8px">등록된 제작처가 없습니다.</p>';
      return;
    }
    box.innerHTML = '<div class="vendor-row" style="font-size:11.5px;color:var(--ink-3);font-weight:700">'
      + '<span>업체명</span><span>유형</span><span>연락처</span><span>메모(품목·조건)</span><span></span></div>'
      + st.vendors.map(function (v, i) {
        return '<div class="vendor-row">'
          + '<input type="text" data-vf="name" data-vi="' + i + '" value="' + esc(v.name) + '" placeholder="업체명">'
          + '<select data-vf="type" data-vi="' + i + '" style="padding:8px;border:1px solid var(--line-strong);border-radius:6px">'
          + '<option value="">유형 선택</option>'
          + GF_VENDOR_TYPES.map(function (t) { return '<option' + (v.type === t ? ' selected' : '') + '>' + t + '</option>'; }).join('')
          + '</select>'
          + '<input type="text" data-vf="contact" data-vi="' + i + '" value="' + esc(v.contact) + '" placeholder="전화·이메일">'
          + '<input type="text" data-vf="memo" data-vi="' + i + '" value="' + esc(v.memo) + '" placeholder="주력 품목, 단가 조건 등">'
          + '<button class="btn btn-xs btn-ghost" data-vdel="' + i + '">삭제</button>'
          + '</div>';
      }).join('');

    GF_UI.$all('[data-vf]', box).forEach(function (inp) {
      var ev = inp.tagName === 'SELECT' ? 'change' : 'input';
      inp.addEventListener(ev, function () {
        st.vendors[Number(inp.getAttribute('data-vi'))][inp.getAttribute('data-vf')] = this.value;
        GF_STORE.save();
      });
    });
    GF_UI.$all('[data-vdel]', box).forEach(function (btn) {
      btn.addEventListener('click', function () {
        st.vendors.splice(Number(btn.getAttribute('data-vdel')), 1);
        GF_STORE.save(); renderVendors();
      });
    });
  }

  return { render: render };
})();
