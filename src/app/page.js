"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import {
  BookOpen,
  ShieldCheck,
  CheckSquare,
  ShoppingCart,
  MessageSquare,
  Zap,
  Users,
  Video,
  BookMarked,
  ArrowRight,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Rent Ledger",
    tagline: "No more awkward reminders.",
    desc: "Log every payment — cash, bKash, UPI, bank transfer. Partial payments, private manager notes, PDF exports for legal records. Every member sees their own history. The manager sees everything.",
    color: "#fbbf24",
    demo: [
      {
        label: "April Rent",
        member: "Rafiq",
        amount: "৳8,000",
        status: "paid",
        color: "#4ade80",
      },
      {
        label: "April Rent",
        member: "Tariq",
        amount: "৳8,000",
        status: "partial",
        color: "#fbbf24",
      },
      {
        label: "April Rent",
        member: "Yasir",
        amount: "৳6,500",
        status: "overdue",
        color: "#f87171",
      },
    ],
  },
  {
    icon: Zap,
    title: "Bill Splitting",
    tagline: "Electricity, water, internet — split instantly.",
    desc: "Add any household bill. Split equally or set custom amounts. Each split creates a ledger entry and notifies the member.",
    color: "#38bdf8",
    demo: [
      {
        label: "Electricity — April",
        amount: "৳2,400",
        split: "3 members",
        status: "split",
        color: "#4ade80",
      },
      {
        label: "Internet — April",
        amount: "৳1,200",
        split: "3 members",
        status: "pending",
        color: "#fbbf24",
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "The Vault",
    tagline: "WiFi password? Door code? All in one place.",
    desc: "AES-256 encrypted storage for WiFi credentials, door codes, lease documents, emergency contacts, and appliance manuals.",
    color: "#a78bfa",
    demo: [
      { icon: "📶", label: "Home WiFi", sub: "Tap to reveal password" },
      { icon: "🔑", label: "Front door code", sub: "Manager only" },
      { icon: "📄", label: "Lease agreement", sub: "Expires Dec 2025" },
    ],
  },
  {
    icon: CheckSquare,
    title: "Task Board",
    tagline: "Who forgot to clean the kitchen? Not anymore.",
    desc: "Assign tasks to members, set due dates and priorities. Recurring tasks auto-regenerate. Overdue tasks send nudges.",
    color: "#4ade80",
    demo: [
      {
        label: "Clean kitchen",
        member: "Rafiq",
        due: "Today",
        color: "#f87171",
      },
      {
        label: "Take out bins",
        member: "Tariq",
        due: "Monday",
        color: "var(--teal)",
      },
      {
        label: "Pay internet bill",
        member: "Yasir",
        due: "15 May",
        color: "var(--muted)",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "House Chat",
    tagline: "Threads, polls, announcements — not a WhatsApp mess.",
    desc: "Channels for Rent, Maintenance, Groceries, and custom topics. Create quick polls. Manager posts announcements that must be acknowledged.",
    color: "#f472b6",
    demo: [
      {
        channel: "general",
        msg: "Plumber coming Tuesday 10am–12pm",
        from: "Manager",
      },
      {
        channel: "rent",
        msg: "Poll: Should we change rent due date to the 5th?",
        from: "Rafiq",
        isPoll: true,
      },
    ],
  },
  {
    icon: Video,
    title: "Meetings",
    tagline: "Online or in-person — with a Zoom link or a map.",
    desc: "Schedule video calls or in-person meetings. All members RSVP. Meeting minutes posted after.",
    color: "#2dd4bf",
    demo: [
      {
        type: "online",
        title: "Monthly House Meeting",
        date: "May 10, 7:00 PM",
        platform: "Zoom",
        rsvp: "3 attending",
      },
    ],
  },
  {
    icon: BookMarked,
    title: "House Rules",
    tagline: "Numbered. Clear. Enforceable.",
    desc: "Add individual numbered rules. When a rule is broken, any member can file a report. Manager gets notified and resolves it.",
    color: "#fb923c",
    demo: [
      { num: 1, text: "No guests after 11pm", cat: "Quiet Hours" },
      { num: 2, text: "Kitchen clean by midnight", cat: "Cleanliness" },
      { num: 3, text: "Rent due by the 1st", cat: "Payments" },
    ],
  },
  {
    icon: ShoppingCart,
    title: "Grocery List",
    tagline: "Shared in real-time. Categories. One-tap bought.",
    desc: "Any member can add items. Mark as bought. Categorized by dairy, vegetables, cleaning, and more.",
    color: "#4ade80",
    demo: [
      { name: "Eggs", qty: "12", bought: false },
      { name: "Rice 5kg", qty: "1 bag", bought: true },
      { name: "Dish soap", qty: "2", bought: false },
    ],
  },
];

function FeatureCard({ feature }) {
  const Icon = feature.icon;
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 20,
        padding: "24px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${feature.color}18`,
            border: `1px solid ${feature.color}30`,
            flexShrink: 0,
          }}
        >
          <Icon size={17} color={feature.color} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
            {feature.title}
          </div>
          <div
            style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 1 }}
          >
            {feature.tagline}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: 12,
          padding: 14,
          minHeight: 80,
        }}
      >
        {feature.title === "Rent Ledger" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    {d.member}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                    {d.label}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 50,
                    color: d.color,
                    background: `${d.color}18`,
                    border: `1px solid ${d.color}30`,
                  }}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
        {feature.title === "Bill Splitting" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                    {d.split}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 50,
                    color: d.color,
                    background: `${d.color}18`,
                  }}
                >
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        )}
        {feature.title === "The Vault" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ fontSize: "1rem" }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                    {d.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {feature.title === "Task Board" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 4,
                    border: "2px solid var(--glass-border-hover)",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: "0.78rem", fontWeight: 600, flex: 1 }}>
                  {d.label}
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    color: d.color,
                    fontWeight: 600,
                  }}
                >
                  {d.due}
                </span>
              </div>
            ))}
          </div>
        )}
        {feature.title === "House Chat" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {feature.demo.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  {d.from[0]}
                </div>
                <div
                  style={{
                    background: "var(--glass-bg)",
                    borderRadius: 8,
                    padding: "6px 10px",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: "var(--muted)",
                      marginBottom: 2,
                    }}
                  >
                    #{d.channel} · {d.from}
                  </div>
                  <div style={{ fontSize: "0.75rem" }}>
                    {d.isPoll ? "📊 " : ""}
                    {d.msg}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {feature.title === "Meetings" && (
          <div>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: 5 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--teal)",
                      background: "rgba(45,212,191,0.1)",
                      padding: "2px 8px",
                      borderRadius: 50,
                      border: "1px solid rgba(45,212,191,0.2)",
                      fontWeight: 600,
                    }}
                  >
                    Online · {d.platform}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "#4ade80",
                      fontWeight: 600,
                    }}
                  >
                    {d.rsvp}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                  {d.title}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {d.date}
                </div>
              </div>
            ))}
          </div>
        )}
        {feature.title === "House Rules" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    color: "var(--accent)",
                    flexShrink: 0,
                  }}
                >
                  {d.num}
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    {d.text}
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
                    {d.cat}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {feature.title === "Grocery List" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {feature.demo.map((d, i) => (
              <div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 17,
                    height: 17,
                    borderRadius: 5,
                    border: `2px solid ${d.bought ? "#4ade80" : "var(--glass-border-hover)"}`,
                    background: d.bought
                      ? "rgba(74,222,128,0.15)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {d.bought && (
                    <span
                      style={{
                        fontSize: "0.5rem",
                        color: "#4ade80",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    flex: 1,
                    textDecoration: d.bought ? "line-through" : "none",
                    color: d.bought ? "var(--muted)" : "var(--text)",
                  }}
                >
                  {d.name}
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                  {d.qty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <p
        style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.65 }}
      >
        {feature.desc}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text)",
      }}
    >
      <div className="global-bg">
        <div className="bg-base" />
        <div className="bg-bloom" />
        <div className="bg-bloom-cool" />
        <div className="bg-noise" />
      </div>

      <div className="site-content">
        {/* ── Nav ── */}
        <nav
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "clamp(14px, 3vw, 20px) clamp(16px, 5vw, 40px)",
            borderBottom: "1px solid var(--glass-border)",
            backdropFilter: "blur(16px)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "rgba(8,12,18,0.85)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image
              src="/favicon.png"
              alt="Homy"
              width={26}
              height={26}
              style={{ borderRadius: 6, objectFit: "cover" }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: "clamp(1rem, 3vw, 1.15rem)",
                letterSpacing: "-0.03em",
              }}
            >
              Homy
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLoaded &&
              (isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    style={{
                      padding: "8px clamp(14px, 3vw, 20px)",
                      borderRadius: 50,
                      background: "var(--accent)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "clamp(0.8rem, 2.5vw, 0.875rem)",
                      textDecoration: "none",
                      boxShadow: "0 4px 16px rgba(232,98,26,0.3)",
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
                        padding: "8px clamp(12px, 2.5vw, 20px)",
                        borderRadius: 50,
                        border: "1px solid var(--glass-border-hover)",
                        background: "transparent",
                        color: "var(--muted)",
                        fontWeight: 600,
                        fontSize: "clamp(0.78rem, 2vw, 0.875rem)",
                        cursor: "pointer",
                      }}
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      style={{
                        padding: "8px clamp(14px, 3vw, 20px)",
                        borderRadius: 50,
                        background: "var(--accent)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "clamp(0.78rem, 2vw, 0.875rem)",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 16px rgba(232,98,26,0.3)",
                      }}
                    >
                      Get started free
                    </button>
                  </SignUpButton>
                </>
              ))}
          </div>
        </nav>

        {/* ── Hero ── */}
        <section
          style={{
            padding:
              "clamp(48px, 8vw, 80px) clamp(16px, 5vw, 40px) clamp(40px, 6vw, 60px)",
            maxWidth: 960,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 50,
              border: "1px solid var(--teal-border)",
              background: "var(--teal-dim)",
              fontSize: "clamp(0.72rem, 2vw, 0.78rem)",
              color: "var(--teal)",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <Star size={11} /> Built for Bangladesh, Pakistan & beyond · Always
            free
          </div>

          <h1
            style={{
              fontSize: "clamp(2.4rem, 9vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: 24,
            }}
          >
            Your home,
            <br />
            <span style={{ color: "var(--accent)" }}>finally organized.</span>
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 2.5vw, 1.1rem)",
              color: "var(--muted)",
              maxWidth: 560,
              margin: "0 auto 36px",
              lineHeight: 1.75,
            }}
          >
            One app for rent, bills, tasks, grocery, chat, meetings, and house
            rules. Built for flatmates, tenants, and families. Completely free.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <SignUpButton mode="modal">
              <button
                style={{
                  padding: "clamp(12px, 3vw, 14px) clamp(24px, 5vw, 32px)",
                  borderRadius: 50,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 32px rgba(232,98,26,0.35)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                Create your house free <ArrowRight size={16} />
              </button>
            </SignUpButton>
            <a
              href="#features"
              style={{
                padding: "clamp(12px, 3vw, 14px) clamp(20px, 4vw, 28px)",
                borderRadius: 50,
                border: "1px solid var(--glass-border-hover)",
                color: "var(--muted)",
                fontWeight: 600,
                fontSize: "clamp(0.85rem, 2vw, 0.9rem)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--glass-bg)",
              }}
            >
              See features
            </a>
          </div>

          <p
            style={{ marginTop: 28, fontSize: "0.8rem", color: "var(--faint)" }}
          >
            Free forever · No credit card required · No ads
          </p>
        </section>

        {/* ── Problem strip ── */}
        <section
          style={{
            padding: "0 clamp(16px, 5vw, 40px) 60px",
            maxWidth: 960,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "clamp(18px, 4vw, 24px) clamp(18px, 4vw, 28px)",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 14,
              }}
            >
              Sound familiar?
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
                gap: 10,
              }}
            >
              {[
                '"My flatmate keeps forgetting rent."',
                '"The WiFi password is on a sticky note somewhere."',
                '"Our WhatsApp has 4,000 messages. Nobody finds anything."',
                '"I hate being the one who asks about electricity bills."',
              ].map((q, i) => (
                <div
                  key={i}
                  style={{
                    background: "var(--bg-surface)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--muted)",
                      fontStyle: "italic",
                      lineHeight: 1.55,
                    }}
                  >
                    {q}
                  </p>
                </div>
              ))}
            </div>
            <p
              style={{
                marginTop: 16,
                fontSize: "0.82rem",
                color: "var(--text)",
                fontWeight: 600,
              }}
            >
              Homy fixes all of this — quietly, in the background, so you can
              just live.
            </p>
          </div>
        </section>

        {/* ── Features ── */}
        <section
          id="features"
          style={{
            padding: "20px clamp(16px, 5vw, 40px) 80px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--accent)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 10,
              }}
            >
              Everything your house needs
            </p>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
              }}
            >
              One app. Eight features.
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} feature={f} />
            ))}
          </div>
        </section>

        {/* ── What's included ── */}
        <section
          style={{
            padding: "20px clamp(16px, 5vw, 40px) 80px",
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 10,
              }}
            >
              Everything is free
            </h2>
            <p
              style={{
                color: "var(--muted)",
                fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)",
                lineHeight: 1.7,
              }}
            >
              We're growing our community. Every feature is available at no cost
              while we build.
            </p>
          </div>
          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 18,
              padding: "clamp(20px, 4vw, 28px) clamp(20px, 4vw, 32px)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
                gap: "8px 20px",
              }}
            >
              {[
                "Unlimited houses",
                "Unlimited members",
                "Rent tracking & ledger",
                "Bill splitting",
                "Encrypted vault",
                "Task board",
                "Grocery list",
                "House chat & polls",
                "Meetings & scheduling",
                "House rules & alerts",
                "Move-out checklist",
                "PDF exports",
                "Manager notes",
                "Member documents",
                "Notifications",
              ].map((f) => (
                <div
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "5px 0",
                  }}
                >
                  <span
                    style={{
                      color: "#4ade80",
                      fontSize: "0.85rem",
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(0.8rem, 2vw, 0.875rem)",
                      color: "var(--text)",
                    }}
                  >
                    {f}
                  </span>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 22,
                paddingTop: 18,
                borderTop: "1px solid var(--glass-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                No credit card. No ads. No data selling.
              </p>
              <SignUpButton mode="modal">
                <button
                  style={{
                    padding: "10px 22px",
                    borderRadius: 50,
                    background: "var(--accent)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(232,98,26,0.28)",
                  }}
                >
                  Get started free →
                </button>
              </SignUpButton>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          style={{
            padding: "20px clamp(16px, 5vw, 40px) 100px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 5vw, 2.6rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 16,
              }}
            >
              Your house group chat is not a household management system.
            </h2>
            <p
              style={{
                color: "var(--muted)",
                marginBottom: 28,
                lineHeight: 1.7,
              }}
            >
              Homy is. Set up in 2 minutes. Free forever.
            </p>
            <SignUpButton mode="modal">
              <button
                style={{
                  padding: "clamp(13px, 3vw, 16px) clamp(28px, 6vw, 40px)",
                  borderRadius: 50,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "clamp(0.95rem, 2.5vw, 1.05rem)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 8px 40px rgba(232,98,26,0.4)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                }}
              >
                Create your house free <ArrowRight size={18} />
              </button>
            </SignUpButton>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: "1px solid var(--glass-border)",
            padding: "clamp(18px, 4vw, 24px) clamp(16px, 5vw, 40px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Image
              src="/favicon.png"
              alt="Homy"
              width={18}
              height={18}
              style={{ borderRadius: 4, objectFit: "cover" }}
            />
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Homy</span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--faint)" }}>
            © 2025 Homy · Built for Bangladesh & beyond
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--faint)" }}>
            No ads. No data selling. Always.
          </p>
        </footer>
      </div>
    </main>
  );
}
