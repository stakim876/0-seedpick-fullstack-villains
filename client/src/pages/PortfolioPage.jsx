import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount, START_CASH } from "../account";

// 김승태: 총 자산, 평가 손익, 주문 가능 금액을 보여주고, 매도 주문을 서버에 보낸다.
function PortfolioPage() {
  const [sellId, setSellId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const { cash, setCash, holdings, setHoldings, setOrders } = useAccount();
  // 총 자산, 평가 손익, 주문 가능 금액을 보유와 잔액으로 계산한다.
  const totalAssets =
    cash + holdings.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const profit = totalAssets - START_CASH;
  const orderable = cash;
  // 1주 미만이거나 보유보다 많으면 주문하지 않는다. 되면 서버가 돌려준 잔액·보유·내역으로 다시 그린다.
  async function onSell(event) {
    event.preventDefault();
    const shares = Number(quantity);
    const holding = holdings.find((item) => item.id === sellId);

    if (quantity.trim() === "" || !Number.isInteger(shares) || shares < 1) {
      setMessage("수량을 입력하세요.");
      return;
    }

    if (!holding || shares > holding.quantity) {
      setMessage("보유 수량보다 많습니다.");
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: holding.id, side: "sell", quantity: shares }),
      });
      const body = await response.json();

      if (!response.ok) {
        setMessage(body.message || "매도하지 못했습니다.");
        return;
      }

      setCash(body.cash);
      setHoldings(body.holdings);
      setOrders(body.orders);
      setQuantity("");
      if (!body.holdings.some((item) => item.id === holding.id)) {
        setSellId("");
      }
      setMessage(`${holding.name} ${shares}주를 매도했습니다.`);
    } catch {
      setMessage("매도하지 못했습니다.");
    }
  }
  return (
    <main className="page">
      <h1>포트폴리오</h1>
      <section className="summary">
        <article>
          <span>총 자산</span>
          <strong>{totalAssets.toLocaleString("ko-KR")}원</strong>
        </article>
        <article>
          <span>평가 손익</span>
          <strong className={profit > 0 ? "up" : profit < 0 ? "down" : ""}>
            {profit > 0 ? "+" : ""}
            {profit.toLocaleString("ko-KR")}원
          </strong>
        </article>
        <article>
          <span>주문 가능 금액</span>
          <strong>{orderable.toLocaleString("ko-KR")}원</strong>
        </article>
      </section>
      {/* 보유가 없으면 안내만 보여 준다. */}
      {holdings.length === 0 && <p className="empty">보유한 기업이 없습니다.</p>}
      {holdings.map((item) => (
        <section className="holding" key={item.id}>
          {/* 보유 기업 이름을 누르면 그 기업 상세로 간다. */}
          <p>
            <Link to={`/startups/${item.id}`}>{item.name}</Link>
          </p>
          <p>수량 {item.quantity}</p>
          <p>평균 단가 {item.averagePrice.toLocaleString("ko-KR")}원</p>
          <p>평가액 {item.value.toLocaleString("ko-KR")}원</p>
        </section>
      ))}
      <form className="buy" onSubmit={onSell}>
        <label>
          매도 기업
          <select value={sellId} onChange={(event) => setSellId(event.target.value)}>
            <option value="">보유 기업</option>
            {holdings.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          매도 수량
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </label>
        {message && <p className="empty">{message}</p>}
        <button type="submit">매도</button>
      </form>
    </main>
  );
}
export default PortfolioPage;