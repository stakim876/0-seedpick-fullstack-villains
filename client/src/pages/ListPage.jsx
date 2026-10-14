function ListPage() {
  return (
    <main className="page">
      <h1></h1>

      <div className="tools"></div> 

      <div className="card-list"></div> 
    </main>
  );
}

export default ListPage;

// 제목은 목록. 검색은 기업 이름, 지역. 업종은 전체, 소프트웨어, 헬스케어, 물류, 교육.
// StartupCard로 기업을 보여주고, 누르면 /startups/아이디로 간다.
// 없으면 "등록된 기업이 없습니다." 검색 결과가 없으면 "검색 결과가 없습니다."