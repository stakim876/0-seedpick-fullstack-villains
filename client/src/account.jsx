import { createContext, useContext, useEffect, useState } from "react";

// 주문 가능 금액과 보유를 화면이 같이 본다.
export const START_CASH = 10000000;

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const [cash, setCash] = useState(START_CASH);
  const [holdings, setHoldings] = useState([]);
  const [orders, setOrders] = useState([]);

  // 저장된 잔액, 보유, 주문 내역을 불러온다. 없으면 처음 값 그대로 둔다.
  useEffect(() => {
    const saved = localStorage.getItem("account");

    if (!saved) {
      return;
    }

    const account = JSON.parse(saved);
    setCash(account.cash);
    setHoldings(account.holdings);
    setOrders(account.orders);
  }, []);

  // 잔액, 보유, 주문 내역이 바뀌면 브라우저에 다시 저장한다.
  useEffect(() => {
    localStorage.setItem(
      "account",
      JSON.stringify({ cash, holdings, orders }),
    );
  }, [cash, holdings, orders]);
  
  return (
    <AccountContext.Provider value={{ cash, setCash, holdings, setHoldings, orders, setOrders }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
