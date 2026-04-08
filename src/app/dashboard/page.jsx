"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Home, Users, ChevronRight } from "lucide-react";
import { HOUSE_TYPE } from "@/lib/constants";

const HOUSE_TYPE_LABELS = {
  [HOUSE_TYPE.FLAT]: "Flat",
  [HOUSE_TYPE.VILLA]: "Villa",
  [HOUSE_TYPE.FAMILY]: "Family Home",
  [HOUSE_TYPE.CO_LIVING]: "Co-Living",
  [HOUSE_TYPE.DORMITORY]: "Dormitory",
  [HOUSE_TYPE.OTHER]: "House",
};

const HOUSE_TYPE_EMOJI = {
  [HOUSE_TYPE.FLAT]: "🏢",
  [HOUSE_TYPE.VILLA]: "🏡",
  [HOUSE_TYPE.FAMILY]: "🏠",
  [HOUSE_TYPE.CO_LIVING]: "🏘️",
  [HOUSE_TYPE.DORMITORY]: "🏫",
  [HOUSE_TYPE.OTHER]: "🏠",
};

export default function DashboardPage() {
  const router = useRouter();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHouses() {
      try {
        const res = await fetch("/api/houses");
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        setHouses(json.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHouses();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
        Loading your houses…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: "16px 20px",
          color: "#f87171",
          fontSize: "0.875rem",
        }}
      >
        Failed to load houses: {error}
      </div>
    );
  }

  // No houses — prompt creation
  if (houses.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          gap: 20,
        }}
      >
        <div style={{ fontSize: "3.5rem" }}>🏠</div>
        <div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            You don't have a house yet
          </h1>
          <p
            style={{ color: "var(--muted)", fontSize: "0.9rem", maxWidth: 380 }}
          >
            Create your house to start tracking rent, sharing tasks, and
            organizing everything in one place.
          </p>
        </div>
        <Link
          href="/dashboard/create-house"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 28px",
            borderRadius: 50,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.9rem",
            textDecoration: "none",
            boxShadow: "0 8px 24px rgba(232,98,26,0.28)",
          }}
        >
          <Plus size={16} />
          Create your house
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Your Houses
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {houses.length} house{houses.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/create-house"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "9px 18px",
            borderRadius: 50,
            background: "var(--accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "0.825rem",
            textDecoration: "none",
          }}
        >
          <Plus size={14} />
          New house
        </Link>
      </div>

      {/* House cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {houses.map((house) => (
          <Link
            key={house._id}
            href={`/dashboard/${house._id}`}
            style={{ textDecoration: "none" }}
          >
            <div
              style={{
                background: "var(--glass-bg)",
                border: "1px solid var(--glass-border)",
                borderRadius: 16,
                padding: "20px",
                cursor: "pointer",
                transition: "all 0.2s ease",
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
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ fontSize: "1.8rem" }}>
                  {HOUSE_TYPE_EMOJI[house.type] ?? "🏠"}
                </div>
                <ChevronRight size={16} color="var(--muted)" />
              </div>

              <div
                style={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: 4,
                  color: "var(--text)",
                }}
              >
                {house.name}
              </div>

              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  marginBottom: 14,
                }}
              >
                {HOUSE_TYPE_LABELS[house.type] ?? "House"}
                {house.address?.city ? ` · ${house.address.city}` : ""}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontSize: "0.72rem",
                    padding: "3px 10px",
                    borderRadius: 50,
                    background:
                      house.role === "manager"
                        ? "rgba(232,98,26,0.12)"
                        : "var(--glass-bg-mid)",
                    color:
                      house.role === "manager"
                        ? "var(--accent)"
                        : "var(--muted)",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    border:
                      house.role === "manager"
                        ? "1px solid var(--accent-border)"
                        : "1px solid var(--glass-border)",
                  }}
                >
                  {house.role}
                </span>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--muted)",
                  }}
                >
                  {house.currency}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
