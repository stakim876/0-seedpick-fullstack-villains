import { useState } from "react";

function PrortfolioPage() {
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const holdings = [];

  function onSell(event) {
    event.preventDefault();
    setMessage("보유한 기업이 없습니다.");
  }

  return (
    <main className="page">
      <h1>포트폴리오</h1>
      <section className="sumary">
        <article>
          <span>총 자산</span>
          <strong>10,000,000원</strong>
        </article>
        <article>
          <span>평가 손익</span>
          <strong>0원</strong>
        </article>
        <article>
          <span>주문 가능 금액</span>
          <strong>10,000,000원</strong>
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
          매도 수량
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />  
        </label>
        {massage && <p className="empty">{massage}</p>}
        <button type="submit">매도</button>
      </form>
    </main>
  );
}

export default PrortfolioPage;