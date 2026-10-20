import { NavLink } from "react-router-dom";

export default function Header() {
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
      <p className="cash">주문 가능 금액 10,000,000원</p>
    </header>
  );
}
