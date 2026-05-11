import { NavLink, Outlet } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/games", label: "Games" },
  { to: "/players", label: "Players" },
];

export function Layout() {
  return (
    <div className="min-h-full flex flex-col bg-surface text-content">
      <header className="bg-surface-raised border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-content-inverse font-bold">
              S
            </span>
            <span className="text-lg font-semibold text-content">Scoard</span>
          </NavLink>
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-800"
                      : "text-content-muted hover:text-content hover:bg-neutral-100"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 py-4 text-center text-xs text-content-subtle">
        Scoard — board game score tracker
      </footer>
    </div>
  );
}
