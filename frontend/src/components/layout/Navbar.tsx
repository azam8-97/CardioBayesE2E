import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { label: "Home",     to: "/" },
  { label: "Demo",     to: "/#demo" },
  { label: "Models",   to: "/models" },
  { label: "Research", to: "/research" },
  { label: "Docs",     to: "/docs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to.split("#")[0]) && to.split("#")[0] !== "/";
  };

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
          <Link className="btn btn-ghost" to="/auth?mode=login">
            Sign In
          </Link>
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
          <Link className="btn btn-ghost" to="/auth?mode=login" onClick={() => setIsOpen(false)}>
            Sign In
          </Link>
          <Link className="btn btn-primary" to="/inference" onClick={() => setIsOpen(false)}>
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
