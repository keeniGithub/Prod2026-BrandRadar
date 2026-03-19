export const path = {
    ROOT: '/',
    PING: '/ping',
    AUTH: "/auth/",
    PROJECTS: "/projects",
    BRANDS: {
        GETALL: (id: string) => `/projects/${id}/brands`,
        CREATE: (id: string) => `/projects/${id}/brands`,
        GET: (id: string, bid: string) => `/projects/${id}/brands/${bid}`,
        UPD: (id: string, bid: string) => `/projects/${id}/brands/${bid}`,
        DEL: (id: string, bid: string) => `/projects/${id}/brands/${bid}`,
        EVENTS: (id: string) => `/projects/${id}/events/journal`
    },
    ANALYTICS: {
        SUMMARY: (id: string) => `/projects/${id}/analytics/summary`,
        TIMELINE: (id: string) => `/projects/${id}/analytics/timeline`,
        SENTIMENT: (id: string) => `/projects/${id}/analytics/sentiment`,
        SOURCES: (id: string) => `/projects/${id}/analytics/sources`,
        RIKS: (id: string) => `/projects/${id}/analytics/risk`
    },
    HEALTH: {
        BRAND: (id: string) => `/projects/${id}/health/brand`,
        SYSTEM: (id: string) => `/projects/${id}/health/system`,
        METRICS: (id: string, bid: string) => `/projects/${id}/analytics/brands/${bid}/business-metrics`,
        COLLECTORS: `/health/collectors`,
        STATUS: `/health`,
    },
    SOURCES: {
        LIST: (projectId: string) => `/projects/${projectId}/sources/`,
        CREATE: (projectId: string) => `/projects/${projectId}/sources/`,
        GET: (sourceId: string) => `/sources/${sourceId}`,
        UPDATE: (sourceId: string) => `/sources/${sourceId}`,
        DELETE: (sourceId: string) => `/sources/${sourceId}`,
    },
    MENTIONS: {
        LIST: (id: string) => `/projects/${id}/mentions/`,
        FEED: (id: string) => `/projects/${id}/mentions/feed/`,
        SIMILAR: (mentionId: string) => `/mentions/${mentionId}/similar`,
        FEEDBACK: (mentionId: string) => `/mentions/${mentionId}/feedback`,
        READ: (mentionId: string) => `/mentions/${mentionId}/read`,
    },
    ALERTS: {
        LIST: (projectId: string) => `/projects/${projectId}/alerts`,
        GET: (alertId: string) => `/alerts/${alertId}`,
        ACKNOWLEDGE: (alertId: string) => `/alerts/${alertId}/acknowledge`,
        RESOLVE: (alertId: string) => `/alerts/${alertId}/resolve`,
        STREAM: `/alerts/stream`,
    },
    ALERT_RULES: {
        LIST: (projectId: string) => `/projects/${projectId}/alert-rules/`,
        CREATE: (projectId: string) => `/projects/${projectId}/alert-rules/`,
        GET: (ruleId: string) => `/alert-rules/${ruleId}`,
        UPDATE: (ruleId: string) => `/alert-rules/${ruleId}`,
        DELETE: (ruleId: string) => `/alert-rules/${ruleId}`,
    },
    COLLECTOR: {
        LASTRUN: '/collector/last-run',
        RUN: (sourceId: string) => `/collector/run/${sourceId}`,
    },
    PIPELINE: {
        RUN: '/pipeline/run',
    },
    ML: {
        FEEDBACK: '/feedback',
        RETRAIN: '/retrain',
        RETRAIN_STATUS: '/retrain/status',
        RETRAIN_CONFIG: '/retrain/config',
    }
}