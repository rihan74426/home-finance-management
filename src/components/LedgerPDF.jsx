import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

const STATUS_COLORS = {
  paid: "#16a34a",
  partial: "#d97706",
  pending: "#6b7280",
  overdue: "#dc2626",
};

function fmtAmount(amount, currency) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "BDT",
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return String(amount / 100);
  }
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: "36 48 48 48",
    color: "#111827",
    backgroundColor: "#ffffff",
  },
  header: { marginBottom: 28 },
  appName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#e8621a",
    marginBottom: 4,
  },
  houseName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  houseSub: { fontSize: 9, color: "#6b7280" },
  divider: { borderBottom: "1 solid #e5e7eb", marginVertical: 14 },
  memberBox: {
    backgroundColor: "#f9fafb",
    border: "1 solid #e5e7eb",
    borderRadius: 4,
    padding: "10 14",
    marginBottom: 18,
  },
  memberName: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  memberMeta: { fontSize: 8.5, color: "#6b7280" },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: "8 10",
  },
  statLabel: {
    fontSize: 7.5,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  statValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: "6 10",
    borderRadius: 2,
  },
  tableRow: {
    flexDirection: "row",
    padding: "7 10",
    borderBottom: "1 solid #f3f4f6",
  },
  colPeriod: { width: "22%" },
  colLabel: { width: "28%" },
  colDue: { width: "16%", textAlign: "right" },
  colPaid: { width: 16, textAlign: "right", marginRight: 10 },
  colStatus: { width: "10%", textAlign: "center" },
  colMethod: { width: "12%", textAlign: "right" },
  thText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tdText: { fontSize: 9 },
  statusBadge: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 20,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7.5, color: "#9ca3af" },
});

const METHOD_LABELS = {
  cash: "Cash",
  bkash: "bKash",
  nagad: "Nagad",
  jazz_cash: "JazzCash",
  easy_paisa: "EasyPaisa",
  upi: "UPI",
  bank_transfer: "Bank",
  card: "Card",
  other: "Other",
};

export default function LedgerPDF({ house, membership, entries }) {
  const member = membership.userId;
  const currency = house.currency || "BDT";

  const totalDue = entries.reduce((s, e) => s + (e.amountDue || 0), 0);
  const totalPaid = entries.reduce((s, e) => s + (e.amountPaid || 0), 0);
  const outstanding = Math.max(0, totalDue - totalPaid);
  const generatedOn = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document title={`Ledger — ${member?.name || "Member"}`} author="Homy">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Homy</Text>
          <Text style={styles.houseName}>{house.name}</Text>
          <Text style={styles.houseSub}>
            {house.address?.city ? `${house.address.city} · ` : ""}
            {currency} · Rent due day {house.rentDueDay}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Member info */}
        <View style={styles.memberBox}>
          <Text style={styles.memberName}>{member?.name || "Member"}</Text>
          <Text style={styles.memberMeta}>
            {member?.email || ""}
            {membership.roomLabel ? `  ·  Room: ${membership.roomLabel}` : ""}
            {membership.moveInDate
              ? `  ·  Move-in: ${fmtDate(membership.moveInDate)}`
              : ""}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            {
              label: "Total Due",
              value: fmtAmount(totalDue, currency),
              color: "#111827",
            },
            {
              label: "Total Paid",
              value: fmtAmount(totalPaid, currency),
              color: "#16a34a",
            },
            {
              label: "Outstanding",
              value: fmtAmount(outstanding, currency),
              color: outstanding > 0 ? "#dc2626" : "#16a34a",
            },
            {
              label: "Entries",
              value: String(entries.length),
              color: "#111827",
            },
          ].map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, styles.colPeriod]}>Period</Text>
          <Text style={[styles.thText, styles.colLabel]}>Label</Text>
          <Text style={[styles.thText, styles.colDue]}>Due</Text>
          <Text style={[styles.thText, styles.colDue]}>Paid</Text>
          <Text style={[styles.thText, styles.colStatus]}>Status</Text>
          <Text style={[styles.thText, styles.colMethod]}>Method</Text>
        </View>

        {/* Table rows */}
        {entries.map((e, i) => {
          const statusColor = STATUS_COLORS[e.status] || STATUS_COLORS.pending;
          return (
            <View
              key={e._id}
              style={[
                styles.tableRow,
                i % 2 === 1 ? { backgroundColor: "#fafafa" } : {},
              ]}
            >
              <Text style={[styles.tdText, styles.colPeriod]}>
                {fmtDate(e.periodStart).slice(0, 8)} –{" "}
                {fmtDate(e.periodEnd).slice(0, 8)}
              </Text>
              <Text style={[styles.tdText, styles.colLabel]}>
                {e.label || "Rent"}
              </Text>
              <Text style={[styles.tdText, styles.colDue]}>
                {fmtAmount(e.amountDue, currency)}
              </Text>
              <Text style={[styles.tdText, styles.colDue]}>
                {fmtAmount(e.amountPaid, currency)}
              </Text>
              <Text style={[styles.statusBadge, { color: statusColor }]}>
                {(e.status || "pending").toUpperCase()}
              </Text>
              <Text style={[styles.tdText, styles.colMethod]}>
                {METHOD_LABELS[e.paymentMethod] || e.paymentMethod || "—"}
              </Text>
            </View>
          );
        })}

        {entries.length === 0 && (
          <View style={{ padding: "20 10", alignItems: "center" }}>
            <Text style={{ fontSize: 9, color: "#9ca3af" }}>
              No ledger entries found.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated by Homy · {generatedOn}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
