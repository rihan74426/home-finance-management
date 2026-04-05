"use client";
import Hero from "../components/Hero";
import Projects from "@/components/Projects";
import HireCTA from "@/components/HireCTA";
import Skills from "../components/Skills";
import Experience from "../components/Experience";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function Page() {
  return (
    <>
      <main className="page-wrapper">
        <Hero />
        <Skills />
        <HireCTA label="Like what you see? Let's build something together." />
        <Projects />
        <Experience />
        <Contact />
        <Footer />
      </main>
      <style jsx>{`
        .page-wrapper {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          min-height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          gap: 5rem;
          box-sizing: border-box;
        }
        @media (max-width: 1024px) {
          .page-wrapper {
            gap: 4rem;
            max-width: 920px;
          }
        }
        @media (max-width: 640px) {
          .page-wrapper {
            gap: 3rem;
          }
        }
      `}</style>
    </>
  );
}
