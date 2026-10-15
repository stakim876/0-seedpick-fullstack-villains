import { useState } from "react";
import { Link } from "react-router-dom";
import { useAccount } from "../account";

// 김승태: 주문 내역을 전체·매수·매도로 거르고, 기업 이름을 누르면 상세로 이동한다.
// 한 줄에는 시각, 기업 이름, 매수·매도, 수량, 주가, 금액을 보여 준다.
function HistoryPage() {
  const { orders } = useAccount();
  // 전체, 매수, 매도로 내역을 거른다. 기업 이름을 누르면 상세로 간다.
  const [side, setSide] = useState("all");
  const visible = orders.filter((order) => side === "all" || order.side === side);

  return (
    <main className="page">
      <h1>주문 내역</h1>
      <div className="tools">
        <select value={side} onChange={(event) => setSide(event.target.value)}>
          <option value="all">전체</option>
          <option value="buy">매수</option>
          <option value="sell">매도</option>  
        </select>
      </div>
      {/* 내역이 없으면 안내한다. 필터에 해당하는 주문이 없으면 따로 안내한다. */}
      {orders.length === 0 && <p className="empty">주문 내역이 없습니다.</p>}
      {orders.length > 0 && visible.length === 0 && (
        <p className="empty">해당하는 주문이 없습니다.</p>
      )}
      {visible.map((order) => (
        <section className="holding" key={order.id}>
          <p>{new Date(order.createdAt).toLocaleString("ko-KR")}</p>
          <p>
            <Link to={`/startups/${order.startupId}`}>{order.name}</Link>
          </p>
          <p>{order.side === "buy" ? "매수" : "매도"}</p>
          <p>수량 {order.quantity}</p>
          <p>주가 {order.price.toLocaleString("ko-KR")}원</p>
          <p>금액 {order.amount.toLocaleString("ko-KR")}원</p>
        </section>
      ))}
    </main>
  );
}

export default HistoryPage;
