import { useState } from "react";
import { useAccount, START_CASH } from "../account";

function PortfolioPage() {
  const [sellId, setSellId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const { cash, setCash, holdings, setHoldings } = useAccount();
  // 총 자산, 평가 손익, 주문 가능 금액을 보유와 잔액으로 계산한다.
  const totalAssets =
    cash + holdings.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const profit = totalAssets - START_CASH;
  const orderable = cash;

  // 매도하면 보유 수량을 줄이고 판 금액을 잔액에 더한다.
  function onSell(event) {
    event.preventDefault();
    const shares = Number(quantity);

    if (quantity.trim() === "" || Number.isNaN(shares) || shares <= 0) {
      setMessage("수량을 입력하세요.");
      return;
    }

    const holding = holdings.find((item) => item.id === sellId);

    if (!holding || shares > holding.quantity) {
      setMessage("보유 수량보다 많습니다.");
      return;
    }

    const nextQuantity = holding.quantity - shares;
    setCash(cash + holding.price * shares);

    if (nextQuantity === 0) {
      setHoldings(holdings.filter((item) => item.id !== holding.id));
    } else {
      setHoldings(
        holdings.map((item) =>
          item.id === holding.id
            ? { ...item, quantity: nextQuantity, value: nextQuantity * item.price }
            : item,
        ),
      );
    }

    setQuantity("");
    setMessage("");
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
          <strong>{profit.toLocaleString("ko-KR")}원</strong>
        </article>
        <article>
          <span>주문 가능 금액</span>
          <strong>{orderable.toLocaleString("ko-KR")}원</strong>
        </article>
      </section>
      {holdings.length === 0 && <p className="empty">보유한 기업이 없습니다.</p>}
      {holdings.map((item) => (
        <section className="holding" key={item.id}>
          <p>{item.name}</p>
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