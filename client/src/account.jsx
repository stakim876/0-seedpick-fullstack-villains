import { createContext, useContext, useEffect, useState } from "react";

// 주문 가능 금액과 보유를 화면이 같이 본다.
export const START_CASH = 10000000;

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const [cash, setCash] = useState(START_CASH);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  // 서버에 저장된 잔액, 보유, 주문 내역을 불러온다. 없으면 처음 값 그대로 둔다.
  useEffect(() => {
    async function loadAccount() {
      try {
        const response = await fetch("/api/account");

        if (!response.ok) {
          throw new Error();
        }

        let account = await response.json();
        const saved = localStorage.getItem("account");

        if (
          saved &&
          account.cash === START_CASH &&
          account.holdings.length === 0 &&
          account.orders.length === 0
        ) {
          account = JSON.parse(saved);
          await fetch("/api/account", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(account),
          });
        }

        localStorage.removeItem("account");
        setCash(account.cash);
        setHoldings(account.holdings);
        setOrders(account.orders);
        setReady(true);
      } catch {
        setError("계좌를 불러오지 못했습니다.");
      }
    }

    loadAccount();
  }, []);

  // 잔액, 보유, 주문 내역이 바뀌면 서버에 다시 저장한다.
  useEffect(() => {
    if (!ready) {
      return;
    }

    fetch("/api/account", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cash, holdings, orders }),
    }).then((response) => {
      if (!response.ok) {
        setError("계좌를 저장하지 못했습니다.");
      }  
    });
  }, [ready, cash, holdings, orders]);

  return (
    <AccountContext.Provider value={{ cash, setCash, holdings, setHoldings, orders, setOrders }}>
      {error && <p className="empty">{error}</p>}
      {!error && !ready && <p className="empty">계좌를 불러오는 중입니다.</p>}
      {ready && children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}