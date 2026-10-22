import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "../account";

function DetailPage() {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [status, setStatus] = useState("loading");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const { cash, setCash, holdings, setHoldings, orders, setOrders } = useAccount();

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

  // 매수하면 잔액을 줄이고 보유를 갱신한다. 돈이 부족하면 안내만 한다.
  function onBuy(event) {
    event.preventDefault();
    const shares = Number(quantity);

    if (!startup) {
      return;
    }

    if (quantity.trim() === "" || Number.isNaN(shares) || shares <= 0) {
      setMessage("수량을 입력하세요.");
      return;
    }

    const cost = startup.price * shares;

    if (cost > cash) {
      setMessage("주문 가능 금액이 부족합니다.");
      return;
    }

    const owned = holdings.find((item) => item.id === startup.id);

    if (owned) {
      const nextQuantity = owned.quantity + shares;
      const averagePrice = (owned.quantity * owned.averagePrice + cost) / nextQuantity;

      setHoldings(
        holdings.map((item) =>
          item.id === startup.id
            ? {
                ...item,
                quantity: nextQuantity,
                averagePrice,
                price: startup.price,
                value: nextQuantity * startup.price,
              }
            : item,
        ),
      );
    } else {
      setHoldings([
        ...holdings,
        {
          id: startup.id,
          name: startup.name,
          quantity: shares,
          averagePrice: startup.price,
          price: startup.price,
          value: cost,
        },
      ]);
    }

    setCash(cash - cost);
    // 매수가 되면 주문 내역 맨 앞에 한 줄을 남긴다.
    setOrders([
      {
        id: String(Date.now()),
        startupId: startup.id,
        name: startup.name,
        side: "buy",
        quantity: shares,
        price: startup.price,
        amount: cost,
        createdAt: new Date().toISOString(),
      },
      ...orders,
    ]);
    setQuantity("");
    setMessage(`${startup.name} ${shares}주를 매수했습니다.`);
  }

  const rate =
    startup && (startup.changeRate > 0 ? `+${startup.changeRate}` : startup.changeRate);
  const rateClass = startup && startup.changeRate < 0 ? "down" : "";
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
