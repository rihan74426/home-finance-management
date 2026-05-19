"use client";

// ── Base pulse skeleton block ─────────────────────────────────────────────────
export function Skeleton({ width, height, style = {}, rounded = false }) {
  return (
    <div
      className="sk"
      style={{
        width: width || "100%",
        height: height || 16,
        borderRadius: rounded ? 50 : 6,
        background: "var(--glass-bg-mid)",
        ...style,
      }}
    />
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function SkRow({ count = 4, height = 64, gap = 8, radius = 12 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="sk"
          style={{
            height,
            borderRadius: radius,
            background: "var(--glass-bg-mid)",
          }}
        />
      ))}
    </div>
  );
}

function SkHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
      }}
    >
      <div>
        <div
          className="sk"
          style={{
            width: 140,
            height: 26,
            borderRadius: 6,
            marginBottom: 8,
            background: "var(--glass-bg-mid)",
          }}
        />
        <div
          className="sk"
          style={{
            width: 100,
            height: 13,
            borderRadius: 6,
            background: "var(--glass-bg-mid)",
          }}
        />
      </div>
      <div
        className="sk"
        style={{
          width: 110,
          height: 36,
          borderRadius: 50,
          background: "var(--glass-bg-mid)",
        }}
      />
    </div>
  );
}

function SkStyles() {
  return (
    <style>{`.sk{animation:pulse 1.5s ease-in-out infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
  );
}

// ── Page skeletons ────────────────────────────────────────────────────────────

export function LedgerSkeleton() {
  return (
    <div>
      <SkHeader />
      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 72,
              borderRadius: 12,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkRow count={5} height={76} />
      <SkStyles />
    </div>
  );
}

export function BillsSkeleton() {
  return (
    <div>
      <SkHeader />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
          marginBottom: 22,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 72,
              borderRadius: 12,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkRow count={4} height={72} />
      <SkStyles />
    </div>
  );
}

export function VaultSkeleton() {
  return (
    <div>
      <SkHeader />
      {[1, 2].map((g) => (
        <div key={g} style={{ marginBottom: 28 }}>
          <div
            className="sk"
            style={{
              width: 80,
              height: 12,
              borderRadius: 6,
              marginBottom: 10,
              background: "var(--glass-bg-mid)",
            }}
          />
          <SkRow count={2} height={64} gap={7} />
        </div>
      ))}
      <SkStyles />
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div>
      <SkHeader />
      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              width: 70,
              height: 32,
              borderRadius: 50,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkRow count={5} height={68} gap={7} />
      <SkStyles />
    </div>
  );
}

export function GrocerySkeleton() {
  return (
    <div style={{ maxWidth: 640 }}>
      <SkHeader />
      {/* Category pills */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 18,
          overflow: "hidden",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              width: 72,
              height: 28,
              borderRadius: 50,
              flexShrink: 0,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkRow count={6} height={56} gap={5} radius={11} />
      <SkStyles />
    </div>
  );
}

export function MembersSkeleton() {
  return (
    <div>
      <SkHeader />
      <SkRow count={4} height={80} gap={10} radius={14} />
      <SkStyles />
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 84px)",
        border: "1px solid var(--glass-border)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 210,
          borderRight: "1px solid var(--glass-border)",
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          className="sk"
          style={{
            height: 40,
            borderRadius: 8,
            marginBottom: 6,
            background: "var(--glass-bg-mid)",
          }}
        />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 44,
              borderRadius: 8,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      {/* Messages */}
      <div
        style={{
          flex: 1,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <div
              className="sk"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                flexShrink: 0,
                background: "var(--glass-bg-mid)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                className="sk"
                style={{
                  width: 100,
                  height: 12,
                  borderRadius: 4,
                  marginBottom: 6,
                  background: "var(--glass-bg-mid)",
                }}
              />
              <div
                className="sk"
                style={{
                  height: 16,
                  borderRadius: 4,
                  background: "var(--glass-bg-mid)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <SkStyles />
    </div>
  );
}

export function PollsSkeleton() {
  return (
    <div>
      <SkHeader />
      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              width: 60,
              height: 32,
              borderRadius: 50,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="sk"
          style={{
            height: 180,
            borderRadius: 16,
            marginBottom: 12,
            background: "var(--glass-bg-mid)",
          }}
        />
      ))}
      <SkStyles />
    </div>
  );
}

export function RulesSkeleton() {
  return (
    <div>
      <SkHeader />
      <SkRow count={4} height={70} gap={8} radius={12} />
      <SkStyles />
    </div>
  );
}

export function NotesSkeleton() {
  return (
    <div>
      <SkHeader />
      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              width: 70,
              height: 32,
              borderRadius: 50,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkRow count={3} height={110} gap={8} radius={13} />
      <SkStyles />
    </div>
  );
}

export function MeetingsSkeleton() {
  return (
    <div>
      <SkHeader />
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="sk"
          style={{
            height: 140,
            borderRadius: 14,
            marginBottom: 10,
            background: "var(--glass-bg-mid)",
          }}
        />
      ))}
      <SkStyles />
    </div>
  );
}

export function MoveOutSkeleton() {
  return (
    <div>
      <SkHeader />
      <div
        className="sk"
        style={{
          height: 300,
          borderRadius: 14,
          background: "var(--glass-bg-mid)",
        }}
      />
      <SkStyles />
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ marginBottom: 28 }}>
        <div
          className="sk"
          style={{
            width: 160,
            height: 28,
            borderRadius: 6,
            marginBottom: 8,
            background: "var(--glass-bg-mid)",
          }}
        />
        <div
          className="sk"
          style={{
            width: 100,
            height: 14,
            borderRadius: 6,
            background: "var(--glass-bg-mid)",
          }}
        />
      </div>
      {/* Section nav pills */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 24,
          overflow: "hidden",
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              width: 110,
              height: 34,
              borderRadius: 50,
              flexShrink: 0,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      {[1, 2].map((i) => (
        <div
          key={i}
          className="sk"
          style={{
            height: 180,
            borderRadius: 16,
            marginBottom: 16,
            background: "var(--glass-bg-mid)",
          }}
        />
      ))}
      <SkStyles />
    </div>
  );
}

export function HouseOverviewSkeleton() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="sk"
          style={{
            width: 220,
            height: 28,
            borderRadius: 6,
            marginBottom: 8,
            background: "var(--glass-bg-mid)",
          }}
        />
        <div
          className="sk"
          style={{
            width: 160,
            height: 14,
            borderRadius: 6,
            background: "var(--glass-bg-mid)",
          }}
        />
      </div>
      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 72,
              borderRadius: 12,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
          gap: 14,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 180,
              borderRadius: 16,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkStyles />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div style={{ maxWidth: 900 }}>
      {/* Profile header card */}
      <div
        className="sk"
        style={{
          height: 140,
          borderRadius: 20,
          marginBottom: 24,
          background: "var(--glass-bg-mid)",
        }}
      />
      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 88,
              borderRadius: 14,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              width: 90,
              height: 32,
              borderRadius: 50,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkRow count={4} height={64} gap={6} radius={12} />
      <SkStyles />
    </div>
  );
}

export function DashboardHousesSkeleton() {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            className="sk"
            style={{
              width: 120,
              height: 26,
              borderRadius: 6,
              marginBottom: 8,
              background: "var(--glass-bg-mid)",
            }}
          />
          <div
            className="sk"
            style={{
              width: 60,
              height: 13,
              borderRadius: 6,
              background: "var(--glass-bg-mid)",
            }}
          />
        </div>
        <div
          className="sk"
          style={{
            width: 110,
            height: 36,
            borderRadius: 50,
            background: "var(--glass-bg-mid)",
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 16,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="sk"
            style={{
              height: 140,
              borderRadius: 16,
              background: "var(--glass-bg-mid)",
            }}
          />
        ))}
      </div>
      <SkStyles />
    </div>
  );
}

export function MoveoutSkeleton() {
  return (
    <div>
      <SkHeader />
      <div
        className="sk"
        style={{
          height: 320,
          borderRadius: 14,
          background: "var(--glass-bg-mid)",
        }}
      />
      <SkStyles />
    </div>
  );
}
