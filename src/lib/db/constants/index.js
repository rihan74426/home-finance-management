// ─── Member roles inside a house ─────────────────────────────────────────────
export const ROLES = {
  MANAGER: "manager", // Head of house — full control
  MEMBER: "member", // Regular occupant
  GUEST: "guest", // Temporary read-only access
};

// ─── Invite status ────────────────────────────────────────────────────────────
export const INVITE_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  EXPIRED: "expired",
};

// ─── Ledger / payment ─────────────────────────────────────────────────────────
export const PAYMENT_STATUS = {
  PAID: "paid",
  PARTIAL: "partial",
  PENDING: "pending",
  OVERDUE: "overdue",
};

export const PAYMENT_METHOD = {
  CASH: "cash",
  BKASH: "bkash",
  NAGAD: "nagad",
  JAZZ_CASH: "jazz_cash",
  EASY_PAISA: "easy_paisa",
  UPI: "upi",
  BANK_TRANSFER: "bank_transfer",
  CARD: "card",
  OTHER: "other",
};

export const LEDGER_TYPE = {
  RENT: "rent",
  BILL: "bill",
  DEPOSIT: "deposit",
  OTHER: "other",
};

// ─── Bill types ───────────────────────────────────────────────────────────────
export const BILL_TYPE = {
  ELECTRICITY: "electricity",
  WATER: "water",
  GAS: "gas",
  INTERNET: "internet",
  MAINTENANCE: "maintenance",
  GARBAGE: "garbage",
  CABLE: "cable",
  OTHER: "other",
};

export const BILL_SPLIT_TYPE = {
  EQUAL: "equal", // Divide equally among all members
  CUSTOM: "custom", // Manager sets each member's share
};

// ─── Vault item types ─────────────────────────────────────────────────────────
export const VAULT_TYPE = {
  WIFI: "wifi",
  DOOR_CODE: "door_code",
  GATE_CODE: "gate_code",
  LEASE: "lease",
  CONTACT: "contact",
  DOCUMENT: "document",
  APPLIANCE: "appliance",
  OTHER: "other",
};

// Vault visibility — who can read this item
export const VAULT_VISIBILITY = {
  ALL: "all", // Every member in the house
  MANAGER_ONLY: "manager_only", // Only the manager
};

// ─── Task constants ───────────────────────────────────────────────────────────
export const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  DONE: "done",
};

export const TASK_PRIORITY = {
  LOW: "low",
  NORMAL: "normal",
  URGENT: "urgent",
};

export const TASK_RECURRENCE = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
};

export const TASK_CATEGORY = {
  CLEANING: "cleaning",
  GROCERY: "grocery",
  MAINTENANCE: "maintenance",
  PAYMENT: "payment",
  ADMIN: "admin",
  OTHER: "other",
};

// ─── Chat & threads ───────────────────────────────────────────────────────────
export const THREAD_TYPE = {
  GENERAL: "general", // Default thread — every house has one
  RENT: "rent",
  GROCERIES: "groceries",
  MAINTENANCE: "maintenance",
  CUSTOM: "custom", // Created by members
};

export const MESSAGE_TYPE = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
  SYSTEM: "system", // "John joined the house", "Rent marked paid"
};

// ─── Notification types ───────────────────────────────────────────────────────
export const NOTIFICATION_TYPE = {
  RENT_DUE: "rent_due",
  RENT_PAID: "rent_paid",
  RENT_OVERDUE: "rent_overdue",
  TASK_ASSIGNED: "task_assigned",
  TASK_OVERDUE: "task_overdue",
  TASK_DONE: "task_done",
  BILL_ADDED: "bill_added",
  BILL_DUE: "bill_due",
  MEMBER_JOINED: "member_joined",
  MEMBER_LEFT: "member_left",
  ANNOUNCEMENT: "announcement",
  MEETING_SCHEDULED: "meeting_scheduled",
  POLL_CREATED: "poll_created",
  MAINTENANCE_BOOKED: "maintenance_booked",
  INVITE_RECEIVED: "invite_received",
};

// ─── Meeting / RSVP ───────────────────────────────────────────────────────────
export const RSVP_STATUS = {
  ATTENDING: "attending",
  NOT_ATTENDING: "not_attending",
  MAYBE: "maybe",
  NO_RESPONSE: "no_response",
};

// ─── House types ──────────────────────────────────────────────────────────────
export const HOUSE_TYPE = {
  FLAT: "flat",
  VILLA: "villa",
  FAMILY: "family",
  CO_LIVING: "co_living",
  DORMITORY: "dormitory",
  OTHER: "other",
};

// ─── Subscription plans ───────────────────────────────────────────────────────
export const PLAN = {
  FREE: "free",
  PRO: "pro",
  MANAGER_PRO: "manager_pro",
};
