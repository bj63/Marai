import React from "react";
import { RouteGuard } from "./RouteGuard";

type NavItem = { href: string; label: string; section: string };

type NavRailProps = {
  navItems: NavItem[];
};

export function NavRail({ navItems }: NavRailProps) {
  return (
    <aside className="nav-rail">
      <div className="nav-rail__title">Navigate</div>
      <ul>
        {navItems.map((item) => (
          <li key={item.href}>
            <RouteGuard section={item.section}>
              <a href={item.href} className="nav-rail__link">
                {item.label}
              </a>
            </RouteGuard>
          </li>
        ))}
      </ul>
    </aside>
  );
}
