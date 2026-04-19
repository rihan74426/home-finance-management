"use client";

import { useState, useEffect } from "react";
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
  ChevronRight,
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
    desc: "Add any household bill. Split equally or set custom amounts. Each split creates a ledger entry and notifies the member. Manager marks payments as received with one tap.",
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
    desc: "AES-256 encrypted storage for WiFi credentials, door codes, lease documents, emergency contacts, and appliance manuals. Manager controls who can see what.",
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
    desc: "Assign tasks to members, set due dates and priorities. Recurring tasks auto-regenerate. Overdue tasks send nudges. No public shaming — just quiet, effective accountability.",
    color: "#4ade80",
    demo: [
      {
        label: "Clean kitchen",
        member: "Rafiq",
        due: "Today",
        priority: "urgent",
        color: "#f87171",
      },
      {
        label: "Take out bins",
        member: "Tariq",
        due: "Monday",
        priority: "normal",
        color: "var(--teal)",
      },
      {
        label: "Pay internet bill",
        member: "Yasir",
        due: "15 May",
        priority: "low",
        color: "var(--muted)",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "House Chat",
    tagline: "Threads, polls, announcements — not a WhatsApp mess.",
    desc: "Channels for Rent, Maintenance, Groceries, and custom topics. Create quick polls. Manager posts announcements that must be acknowledged. Everything organized, nothing buried.",
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
    desc: "Schedule video calls (Zoom, Google Meet) or in-person meetings with location and address. All members RSVP. Meeting minutes posted after. Cancelled meetings notify everyone instantly.",
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
    desc: "Add individual numbered rules — not a freeform block of text. When a rule is broken, any member can file a report referencing the exact rule number. Manager gets notified and resolves it.",
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
    desc: "Any member can add items. Mark as bought. Categorized by dairy, vegetables, cleaning, and more. Recurring items auto-suggest every week. See who added and who bought what.",
    color: "#4ade80",
    demo: [
      { name: "Eggs", qty: "12", cat: "dairy", bought: false },
      { name: "Rice 5kg", qty: "1 bag", cat: "grains", bought: true },
      { name: "Dish soap", qty: "2", cat: "cleaning", bought: false },
    ],
  },
];

const MARKETS = [
  {
    flag: "🇧🇩",
    country: "Bangladesh",
    currency: "BDT 199/mo",
    note: "bKash & Nagad",
  },
  {
    flag: "🇵🇰",
    country: "Pakistan",
    currency: "PKR 800/mo",
    note: "JazzCash & EasyPaisa",
  },
  { flag: "🇮🇳", country: "India", currency: "INR 149/mo", note: "UPI" },
  {
    flag: "🌍",
    country: "Everywhere else",
    currency: "USD 4.99/mo",
    note: "Card & bank",
  },
];

function FeatureSlide({ feature, index }) {
  const Icon = feature.icon;
  return (
    <div
      style={{
        background: "var(--glass-bg)",
        border: "1px solid var(--glass-border)",
        borderRadius: 20,
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `${feature.color}18`,
            border: `1px solid ${feature.color}30`,
          }}
        >
          <Icon size={18} color={feature.color} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "1rem" }}>
            {feature.title}
          </div>
          <div
            style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 1 }}
          >
            {feature.tagline}
          </div>
        </div>
      </div>

      {/* Mini demo */}
      <div
        style={{
          background: "var(--bg-surface)",
          borderRadius: 12,
          padding: 14,
          minHeight: 90,
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
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {d.label}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {d.amount}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
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
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {d.split}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700 }}>
                    {d.amount}
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
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
                <span style={{ fontSize: "1.1rem" }}>{d.icon}</span>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    {d.label}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
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
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: "2px solid var(--glass-border-hover)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                    {d.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--muted)",
                      marginLeft: 6,
                    }}
                  >
                    → {d.member}
                  </span>
                </div>
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
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--accent-dim)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
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
                      fontSize: "0.68rem",
                      color: "var(--muted)",
                      marginBottom: 2,
                    }}
                  >
                    #{d.channel} · {d.from}
                  </div>
                  <div style={{ fontSize: "0.78rem" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
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
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: "var(--accent-dim)",
                    border: "1px solid var(--accent-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.75rem",
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
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
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
                    width: 18,
                    height: 18,
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
                        fontSize: "0.55rem",
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
                    textDecoration: d.bought ? "line-through" : "none",
                    color: d.bought ? "var(--muted)" : "var(--text)",
                  }}
                >
                  {d.name}
                </span>
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--muted)",
                    marginLeft: "auto",
                  }}
                >
                  {d.qty}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <p
        style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.65 }}
      >
        {feature.desc}
      </p>
    </div>
  );
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        color: "var(--text)",
      }}
    >
      {/* Background blobs */}
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
            padding: "20px 40px",
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
              width={28}
              height={28}
              style={{ borderRadius: 7, objectFit: "cover" }}
            />
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.15rem",
                letterSpacing: "-0.03em",
              }}
            >
              Homy
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                          padding: "8px 20px",
                          borderRadius: 50,
                          border: "1px solid var(--glass-border-hover)",
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
                          boxShadow: "0 4px 16px rgba(232,98,26,0.3)",
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

        {/* ── Hero ── */}
        <section
          style={{
            padding: "80px 40px 60px",
            maxWidth: 960,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: 50,
              border: "1px solid var(--teal-border)",
              background: "var(--teal-dim)",
              fontSize: "0.78rem",
              color: "var(--teal)",
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            <Star size={12} /> Built for Bangladesh, Pakistan & beyond · Free to
            start
          </div>

          <h1
            style={{
              fontSize: "clamp(2.8rem, 7vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              marginBottom: 24,
            }}
          >
            Your home,
            <br />
            <span style={{ color: "var(--accent)", WebkitTextStroke: "0px" }}>
              finally organized.
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--muted)",
              maxWidth: 580,
              margin: "0 auto 36px",
              lineHeight: 1.75,
            }}
          >
            One app for rent, bills, tasks, grocery, chat, meetings, and house
            rules. Built for flatmates, tenants, and families who share a home.
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
                  padding: "14px 32px",
                  borderRadius: 50,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1rem",
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
                padding: "14px 28px",
                borderRadius: 50,
                border: "1px solid var(--glass-border-hover)",
                color: "var(--muted)",
                fontWeight: 600,
                fontSize: "0.9rem",
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

          {/* Social proof */}
          <p
            style={{
              marginTop: 32,
              fontSize: "0.82rem",
              color: "var(--faint)",
            }}
          >
            Free for 1 house · Up to 6 members · No credit card required
          </p>
        </section>

        {/* ── Problem strip ── */}
        <section
          style={{ padding: "0 40px 60px", maxWidth: 960, margin: "0 auto" }}
        >
          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 16,
              padding: "24px 28px",
            }}
          >
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--muted)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 16,
              }}
            >
              Sound familiar?
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
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

        {/* ── Features grid ── */}
        <section
          id="features"
          style={{
            padding: "20px 40px 80px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p
              style={{
                fontSize: "0.78rem",
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
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
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
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {FEATURES.map((f, i) => (
              <FeatureSlide key={i} feature={f} index={i} />
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section
          style={{ padding: "20px 40px 80px", maxWidth: 900, margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2
              style={{
                fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                marginBottom: 8,
              }}
            >
              Priced for where you live
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              Free tier that's genuinely useful. Pro when you need more.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {MARKETS.map((m, i) => (
              <div
                key={i}
                style={{
                  background: "var(--glass-bg)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>
                  {m.flag}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    marginBottom: 3,
                  }}
                >
                  {m.country}
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--accent)",
                    fontWeight: 700,
                  }}
                >
                  {m.currency}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                    marginTop: 3,
                  }}
                >
                  {m.note}
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: 14,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>
                  Free — always
                </div>
                {[
                  "1 house",
                  "Up to 6 members",
                  "Rent tracking",
                  "Tasks & grocery",
                  "1 chat channel",
                  "Vault (5 items)",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 5,
                    }}
                  >
                    <span style={{ color: "#4ade80", fontSize: "0.8rem" }}>
                      ✓
                    </span>
                    <span
                      style={{ fontSize: "0.82rem", color: "var(--muted)" }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>
                  Pro — everything
                </div>
                {[
                  "Unlimited members",
                  "All chat threads",
                  "Bill splitting",
                  "PDF exports",
                  "Unlimited vault",
                  "Meetings + rules",
                  "SMS reminders",
                  "Priority support",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      marginBottom: 5,
                    }}
                  >
                    <span
                      style={{ color: "var(--accent)", fontSize: "0.8rem" }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: "0.82rem" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "20px 40px 100px", textAlign: "center" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
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
              Homy is. Set up in 2 minutes. Free forever for small houses.
            </p>
            <SignUpButton mode="modal">
              <button
                style={{
                  padding: "16px 40px",
                  borderRadius: 50,
                  background: "var(--accent)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "1.05rem",
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
            padding: "24px 40px",
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
              width={20}
              height={20}
              style={{ borderRadius: 4, objectFit: "cover" }}
            />
            <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Homy</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--faint)" }}>
            © 2025 Homy · Built for Bangladesh & beyond
          </p>
          <p style={{ fontSize: "0.78rem", color: "var(--faint)" }}>
            No ads. No data selling. Always.
          </p>
        </footer>
      </div>
    </main>
  );
}
