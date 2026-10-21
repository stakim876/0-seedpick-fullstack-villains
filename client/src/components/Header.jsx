import { NavLink } from "react-router-dom";
import { useAccount } from "../account";

export default function Header() {
  const { cash } = useAccount();

  return (
    <header className="header">
      <NavLink to="/" className="logo">
        시드픽
      </NavLink>
      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          목록
        </NavLink>
        <NavLink
          to="/portfolio"
          className={({ isActive }) => (isActive ? "is-active" : "")}
        >
          포트폴리오
        </NavLink>
      </nav>
      <p className="cash">주문 가능 금액 {cash.toLocaleString("ko-KR")}원</p>
    </header>
  );
}
