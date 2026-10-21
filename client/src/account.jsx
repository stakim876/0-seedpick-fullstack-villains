import { createContext, useContext, useState } from "react";

// 주문 가능 금액과 보유를 화면이 같이 본다.
export const START_CASH = 10000000;

const AccountContext = createContext(null);

export function AccountProvider({ children }) {
  const [cash, setCash] = useState(START_CASH);
  const [holdings, setHoldings] = useState([]);

  return (
    <AccountContext.Provider value={{ cash, setCash, holdings, setHoldings }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
