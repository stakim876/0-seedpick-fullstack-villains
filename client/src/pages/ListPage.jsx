import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StartupCard from "../components/StartupCard";

const industries = ["전체", "소프트웨어", "헬스케어", "물류", "교육"];

function ListPage() {
  const [startups, setStartups] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("전체");
  const [status, setStatus] = useState("loading");

  // 기업 목록을 받는다. 실패하면 다시 시도할 수 있다.
  async function loadStartups() {
    setStatus("loading");

    try {
      const response = await fetch("/api/startups");

      if (!response.ok) {
        throw new Error();
      }

      setStartups(await response.json());
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    loadStartups();
  }, []);

  // 검색은 기업 이름, 지역. 업종이 전체가 아니면 그 업종만 남긴다.
  const text = keyword.trim().toLowerCase();
  const visible = startups.filter((startup) => {
    const sameIndustry = industry === "전체" || startup.industry === industry;
    const haystack = `${startup.name} ${startup.region}`.toLowerCase();
    const matched = text === "" || haystack.includes(text);

    return sameIndustry && matched;
  });

  return (
    <main className="page">
      <h1>목록</h1>
      <div className="tools">
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="기업 이름, 지역"
        />
        <select value={industry} onChange={(event) => setIndustry(event.target.value)}>
          {industries.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      {status === "loading" && <p className="empty">기업을 불러오는 중입니다.</p>}
      {status === "error" && (
        <>
          <p className="empty">목록을 불러오지 못했습니다.</p>
          <button type="button" onClick={loadStartups}>
            다시 시도
          </button>
        </>
      )}
      {status === "done" && visible.length === 0 && (
        <p className="empty">
          {startups.length === 0 ? "등록된 기업이 없습니다." : "검색 결과가 없습니다."}
        </p>
      )}
      {status === "done" && visible.length > 0 && (
        <div className="card-list">
          {visible.map((startup) => (
            <Link key={startup.id} to={`/startups/${startup.id}`}>
              <StartupCard startup={startup} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

export default ListPage;
