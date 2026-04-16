"use client";

/**
 * Skeleton — pulse placeholder for loading states.
 * Usage: <Skeleton width={200} height={20} />
 *        <Skeleton style={{ borderRadius: 50 }} />
 */
export function Skeleton({ width, height, style = {}, className = "" }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || "100%",
        height: height || 16,
        borderRadius: 6,
        background: "var(--glass-bg-mid)",
        ...style,
      }}
    />
  );
}

/**
 * PageSkeleton — full-page skeleton patterns for each section.
 */
export function LedgerSkeleton() {
  return (
    <div>
      <SkeletonHeader />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={72} style={{ borderRadius: 12 }} />
        ))}
      </div>
      <SkeletonList count={5} height={72} />
      <SkeletonStyles />
    </div>
  );
}

export function VaultSkeleton() {
  return (
    <div>
      <SkeletonHeader />
      {[1, 2].map((g) => (
        <div key={g} style={{ marginBottom: 24 }}>
          <Skeleton width={80} height={12} style={{ marginBottom: 10 }} />
          <SkeletonList count={2} height={64} />
        </div>
      ))}
      <SkeletonStyles />
    </div>
  );
}

export function TasksSkeleton() {
  return (
    <div>
      <SkeletonHeader />
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            width={70}
            height={32}
            style={{ borderRadius: 50 }}
          />
        ))}
      </div>
      <SkeletonList count={4} height={68} />
      <SkeletonStyles />
    </div>
  );
}

export function GrocerySkeleton() {
  return (
    <div>
      <SkeletonHeader />
      <div
        style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            width={70}
            height={28}
            style={{ borderRadius: 50 }}
          />
        ))}
      </div>
      <SkeletonList count={5} height={56} />
      <SkeletonStyles />
    </div>
  );
}

export function MembersSkeleton() {
  return (
    <div>
      <SkeletonHeader />
      <SkeletonList count={3} height={80} style={{ borderRadius: 14 }} />
      <SkeletonStyles />
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
        <Skeleton height={40} style={{ marginBottom: 6 }} />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={44} />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "flex", gap: 10 }}>
            <Skeleton
              width={32}
              height={32}
              style={{ borderRadius: "50%", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <Skeleton width={100} height={12} style={{ marginBottom: 6 }} />
              <Skeleton height={16} />
            </div>
          </div>
        ))}
      </div>
      <SkeletonStyles />
    </div>
  );
}

export function HouseOverviewSkeleton() {
  return (
    <div>
      <Skeleton width={200} height={28} style={{ marginBottom: 8 }} />
      <Skeleton width={160} height={14} style={{ marginBottom: 32 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height={90} style={{ borderRadius: 14 }} />
        ))}
      </div>
      <SkeletonStyles />
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div style={{ maxWidth: 560 }}>
      <Skeleton width={160} height={28} style={{ marginBottom: 8 }} />
      <Skeleton width={240} height={14} style={{ marginBottom: 28 }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <Skeleton width={80} height={11} style={{ marginBottom: 6 }} />
          <Skeleton height={40} />
        </div>
      ))}
      <SkeletonStyles />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SkeletonHeader() {
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
        <Skeleton width={120} height={24} style={{ marginBottom: 8 }} />
        <Skeleton width={180} height={13} />
      </div>
      <Skeleton width={110} height={36} style={{ borderRadius: 50 }} />
    </div>
  );
}

function SkeletonList({ count = 4, height = 64, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          height={height}
          style={{ borderRadius: 12, ...style }}
        />
      ))}
    </div>
  );
}

function SkeletonStyles() {
  return (
    <style>{`.skeleton{animation:pulse 1.5s ease-in-out infinite} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
  );
}
