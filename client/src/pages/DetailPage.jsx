import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "../account";

// 김승태: 기업 상세를 조회하고, 매수 주문을 서버에 보낸다.

function DetailPage() {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [status, setStatus] = useState("loading");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const { cash, setCash, holdings, setHoldings, setOrders } = useAccount();

  // 주소의 아이디로 기업 하나를 받는다. 없으면 목록으로 돌아갈 수 있다.
  useEffect(() => {
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

    loadStartup();
  }, [id]);

  // 1주 미만이거나 잔액보다 비싸면 주문하지 않는다. 되면 서버가 돌려준 잔액·보유·내역으로 다시 그린다.
  async function onBuy(event) {
    event.preventDefault();
    const shares = Number(quantity);

    if (!startup) {
      return;
    }

    if (quantity.trim() === "" || !Number.isInteger(shares) || shares < 1) {
      setMessage("수량을 입력하세요.");
      return;
    }

    if (startup.price * shares > cash) {
      setMessage("주문 가능 금액이 부족합니다.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id, side: "buy", quantity: shares }),
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(body.message || "매수하지 못했습니다.");
        return;
      }

      setCash(body.cash);
      setHoldings(body.holdings);
      setOrders(body.orders);
      setQuantity("");
      setMessage(`${startup.name} ${shares}주를 매수했습니다.`);
    } catch {
      setMessage("매수하지 못했습니다.");
    }
  }

  const rate =
    startup && (startup.changeRate > 0 ? `+${startup.changeRate}` : startup.changeRate);
  const rateClass =
    startup && startup.changeRate > 0 ? "up" : startup && startup.changeRate < 0 ? "down" : "";
  const sharesPreview = Number(quantity);
  const buyAmount =
    startup && quantity.trim() !== "" && !Number.isNaN(sharesPreview) && sharesPreview > 0
      ? startup.price * sharesPreview
      : 0;

  // 이미 가진 기업이면 보유 수량을 보여 준다.
  const owned = startup && holdings.find((item) => item.id === startup.id);
      
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
              {owned && <p className="empty">보유 {owned.quantity}주</p>}
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
            <p className="empty">매수 금액 {buyAmount.toLocaleString("ko-KR")}원</p>
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
