// UI Colors and Styling Constants
export const COLORS = {
  GREEN: "#4fd168",
  RED: "#ef4a4a",
  ORANGE: "#f59e0b",
  BLUE: "#3b82f6",
  GRAY: "#94a3b8",
  ZINC: "#d1d5db",
  YELLOW: "#fbbf24",
  SLATE: "#64748b",
}

// Alert Configuration
export const ALERT_STATUSES = {
  FIRED: "fired" as const,
  ACKNOWLEDGED: "acknowledged" as const,
  RESOLVED: "resolved" as const,
}

// Sentiment Configuration
export const SENTIMENT_VALUES = {
  POSITIVE: "positive" as const,
  NEGATIVE: "negative" as const,
  NEUTRAL: "neutral" as const,
}

// Local Storage Keys
export const STORAGE_KEYS = {
  SELECTED_BRAND_ID: "selectedBrandId",
  AUDIT_EVENTS: "localAuditLog",
  HIDDEN_EVENTS: "localAuditHidden",
}

// Source Configuration
export const SOURCE_CONFIG = {
  MAX_NAME_LENGTH: 20,
  FORBIDDEN_CHARS_REGEX: /[^\p{L}\p{N}\s._-]/u,
  FORBIDDEN_CHARS_GLOBAL_REGEX: /[^\p{L}\p{N}\s._-]/gu,
  TELEGRAM_CHANNEL_REGEX: /^[A-Za-z0-9_]{4,32}$/,
}

// Auth Validation
export const AUTH_CONFIG = {
  USERNAME_REGEX: /^[A-Za-z0-9_]+$/,
}

// Pagination and Limits
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
}

// Timeouts
export const TIMEOUTS = {
  API_TIMEOUT: 6767,
  REVALIDATE: 0,
}

// Risk Levels
export const RISK_LEVELS = {
  HIGH: "high" as const,
  MEDIUM: "medium" as const,
  LOW: "low" as const,
}

// Feed Configuration
export const FEED_CONFIG = {
  DEFAULT_ORDER_BY: "published_at" as const,
  DEFAULT_SORT_ORDER: "desc" as const,
}

// Audit Event Types
export const AUDIT_EVENT_TYPES = {
  ALERT: "alert" as const,
  SETTINGS: "settings" as const,
  SYSTEM: "system" as const,
  ML: "ml" as const,
}

// Source Types
export const SOURCE_TYPES = {
  TELEGRAM: "telegram" as const,
  RSS: "rss" as const,
  WEB: "web" as const,
}

// Collector Status
export const COLLECTOR_STATUSES = {
  IDLE: "idle" as const,
  PROCESSING: "processing" as const,
  ERROR: "error" as const,
}

// Navigation
export const SELECTED_BRAND_KEY = "selectedBrandId"
