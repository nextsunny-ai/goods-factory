/* ============================================================
   디자인 컨셉 프리셋 — 프로그램이 먼저 제안, 사용자는 고르기만
   fit: 어울리는 IP 종류·타깃 (추천 정렬용, 없으면 범용)
   ============================================================ */
var GF_CONCEPTS = [
  { id:'retro-pixel', name:'레트로 픽셀', mood:'추억의 오락실, 도트 그래픽의 아기자기한 재미',
    palette:['#7EC8E3','#FFD93D','#FF6B6B','#1A1A2E'], paletteText:'하늘색+노랑+레드 포인트',
    keywords:'픽셀아트, 도트 그래픽, 8비트 레트로',
    fit:{ ipTypes:['게임','캐릭터'], targets:['fandom','general'] } },
  { id:'kitsch-pop', name:'키치 팝', mood:'쨍한 원색과 장난기, Y2K 감성의 과감한 그래픽',
    palette:['#FF6FB5','#FFE156','#6BCB77','#4D96FF'], paletteText:'핑크+옐로+그린+블루 원색 믹스',
    keywords:'키치, Y2K, 팝아트, 스티커 콜라주',
    fit:{ ipTypes:['캐릭터','아이돌·아티스트','웹툰·만화'], targets:['fandom'] } },
  { id:'minimal-line', name:'미니멀 라인', mood:'여백과 한 줄 드로잉, 어른스러운 절제미',
    palette:['#221F1A','#F7F5F1','#E8590C'], paletteText:'블랙+아이보리+오렌지 한 방울',
    keywords:'라인 드로잉, 미니멀, 모노톤',
    fit:{ ipTypes:['브랜드·기업','자체 창작','영화·드라마'], targets:['general'] } },
  { id:'pastel-cute', name:'파스텔 큐트', mood:'몽글몽글 부드러운 색감, 다꾸 감성의 사랑스러움',
    palette:['#FFD1DC','#BDE0FE','#FFFACD','#CDB4DB'], paletteText:'파스텔 핑크+블루+레몬+라벤더',
    keywords:'파스텔, 큐트, 손그림 일러스트',
    fit:{ ipTypes:['캐릭터','웹툰·만화'], targets:['fandom','kids'] } },
  { id:'vintage', name:'빈티지 클래식', mood:'바랜 종이와 세리프, 오래 두고 보는 소장품 느낌',
    palette:['#8B5E3C','#EAE0D5','#3F4238','#B08968'], paletteText:'브라운+크림+딥그린',
    keywords:'빈티지, 클래식, 엽서·우표 그래픽',
    fit:{ ipTypes:['영화·드라마','자체 창작'], targets:['general','fandom'] } },
  { id:'dark-premium', name:'다크 프리미엄', mood:'검정 바탕에 금박 한 줄, 한정판·콜렉터 지향',
    palette:['#14141B','#C9A227','#5C4D7D'], paletteText:'블랙+골드+딥퍼플',
    keywords:'프리미엄, 금박, 한정판 패키지',
    fit:{ ipTypes:['게임','영화·드라마','아이돌·아티스트'], targets:['fandom'] } },
  { id:'natural', name:'내추럴 감성', mood:'식물과 린넨의 톤, 생활 속에 스며드는 편안함',
    palette:['#A3B18A','#DAD7CD','#588157'], paletteText:'세이지 그린+베이지',
    keywords:'내추럴, 보태니컬, 크라프트 질감',
    fit:{ ipTypes:['브랜드·기업','자체 창작'], targets:['general'] } },
  { id:'neon-street', name:'네온 스트리트', mood:'밤거리 네온과 스트리트 무드, 강한 에너지',
    palette:['#0F0F1A','#39FF88','#FF2E88','#00CFFF'], paletteText:'블랙+네온그린+네온핑크',
    keywords:'네온, 스트리트, 사이버 그래픽',
    fit:{ ipTypes:['게임','아이돌·아티스트'], targets:['fandom'] } },
  { id:'watercolor', name:'수채 일러스트', mood:'번지는 물감의 온기, 감성 문구·전시 굿즈 톤',
    palette:['#F4EDE4','#9AC1D9','#E8A0BF','#B5D99C'], paletteText:'아이보리+연블루+연핑크',
    keywords:'수채화, 감성 일러스트, 그림책 톤',
    fit:{ ipTypes:['웹툰·만화','자체 창작','캐릭터'], targets:['general','kids'] } },
  { id:'sporty', name:'캐주얼 스포티', mood:'유니폼과 배지 그래픽, 응원하는 즐거움',
    palette:['#1D3557','#E63946','#F1FAEE'], paletteText:'네이비+레드+화이트',
    keywords:'스포티, 유니폼 그래픽, 엠블럼',
    fit:{ ipTypes:['아이돌·아티스트','게임','브랜드·기업'], targets:['fandom','general'] } }
];

/* IP 종류·타깃 기준 추천 정렬 */
function gfRankConcepts(ipType, target) {
  return GF_CONCEPTS.slice().sort(function (a, b) {
    function score(c) {
      var s = 0;
      if (c.fit.ipTypes.indexOf(ipType) >= 0) s += 2;
      if (c.fit.targets.indexOf(target) >= 0) s += 1;
      return s;
    }
    return score(b) - score(a);
  });
}
