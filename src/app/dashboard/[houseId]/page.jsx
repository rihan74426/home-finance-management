"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  CheckSquare,
  ShoppingCart,
  MessageSquare,
  Users,
  Zap,
} from "lucide-react";
import { HouseOverviewSkeleton } from "@/components/ui/Skeleton";

const QUICK_LINKS = [
  {
    href: "ledger",
    icon: BookOpen,
    label: "Ledger",
    desc: "Track rent & payments",
  },
  {
    href: "bills",
    icon: Zap,
    label: "Bills",
    desc: "Utilities & bill splitting",
  },
  {
    href: "vault",
    icon: ShieldCheck,
    label: "Vault",
    desc: "WiFi, codes, docs",
  },
  { href: "tasks", icon: CheckSquare, label: "Tasks", desc: "Chores & to-dos" },
  {
    href: "grocery",
    icon: ShoppingCart,
    label: "Grocery",
    desc: "Shared shopping list",
  },
  {
    href: "chat",
    icon: MessageSquare,
    label: "Chat",
    desc: "House conversations",
  },
  {
    href: "members",
    icon: Users,
    label: "Members",
    desc: "Manage your household",
  },
];

export default function HousePage() {
  const { houseId } = useParams();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/houses/${houseId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setHouse(j.data);
      })
      .finally(() => setLoading(false));
  }, [houseId]);

  if (loading) return <HouseOverviewSkeleton />;
  if (!house)
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        House not found.
      </div>
    );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}
        >
          {house.name}
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
          {house.address?.city ? `${house.address.city} · ` : ""}
          {house.currency} · Rent due day {house.rentDueDay}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        {QUICK_LINKS.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={`/dashboard/${houseId}/${href}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 14,
                padding: "20px",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--glass-border-hover)";
                e.currentTarget.style.background = "var(--glass-bg-mid)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--glass-border)";
                e.currentTarget.style.background = "var(--glass-bg)";
              }}
            >
              <Icon
                size={20}
                color="var(--accent)"
                style={{ marginBottom: 12 }}
              />
              <div
                style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}
              >
                {label}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                {desc}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
