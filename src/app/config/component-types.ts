// Component Props and Internal Types
import { ReactNode } from "react"
import { Alert } from "./alert"
import { Mention } from "./analytic"

// Error Page Props
export type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

// Alert Card Props
export interface AlertCardProps {
  alert: Alert
  onClick?: () => void
}

// Alert Context
export interface AlertContextValue {
  alerts: Alert[]
  unreadCount: number
  markAsRead: (alertId: string) => void
  refreshAlerts: () => Promise<void>
}

// Analytics Component Props
export interface KpiCardsProps {
  brandId: string
  days: number
}

export interface MentionsChartProps {
  brandId: string
  days: number
}

export interface RiskChartProps {
  brandId: string
  days: number
}

export interface SentimentPieProps {
  brandId: string
  days: number
}

export interface SourceChartProps {
  brandId: string
  days: number
}

// Dialog Props
export interface CreateAlertRuleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export interface CreateBrandDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export interface CreateSourceDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

// Health Component Props
export type MetricRow = {
  label: string
  current: number | string
  previous: number | string
  trend: number
}

// Mention Components
export interface MentionModalProps {
  mention: Mention | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export interface FeedItemProps {
  mention: Mention
  onMentionClick: (mention: Mention) => void
  onMoreClick?: (mention: Mention) => void
}

// UI Components
export interface ConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  isDestructive?: boolean
}

export type ChartConfig = Record<
  string,
  {
    label?: string
    icon?: React.ComponentType<{ className?: string }>
    color?: string
  }
>

export type ChartContextProps = {
  config: ChartConfig
}

// Misc
export type DashboardShellProps = {
  children: ReactNode
}
