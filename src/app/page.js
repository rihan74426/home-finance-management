"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 32px",
          borderBottom: "1px solid var(--glass-border)",
        }}
      >
        {/* favicon.png — logo mark only, small */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image
            src="/favicon.png"
            alt="Homy logo"
            width={28}
            height={28}
            style={{ borderRadius: 6, objectFit: "cover" }}
          />
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
              color: "var(--text)",
            }}
          >
            Homy
          </span>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isLoaded && (
            <>
              {isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    style={{
                      padding: "8px 20px",
                      borderRadius: 50,
                      background: "var(--accent)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    Dashboard
                  </Link>
                  <UserButton afterSignOutUrl="/" />
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button
                      style={{
                        padding: "8px 20px",
                        borderRadius: 50,
                        border: "1.5px solid var(--glass-border-hover)",
                        background: "transparent",
                        color: "var(--muted)",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                      }}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      style={{
                        padding: "8px 20px",
                        borderRadius: 50,
                        background: "var(--accent)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Get started free
                    </button>
                  </SignUpButton>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
          gap: 24,
        }}
      >
        {/* pageIcon.png — full branded logo in hero */}
        <Image
          src="/pageIcon.png"
          alt="Homy"
          width={72}
          height={72}
          style={{ borderRadius: 16, objectFit: "cover", marginBottom: 8 }}
        />

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px",
            borderRadius: 50,
            border: "1px solid var(--teal-border)",
            background: "var(--teal-dim)",
            fontSize: "0.8rem",
            color: "var(--teal)",
            fontWeight: 600,
          }}
        >
          Now in beta — BD &amp; PK first
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 800,
          }}
        >
          Your home,{" "}
          <span style={{ color: "var(--accent)" }}>finally organized.</span>
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--muted)",
            maxWidth: 560,
            lineHeight: 1.75,
          }}
        >
          Rent tracking, bill splitting, shared tasks, grocery lists, household
          chat — one app for everyone who shares a home.
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 8,
          }}
        >
          <SignUpButton mode="modal">
            <button
              style={{
                padding: "14px 32px",
                borderRadius: 50,
                background: "var(--accent)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 8px 32px rgba(232,98,26,0.3)",
              }}
            >
              Create your house →
            </button>
          </SignUpButton>
        </div>

        {/* Feature grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            maxWidth: 900,
            width: "100%",
            marginTop: 64,
          }}
        >
          {[
            {
              title: "Rent Ledger",
              desc: "Track payments. PDF exports. No more awkward reminders.",
            },
            {
              title: "The Vault",
              desc: "WiFi passwords, door codes, lease docs — all in one place.",
            },
            {
              title: "Task Board",
              desc: "Assign chores, set due dates, never argue about cleaning again.",
            },
            {
              title: "Grocery List",
              desc: "Shared, real-time. Any member can add or mark bought.",
            },
            {
              title: "House Chat",
              desc: "Threaded conversations, polls, and manager announcements.",
            },
            {
              title: "Bill Splitting",
              desc: "Electricity, water, internet — split fairly among members.",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "left",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginBottom: 6,
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          borderTop: "1px solid var(--glass-border)",
          fontSize: "0.8rem",
          color: "var(--faint)",
        }}
      >
        © 2025 Homy · Built for Bangladesh &amp; beyond
      </footer>
    </main>
  );
}
