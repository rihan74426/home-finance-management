"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const WA_LINK =
  "https://wa.me/8801866042393?text=" +
  encodeURIComponent(
    "Hello! I saw your portfolio and would like to talk about an idea."
  );

// ── Quick facts strip ────────────────────────────────────────────────────
const QUICK_FACTS = [
  { label: "Based in", value: "Chattogram, BD" },
  { label: "Experience", value: "6+ years dev" },
  { label: "Response time", value: "Within 2h" },
  { label: "Engagement type", value: "Collaboration / solving problems" },
];

// ── Timeline ─────────────────────────────────────────────────────────────
const TIMELINE = [
  {
    date: "2025 — 2026",
    title: "Solo Developer — NJ's Games Portal",
    bullets: [
      "Designed and built 5 complete browser games using raw Canvas API and core JS — no game engine.",
      "Translated client descriptions and mood references directly into working gameplay.",
      "Built every lobby UI in React/Next.js: character cards, stat bars, particle systems.",
      "Full stack: game logic, collision detection, scoring, responsive layout, deployment.",
    ],
  },
  {
    date: "2025",
    title: "Full-stack Developer — At-taleem",
    bullets: [
      "Built the platform's Next.js frontend and Node/MongoDB backend from scratch.",
      "2,000+ monthly active users within the first month of launch.",
      "Improved Lighthouse LCP by ~45% through code-splitting and image optimization.",
      "Mentored junior developers and introduced component library patterns.",
    ],
  },
  {
    date: "2019 — Present",
    title: "Freelance Web Developer",
    bullets: [
      "Delivered 20+ production websites for startups, NGOs, and small businesses.",
      "Stack: React, Vue, Next.js, Node.js, MongoDB, Express, Tailwind.",
      "End-to-end ownership: design handoff, development, deployment, maintenance.",
    ],
  },
  {
    date: "2015 — Present",
    title: "Teacher & Sub-director",
    bullets: [
      "8 years teaching with 2 years in institutional leadership.",
      "Designed curricula, created digital learning materials, led student programmes.",
      "Led a team of teachers and administrative staff, improved retention and exam results.",
    ],
  },
];

// ── Process steps ─────────────────────────────────────────────────────────
const PROCESS = [
  {
    step: "01",
    title: "Discover",
    desc: "I listen first. Goals, users, constraints. I ask the right questions before touching a keyboard.",
  },
  {
    step: "02",
    title: "Scope & plan",
    desc: "Wireframes, prioritised features, clear milestones. Small iterations so value arrives early.",
  },
  {
    step: "03",
    title: "Design & build",
    desc: "Modern, accessible front-ends. Clean components. I write code that future-you won't hate.",
  },
  {
    step: "04",
    title: "Review & ship",
    desc: "Performance checks, accessibility audit, cross-device testing, then deploy to Vercel or your stack.",
  },
  {
    step: "05",
    title: "Handoff & support",
    desc: "Documentation, training if needed, and I'm available post-launch for the inevitable edge cases.",
  },
];

export default function About() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const fade = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(20px)",
    transition: `all 0.7s ease ${delay}ms`,
  });

  const cardStyle = {
    background: "var(--glass-bg)",
    backdropFilter: "blur(var(--glass-blur))",
    border: "1px solid var(--glass-border)",
    borderRadius: 20,
    padding: "24px 28px",
  };

  return (
    <main
      id="about"
      ref={ref}
      style={{ padding: "60px 0", maxWidth: 1100, margin: "0 auto" }}
    >
      {/* ── TL;DR AVAILABILITY CARD ── */}
      {/* Psychology: this answers the first question every client has —
          "is this person available, and can I afford them?"
          Answering it immediately removes the biggest friction point.      */}
      <div
        style={{
          ...cardStyle,
          marginBottom: 56,
          background:
            "linear-gradient(135deg, var(--accent-dim), rgba(8,12,18,0.6))",
          border: "1px solid var(--accent-border)",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "center",
          justifyContent: "space-between",
          ...fade(0),
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            alignItems: "center",
          }}
        >
          {/* Green availability pulse */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#4ade80",
                boxShadow: "0 0 10px rgba(74,222,128,0.7)",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span
              style={{ fontWeight: 700, fontSize: "0.95rem", color: "#4ade80" }}
            >
              Available for new projects
            </span>
          </div>

          <div
            style={{ width: 1, height: 28, background: "var(--glass-border)" }}
          />

          {/* Quick facts row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
            {QUICK_FACTS.map((f) => (
              <div key={f.label}>
                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {f.label}
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    marginTop: 2,
                  }}
                >
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs — one warm, one cool */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              borderRadius: 50,
              background: "#25D366",
              color: "#000",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(37,211,102,0.3)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp me
          </a>
          <a
            href="mailto:rihannjna@gmail.com"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 22px",
              borderRadius: 50,
              border: "1.5px solid var(--teal-border)",
              color: "var(--teal)",
              fontWeight: 600,
              fontSize: "0.875rem",
              textDecoration: "none",
              background: "var(--teal-dim)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(45,212,191,0.18)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--teal-dim)";
            }}
          >
            Send an email
          </a>
        </div>
      </div>

      {/* ── Page header ── */}
      <div style={{ textAlign: "center", marginBottom: 56, ...fade(100) }}>
        <h1
          className="font-poppins font-extrabold text-4xl md:text-5xl hero-contrast"
          style={{ marginBottom: 16 }}
        >
          About me
        </h1>
        <p
          style={{
            color: "var(--muted)",
            maxWidth: 620,
            margin: "0 auto",
            fontSize: "1.05rem",
            lineHeight: 1.75,
          }}
        >
          I'm Nuruddin — a full-stack developer, former educator, and book
          editor based in Chattogram, Bangladesh. The combination is rarer than
          it sounds, and it shapes how I work: I communicate clearly, think
          about the user, and write code that someone else can actually
          maintain.
        </p>
      </div>

      {/* ── Two-column layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 32,
          alignItems: "start",
        }}
        className="about-grid"
      >
        {/* LEFT: profile card */}
        <aside style={{ ...cardStyle, ...fade(150) }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 20,
            }}
          >
            <Image
              src="/avatar.png"
              alt="Nuruddin"
              width={68}
              height={68}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--glass-border)",
              }}
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  color: "var(--text)",
                }}
              >
                Nuruddin
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--muted)",
                  marginTop: 2,
                }}
              >
                Full-stack Web Developer
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {[
              { label: "Location", val: "Chattogram, BD" },
              { label: "Open to", val: "Freelance & remote" },
              { label: "Languages", val: "English, Bengali, Arabic" },
            ].map(({ label, val }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--faint)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text)",
                    fontWeight: 500,
                    marginTop: 2,
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://drive.google.com/uc?export=download&id=18yy6JjunzPTmPNFJD-e4yLQj9Bt5oX9_"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 18px",
              borderRadius: 50,
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.84rem",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download CV
          </a>
        </aside>

        {/* RIGHT: content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {/* Timeline */}
          <div style={fade(200)}>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              Experience
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {TIMELINE.map((item, i) => (
                <div key={i} style={{ ...cardStyle, padding: "18px 22px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "var(--text)",
                      }}
                    >
                      {item.title}
                    </h4>
                    <time
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--teal)",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.date}
                    </time>
                  </div>
                  <ul
                    style={{
                      margin: 0,
                      padding: 0,
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {item.bullets.map((b, j) => (
                      <li
                        key={j}
                        style={{
                          display: "flex",
                          gap: 10,
                          fontSize: "0.875rem",
                          color: "var(--muted)",
                          lineHeight: 1.55,
                        }}
                      >
                        <span
                          style={{
                            color: "var(--teal)",
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          ▸
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* How I work */}
          <div style={fade(250)}>
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 16,
              }}
            >
              How I work
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PROCESS.map((p) => (
                <div
                  key={p.step}
                  style={{
                    ...cardStyle,
                    padding: "16px 20px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "var(--teal)",
                      letterSpacing: "0.08em",
                      minWidth: 26,
                      paddingTop: 2,
                    }}
                  >
                    {p.step}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: "var(--text)",
                        marginBottom: 4,
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.84rem",
                        color: "var(--muted)",
                        lineHeight: 1.6,
                      }}
                    >
                      {p.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values — 3 words with meaning */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 12,
              ...fade(300),
            }}
          >
            {[
              {
                word: "Reliable",
                desc: "Deadlines kept. Honest when there's a problem.",
              },
              {
                word: "Pragmatic",
                desc: "Shipping beats perfection. I know the difference.",
              },
              {
                word: "Communicative",
                desc: "Short feedback loops. No black holes.",
              },
            ].map((v) => (
              <div
                key={v.word}
                style={{
                  ...cardStyle,
                  textAlign: "center",
                  padding: "18px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: 6,
                  }}
                >
                  {v.word}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {v.desc}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA — quiet, not desperate */}
          <div
            style={{
              ...cardStyle,
              background:
                "linear-gradient(135deg, var(--accent-dim), rgba(8,12,18,0.4))",
              border: "1px solid var(--accent-border)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              ...fade(350),
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--text)",
                  marginBottom: 4,
                }}
              >
                Ready to talk about your project?
              </div>
              <div style={{ fontSize: "0.84rem", color: "var(--muted)" }}>
                No obligation. A short call or message is enough to get started.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 50,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent-2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                }}
              >
                Let's talk
              </a>
              <a
                href="/#projects"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderRadius: 50,
                  border: "1.5px solid var(--glass-border-hover)",
                  color: "var(--muted)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--teal-border)";
                  e.currentTarget.style.color = "var(--teal)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--glass-border-hover)";
                  e.currentTarget.style.color = "var(--muted)";
                }}
              >
                See projects
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
