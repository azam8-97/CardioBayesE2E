import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../../stores/authStore";

const navLinks = [
  { label: "Home",     to: "/" },
  { label: "Demo",     to: "/demo" },
  { label: "Models",   to: "/models" },
  { label: "Research", to: "/research" },
  { label: "Docs",     to: "/docs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { token, user, logout } = useAuthStore();
  const isLoggedIn = !!token;

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to.split("#")[0]) && to.split("#")[0] !== "/";
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

  const displayName = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Account";

  return (
    <header className="navbar">
      <div className="container nav-content">
        <Link className="brand" to="/">
          <img src="/logo.svg" alt="CardioBayes" className="brand-logo" />
          <span className="brand-text">CardioBayes</span>
          <sup className="brand-sup">E2E</sup>
        </Link>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={clsx("nav-link", isActive(link.to) && "nav-link--active")}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {isLoggedIn ? (
            <div className="relative">
              <button
                type="button"
                className="btn btn-ghost flex items-center gap-2"
                onClick={() => setUserMenuOpen((prev) => !prev)}
              >
                <span className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
                  {displayName[0].toUpperCase()}
                </span>
                <span className="text-sm">{displayName}</span>
                <ChevronDown size={14} className={clsx("transition-transform", userMenuOpen && "rotate-180")} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-white text-sm font-medium truncate">{user?.full_name || displayName}</p>
                    <p className="text-slate-400 text-xs truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link className="btn btn-ghost" to="/auth?mode=login">
              Sign In
            </Link>
          )}
          <Link className="btn btn-primary" to="/inference">
            Get Started
          </Link>
        </div>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Click-outside overlay for user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}

      <div className={clsx("mobile-menu", isOpen && "mobile-menu--open")}>
        <div className="mobile-menu-header">
          <span>Navigation</span>
          <button
            className="icon-button"
            type="button"
            aria-label="Close navigation"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="mobile-menu-links">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={clsx("mobile-link", isActive(link.to) && "nav-link--active")}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mobile-menu-actions">
          {isLoggedIn ? (
            <>
              <Link className="btn btn-ghost" to="/dashboard" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <button
                type="button"
                className="btn btn-ghost text-red-400"
                onClick={() => { handleLogout(); setIsOpen(false); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link className="btn btn-ghost" to="/auth?mode=login" onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
          )}
          <Link className="btn btn-primary" to="/inference" onClick={() => setIsOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
