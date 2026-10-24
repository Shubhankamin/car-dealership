import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const onVehiclesPage = location.pathname === "/";
  const onAdminPage = location.pathname.startsWith("/admin");

  function closeDrawer() {
    setDrawerOpen(false);
  }

  function handleLogout() {
    closeDrawer();
    logout();
    navigate("/login", { replace: true });
  }

  useEffect(() => {
    closeDrawer();
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
      active
        ? "bg-orange-600 text-white shadow-sm shadow-orange-950/20"
        : "text-slate-200 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1F2937] text-white shadow-lg shadow-slate-950/5">
      <nav
        className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:gap-3"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-600 shadow-md shadow-orange-950/20 transition group-hover:bg-orange-500">
            <CarIcon />
          </span>

          <span className="flex min-w-0 flex-col">
            <span className="text-lg font-extrabold tracking-tight">
              Auto<span className="text-orange-400">Stock</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400 sm:block">
              Dealership inventory
            </span>
          </span>
        </Link>

        {/* Desktop navigation: 1024px and wider */}
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/"
            aria-current={onVehiclesPage ? "page" : undefined}
            className={linkClass(onVehiclesPage)}
          >
            <CarIcon />
            Vehicles
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              aria-current={onAdminPage ? "page" : undefined}
              className={linkClass(onAdminPage)}
            >
              <InventoryIcon />
              Manage inventory
            </Link>
          )}
        </div>

        {/* Desktop account controls */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10 text-sm font-bold text-orange-300">
            {(user?.email?.trim()?.charAt(0) || "U").toUpperCase()}
          </div>

          <div className="flex max-w-40 flex-col">
            <span className="truncate text-xs font-semibold text-white">
              {user?.email || "Account"}
            </span>
            <span className="mt-0.5 text-[10px] text-slate-400">
              {isAdmin ? "Administrator" : "Customer"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-orange-500/40 hover:bg-orange-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>

        {/* Mobile and tablet controls */}
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10 text-sm font-bold text-orange-300">
            {(user?.email?.trim()?.charAt(0) || "U").toUpperCase()}
          </span>

          <button
            type="button"
            aria-label={
              drawerOpen ? "Close navigation drawer" : "Open navigation drawer"
            }
            aria-expanded={drawerOpen}
            aria-controls="mobile-navigation-drawer"
            onClick={() => setDrawerOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-orange-500/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* Overlay: click outside to close */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          drawerOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* Right-side sliding drawer */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!drawerOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(88vw,360px)] flex-col border-l border-white/10 bg-[#1F2937] shadow-2xl shadow-black/30 transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={
          !drawerOpen
            ? { visibility: "hidden", transitionDelay: "0ms" }
            : undefined
        }
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600">
              <CarIcon />
            </span>
            <div>
              <p className="font-extrabold tracking-tight">
                Auto<span className="text-orange-400">Stock</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close navigation drawer"
            tabIndex={drawerOpen ? 0 : -1}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Account card */}
        <div className="p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10 text-base font-bold text-orange-300">
              {(user?.email?.trim()?.charAt(0) || "U").toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.email || "Account"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isAdmin ? "Administrator" : "Customer"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            Menu
          </p>

          <div className="space-y-2">
            <Link
              to="/"
              tabIndex={drawerOpen ? 0 : -1}
              onClick={closeDrawer}
              aria-current={onVehiclesPage ? "page" : undefined}
              className={linkClass(onVehiclesPage)}
            >
              <CarIcon />
              <span>Vehicles</span>
              {onVehiclesPage && (
                <span className="ml-auto h-2 w-2 rounded-full bg-orange-300" />
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                tabIndex={drawerOpen ? 0 : -1}
                onClick={closeDrawer}
                aria-current={onAdminPage ? "page" : undefined}
                className={linkClass(onAdminPage)}
              >
                <InventoryIcon />
                <span>Manage inventory</span>
                {onAdminPage && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-orange-300" />
                )}
              </Link>
            )}
          </div>
        </div>

        {/* Drawer footer */}
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            tabIndex={drawerOpen ? 0 : -1}
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3.5 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogoutIcon />
            Log out
          </button>
          <p className="mt-4 text-center text-[10px] text-slate-500">
            AutoStock · Dealership inventory
          </p>
        </div>
      </aside>
    </header>
  );
}

function CarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M3 14l2-6h14l2 6M4 14h16v5H4zM7 19v2m10-2v2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="16.5" r="1" />
      <circle cx="17" cy="16.5" r="1" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 012 2v14a2 2 0 01-2 2h-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
