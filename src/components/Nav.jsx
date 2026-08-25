import { useEffect, useState } from "react";
import { navLinks } from "../data.js";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="container nav-inner">
        <a className="nav-logo" href="#home" aria-label="回到首页">
          <span className="nav-logo-mark">TZ</span>
          <span className="nav-logo-name">童政 · 跨境运营</span>
        </a>
        <nav className="nav-links" aria-label="主导航">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-accent nav-cta" href="#contact">
          联系我
        </a>
      </div>
    </header>
  );
}
