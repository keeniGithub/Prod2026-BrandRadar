import { SOURCE_CONFIG, SOURCE_TYPES } from "./constants"

export type Source = {
    project_id: string
    source_type: 'telegram' | 'rss' | 'web'
    name: string
    config: Record<string, unknown>
    is_enabled: boolean
    id: string
    collector_status: 'idle' | 'running' | 'error'
    last_fetched_at: string | null
    error_message: string | null
    created_at: string
    updated_at: string
}

export type CreateSourcePayload = {
    source_type: 'telegram' | 'rss'
    name: string
    is_enabled: boolean
    config: Record<string, unknown>
}

export type UpdateSourcePayload = {
    name?: string
    config?: Record<string, unknown>
    is_enabled?: boolean
}

export type SourceDialogType = 'telegram' | 'rss'

export interface CollectorInfo {
    source_id: string
    name: string
    source_type: string
    collector_status: string
    last_fetched_at: string
    error_message: string
}

export interface CollectorLastRunResponse {
    collectors: CollectorInfo[]
    total: number
}

export const MAX_SOURCE_NAME_LENGTH = SOURCE_CONFIG.MAX_NAME_LENGTH
export const FORBIDDEN_SOURCE_NAME_CHARS_REGEX = SOURCE_CONFIG.FORBIDDEN_CHARS_REGEX
export const FORBIDDEN_SOURCE_NAME_CHARS_GLOBAL_REGEX = SOURCE_CONFIG.FORBIDDEN_CHARS_GLOBAL_REGEX
export const TELEGRAM_CHANNEL_REGEX = SOURCE_CONFIG.TELEGRAM_CHANNEL_REGEX
