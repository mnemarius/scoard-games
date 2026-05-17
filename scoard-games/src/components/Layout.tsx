import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";


const navLinks = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/games", label: "Games" },
  { to: "/players", label: "Players" },
];

function activeLabel(pathname: string): string {
  if (pathname === "/") return "Dashboard";
  if (pathname.startsWith("/campaigns")) return "Campaigns";
  if (pathname.startsWith("/games")) return "Games";
  if (pathname.startsWith("/players")) return "Players";
  return "";
}

export function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-full flex flex-col bg-surface">
      <header className="bg-surface-raised border-b border-neutral-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg bg-neutral-100 text-content hover:bg-neutral-200 transition-colors shrink-0"
          >
            <svg viewBox="0 0 16 14" fill="currentColor" width="16" height="14" aria-hidden>
              <rect y="0" width="16" height="2" rx="1" />
              <rect y="6" width="16" height="2" rx="1" />
              <rect y="12" width="16" height="2" rx="1" />
            </svg>
          </button>

          <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-content-inverse font-display font-bold">
              S
            </span>
            <span className="text-lg font-semibold text-content">Scoard</span>
          </NavLink>

          <span className="sm:hidden text-sm text-content-subtle truncate">
            / {activeLabel(location.pathname)}
          </span>

          <nav className="hidden sm:flex items-center gap-1 ml-auto">
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

      <div
        onClick={() => setDrawerOpen(false)}
        aria-hidden
        className={`sm:hidden fixed inset-0 z-40 bg-neutral-900/50 transition-opacity ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        role="dialog"
        aria-label="Navigation"
        aria-hidden={!drawerOpen}
        className={`sm:hidden fixed top-0 bottom-0 left-0 z-50 w-[260px] max-w-[80vw] bg-surface-raised shadow-xl flex flex-col transform transition-transform duration-200 ease-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3.5 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-content-inverse font-display font-bold">
              S
            </span>
            <span className="text-base font-semibold text-content">Scoard</span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
            className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-neutral-100 text-content-muted hover:bg-neutral-200 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
        <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-800 font-semibold"
                    : "text-content hover:bg-neutral-100 font-medium"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-3.5 border-t border-neutral-200 text-xs text-content-subtle">
          Scoard — board game tracker
        </div>
      </aside>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="border-t border-neutral-200 py-4 text-center text-xs text-content-subtle">
        Scoard — board game score tracker
      </footer>
    </div>
  );
}
