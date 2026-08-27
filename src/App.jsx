import { useEffect, useState } from "react";
import Admin from "./components/Admin.jsx";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import About from "./components/About.jsx";
import Portfolio from "./components/Portfolio.jsx";
import Strengths from "./components/Strengths.jsx";
import Contact from "./components/Contact.jsx";

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === "#admin");

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === "#admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (isAdmin) return <Admin />;

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Portfolio />
        <Strengths />
      </main>
      <Contact />
    </>
  );
}
