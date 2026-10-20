import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function DetailPage() {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [status, setStatus] = useState("loading");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");

  // 주소의 아이디로 기업 하나를 받는다. 없으면 목록으로 돌아갈 수 있다.
  async function loadStartup() {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch(`/api/startups/${id}`);

      if (response.status === 404) {
        setStartup(null);
        setStatus("missing");
        return;
      }

      if (!response.ok) {
        throw new Error();
      }

      setStartup(await response.json());
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    loadStartup();
  }, [id]);

  // 수량이 없거나 0 이하면 안내만 한다. 잔액은 바꾸지 않는다.
  function onBuy(event) {
    event.preventDefault();
    const shares = Number(quantity);

    if (quantity.trim() === "" || Number.isNaN(shares) || shares <= 0) {
      setMessage("수량을 입력하세요.");
      return;
    }

    setMessage("");
  }

  const rate =
    startup && (startup.changeRate > 0 ? `+${startup.changeRate}` : startup.changeRate);
  const rateClass = startup && startup.changeRate < 0 ? "down" : "";

  return (
    <main className="page">
      <h1>상세</h1>
      {status === "loading" && <p className="empty">기업을 불러오는 중입니다.</p>}
      {status === "error" && <p className="empty">기업을 불러오지 못했습니다.</p>}
      {status === "missing" && (
        <p className="empty">
          기업을 찾을 수 없습니다. <Link to="/">목록으로</Link>
        </p>
      )}
      {status === "done" && startup && (
        <>
          <section className="info">
            <h2>{startup.name}</h2>
            <dl>
              <dt>소개</dt>
              <dd>{startup.description}</dd>
              <dt>업종</dt>
              <dd>{startup.industry}</dd>
              <dt>단계</dt>
              <dd>{startup.stage}</dd>
              <dt>지역</dt>
              <dd>{startup.region}</dd>
              <dt>가상 주가</dt>
              <dd>{startup.price.toLocaleString("ko-KR")}원</dd>
              <dt>등락률</dt>
              <dd className={rateClass}>{rate}%</dd>
            </dl>
          </section>
          <form className="buy" onSubmit={onBuy}>
            <label>
              수량
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
            </label>
            {message && <p className="empty">{message}</p>}
            <button type="submit">매수</button>
          </form>
          <p>
            <Link to="/">목록으로</Link>
          </p>
        </>
      )}
    </main>
  );
}

export default DetailPage;
