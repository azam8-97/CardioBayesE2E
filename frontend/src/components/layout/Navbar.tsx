import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Demo", href: "#demo" },
  { label: "Models", href: "#models" },
  { label: "Research", href: "#research" },
  { label: "Docs", href: "#docs" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container nav-content">
        <a className="brand" href="#home">
          <img src="/logo.svg" alt="CardioBayes" className="brand-logo" />
          <span className="brand-text">CardioBayes</span>
          <sup className="brand-sup">E2E</sup>
        </a>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="btn btn-ghost" to="/auth?mode=login">
            Sign In
          </Link>
          <a className="btn btn-primary" href="#cta">
            Get Started
          </a>
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
            <a
              key={link.label}
              href={link.href}
              className="mobile-link"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="mobile-menu-actions">
          <Link className="btn btn-ghost" to="/auth?mode=login" onClick={() => setIsOpen(false)}>
            Sign In
          </Link>
          <a className="btn btn-primary" href="#cta" onClick={() => setIsOpen(false)}>
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
