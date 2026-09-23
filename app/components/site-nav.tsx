import { NavLink, useLocation } from "react-router";

export function SiteNav() {
  // A new document clears the homepage's third-party ad runtime.
  const reloadDocument = useLocation().pathname === "/";
  return (
    <nav className="top-nav product-nav" aria-label="주요 메뉴">
      <NavLink reloadDocument={reloadDocument} className="brand" to="/" aria-label="GoodThingz 홈">
        <span className="brand-mark" aria-hidden="true">
          G
        </span>
        <span>GoodThingz</span>
      </NavLink>
      <div className="nav-links">
        <NavLink reloadDocument={reloadDocument} to="/pet-travel" end>
          장소 찾기
        </NavLink>
        <NavLink reloadDocument={reloadDocument} to="/pet-travel/guides">방문 가이드</NavLink>
        <NavLink reloadDocument={reloadDocument} to="/pet-travel/plan">내 방문 계획</NavLink>
      </div>
    </nav>
  );
}
