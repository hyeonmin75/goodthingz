import { NavLink } from "react-router";

export function SiteNav() {
  return (
    <nav className="top-nav product-nav" aria-label="주요 메뉴">
      <NavLink className="brand" to="/" aria-label="GoodThingz 홈">
        <span className="brand-mark" aria-hidden="true">
          G
        </span>
        <span>GoodThingz</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/pet-travel" end>
          장소 찾기
        </NavLink>
        <NavLink to="/pet-travel/guides">방문 가이드</NavLink>
        <NavLink to="/pet-travel/plan">내 방문 계획</NavLink>
      </div>
    </nav>
  );
}
