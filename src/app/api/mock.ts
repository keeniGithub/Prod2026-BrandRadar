import type { AxiosResponse, InternalAxiosRequestConfig } from "axios"
import type { Alert, AlertRule, AlertRulePayload, AlertRuleUpdatePayload } from "../config/alert"
import type {
  Mention,
  RiskItem,
  SentimentResponse,
  SourceItem,
  SummaryResponse,
  TimelineItem,
} from "../config/analytic"
import type { AuditEvent, AuditFilters } from "../config/audit"
import type { AuthResponse } from "../config/auth"
import type { Brand, BrandPayload } from "../config/brands"
import type { FeedbackPayload, FeedbackResponse } from "../config/feedback"
import type {
  BrandHealthResponse,
  BusinessMetricsResponse,
  Collector,
  SystemHealthResponse,
} from "../config/health"
import type { FeedParams, SimilarMention } from "../config/mentions"
import type { CollectorLastRunResponse, CreateSourcePayload, Source, UpdateSourcePayload } from "../config/sources"

const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || "mock-project"

function response<T>(data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 204 ? "No Content" : "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
    request: null,
  }
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

let idCounter = 1000
function nextId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${idCounter}`
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

const brands: Brand[] = [
  {
    id: "brand-1",
    project_id: PROJECT_ID,
    name: "TechCorp",
    keywords: ["techcorp", "техкорп", "приложение"],
    exclusions: ["вакансия"],
    risk_keywords: ["утечка", "сбой", "мошенники", "суд"],
    created_at: daysAgo(120),
    updated_at: daysAgo(1),
  },
  {
    id: "brand-2",
    project_id: PROJECT_ID,
    name: "Foodly",
    keywords: ["foodly", "доставка"],
    exclusions: ["рецепт"],
    risk_keywords: ["отравление", "задержка"],
    created_at: daysAgo(90),
    updated_at: daysAgo(2),
  },
]

const sources: Source[] = [
  {
    id: "src-telegram",
    project_id: PROJECT_ID,
    source_type: "telegram",
    name: "Telegram",
    config: { channel: "techcorp_news" },
    is_enabled: true,
    collector_status: "idle",
    last_fetched_at: hoursAgo(1),
    error_message: null,
    created_at: daysAgo(80),
    updated_at: daysAgo(1),
  },
  {
    id: "src-rss",
    project_id: PROJECT_ID,
    source_type: "rss",
    name: "RSS",
    config: { url: "https://example.com/rss.xml" },
    is_enabled: true,
    collector_status: "idle",
    last_fetched_at: hoursAgo(3),
    error_message: null,
    created_at: daysAgo(75),
    updated_at: daysAgo(1),
  },
  {
    id: "src-web",
    project_id: PROJECT_ID,
    source_type: "web",
    name: "Web",
    config: { domains: ["example.com"] },
    is_enabled: true,
    collector_status: "error",
    last_fetched_at: hoursAgo(8),
    error_message: "Timeout while crawling",
    created_at: daysAgo(74),
    updated_at: hoursAgo(8),
  },
]

const mentions: Mention[] = [
  {
    id: "m-1",
    brand_id: "brand-1",
    source_id: "src-telegram",
    external_id: "tg-101",
    url: "https://t.me/example/101",
    title: "Сбой в мобильном приложении TechCorp",
    text: "Пользователи жалуются на сбой и задержки оплаты в приложении TechCorp.",
    author: "@observer",
    published_at: hoursAgo(2),
    relevance_label: "relevant",
    relevance_score: 0.92,
    sentiment_label: "negative",
    sentiment_score: 0.88,
    cluster_id: "c-1",
    ml_metadata: { top_features: [{ word: "сбой", weight: 0.81 }, { word: "задержки", weight: 0.56 }] },
    is_duplicate: false,
    fingerprint: "fp-m-1",
    created_at: hoursAgo(2),
    updated_at: hoursAgo(2),
    duplicate_count: 1,
    similar_count: 2,
    duplicate_sources: [{ name: "DailyTech", url: "https://dailytech.example.com/1" }],
    is_read: false,
  },
  {
    id: "m-2",
    brand_id: "brand-1",
    source_id: "src-rss",
    external_id: "rss-220",
    url: "https://news.example.com/techcorp-launch",
    title: "Успешный запуск обновления TechCorp",
    text: "Компания TechCorp выпустила крупное обновление, пользователи отмечают стабильность.",
    author: "Редакция",
    published_at: hoursAgo(5),
    relevance_label: "relevant",
    relevance_score: 0.86,
    sentiment_label: "positive",
    sentiment_score: 0.81,
    cluster_id: "c-2",
    ml_metadata: { top_features: [{ word: "успешный", weight: 0.64 }, { word: "стабильность", weight: 0.58 }] },
    is_duplicate: false,
    fingerprint: "fp-m-2",
    created_at: hoursAgo(5),
    updated_at: hoursAgo(5),
    duplicate_count: 0,
    similar_count: 1,
    duplicate_sources: [],
    is_read: false,
  },
  {
    id: "m-3",
    brand_id: "brand-1",
    source_id: "src-web",
    external_id: "web-33",
    url: "https://forum.example.com/t/331",
    title: "Обсуждение сервиса TechCorp",
    text: "Часть аудитории нейтрально оценивает сервис, но просит улучшить поддержку.",
    author: "forum_user",
    published_at: hoursAgo(7),
    relevance_label: "uncertain",
    relevance_score: 0.61,
    sentiment_label: "neutral",
    sentiment_score: 0.51,
    cluster_id: "c-3",
    ml_metadata: { top_features: [{ word: "поддержка", weight: 0.39 }] },
    is_duplicate: false,
    fingerprint: "fp-m-3",
    created_at: hoursAgo(7),
    updated_at: hoursAgo(7),
    duplicate_count: 0,
    similar_count: 0,
    duplicate_sources: [],
    is_read: false,
  },
  {
    id: "m-4",
    brand_id: "brand-1",
    source_id: "src-rss",
    external_id: "rss-221",
    url: "https://media.example.com/case/1",
    title: "Кейс внедрения платформы TechCorp",
    text: "Клиент сообщил о росте эффективности после внедрения платформы TechCorp.",
    author: null,
    published_at: hoursAgo(12),
    relevance_label: "relevant",
    relevance_score: 0.78,
    sentiment_label: "positive",
    sentiment_score: 0.74,
    cluster_id: "c-2",
    ml_metadata: { top_features: [{ word: "эффективности", weight: 0.53 }] },
    is_duplicate: false,
    fingerprint: "fp-m-4",
    created_at: hoursAgo(12),
    updated_at: hoursAgo(12),
    duplicate_count: 0,
    similar_count: 1,
    duplicate_sources: [],
    is_read: true,
  },
  {
    id: "m-5",
    brand_id: "brand-1",
    source_id: "src-telegram",
    external_id: "tg-112",
    url: "https://t.me/example/112",
    title: "Подозрение на утечку данных",
    text: "В сети обсуждают возможную утечку данных клиентов TechCorp. Официальный комментарий ожидается.",
    author: "@securitywatch",
    published_at: hoursAgo(18),
    relevance_label: "relevant",
    relevance_score: 0.95,
    sentiment_label: "negative",
    sentiment_score: 0.91,
    cluster_id: "c-1",
    ml_metadata: { top_features: [{ word: "утечку", weight: 0.82 }, { word: "данных", weight: 0.61 }] },
    is_duplicate: false,
    fingerprint: "fp-m-5",
    created_at: hoursAgo(18),
    updated_at: hoursAgo(18),
    duplicate_count: 2,
    similar_count: 2,
    duplicate_sources: [{ name: "IT Blog", url: "https://itblog.example.com/post/1" }],
    is_read: false,
  },
  {
    id: "m-6",
    brand_id: "brand-1",
    source_id: "src-web",
    external_id: "web-91",
    url: "https://reviews.example.com/r/98",
    title: "Отзывы клиентов",
    text: "Большинство отзывов нейтральные, отдельные жалобы на задержку ответа поддержки.",
    author: "reviewer",
    published_at: daysAgo(2),
    relevance_label: "irrelevant",
    relevance_score: 0.39,
    sentiment_label: "neutral",
    sentiment_score: 0.57,
    cluster_id: "c-4",
    ml_metadata: { top_features: [{ word: "жалобы", weight: 0.31 }] },
    is_duplicate: false,
    fingerprint: "fp-m-6",
    created_at: daysAgo(2),
    updated_at: daysAgo(2),
    duplicate_count: 0,
    similar_count: 0,
    duplicate_sources: [],
    is_read: false,
  },
  {
    id: "m-7",
    brand_id: "brand-2",
    source_id: "src-rss",
    external_id: "rss-f-1",
    url: "https://food.example.com/news/1",
    title: "Foodly ускорила доставку",
    text: "Пользователи отмечают, что Foodly сократила время доставки в крупных городах.",
    author: "newsdesk",
    published_at: hoursAgo(9),
    relevance_label: "relevant",
    relevance_score: 0.84,
    sentiment_label: "positive",
    sentiment_score: 0.77,
    cluster_id: "c-f-1",
    ml_metadata: null,
    is_duplicate: false,
    fingerprint: "fp-m-7",
    created_at: hoursAgo(9),
    updated_at: hoursAgo(9),
    duplicate_count: 0,
    similar_count: 0,
    duplicate_sources: [],
    is_read: false,
  },
]

let alerts: Alert[] = [
  {
    id: "alert-1",
    project_id: PROJECT_ID,
    brand_id: "brand-1",
    cluster_id: "c-1",
    title: "Рост негатива",
    message: "Негативные упоминания превысили порог за последний час",
    threshold: 5,
    window_seconds: 3600,
    cooldown_seconds: 3600,
    actual_count: 9,
    status: "fired",
    fired_at: hoursAgo(1),
    acknowledged_at: null,
    resolved_at: null,
    created_at: hoursAgo(1),
    updated_at: hoursAgo(1),
  },
  {
    id: "alert-2",
    project_id: PROJECT_ID,
    brand_id: "brand-1",
    cluster_id: "c-3",
    title: "Скачок обсуждений",
    message: "Количество упоминаний аномально выросло",
    threshold: 20,
    window_seconds: 7200,
    cooldown_seconds: 7200,
    actual_count: 24,
    status: "acknowledged",
    fired_at: hoursAgo(10),
    acknowledged_at: hoursAgo(9),
    resolved_at: null,
    created_at: hoursAgo(10),
    updated_at: hoursAgo(9),
  },
]

let alertRules: AlertRule[] = [
  {
    id: "rule-1",
    brand_id: "brand-1",
    threshold: 5,
    window_seconds: 3600,
    cooldown_seconds: 3600,
    sentiment_filter: "negative",
    is_enabled: true,
    last_fired_at: hoursAgo(1),
    created_at: daysAgo(15),
    updated_at: daysAgo(1),
  },
]

const auditEvents: AuditEvent[] = [
  {
    id: 1,
    time: hoursAgo(2),
    event: "Импорт публикаций",
    type: "system",
    user: "system",
    details: "Собрано 35 новых упоминаний",
  },
  {
    id: 2,
    time: hoursAgo(1),
    event: "Сработал алерт",
    type: "alert",
    user: "monitor",
    details: "Рост негатива по бренду TechCorp",
  },
  {
    id: 3,
    time: hoursAgo(3),
    event: "Обновлены настройки",
    type: "settings",
    user: "admin",
    details: "Изменен список risk-слов",
  },
]

let retrainStatus = {
  is_training: false,
  feedback_count: 23,
  auto_retrain_threshold: 50,
  trained_at: daysAgo(2),
  last_error: null as string | null,
}

function filterMentionsByDays(items: Mention[], days: number): Mention[] {
  const since = Date.now() - days * 24 * 60 * 60 * 1000
  return items.filter((item) => new Date(item.published_at).getTime() >= since)
}

function mentionsByBrand(brandId: string): Mention[] {
  return mentions.filter((item) => item.brand_id === brandId)
}

function collectorView(): Collector[] {
  return sources.map((source) => ({
    source_id: source.id,
    name: source.name,
    source_type: source.source_type,
    status: source.collector_status === "running" ? "processing" : source.collector_status === "error" ? "error" : "idle",
    last_fetched_at: source.last_fetched_at || hoursAgo(12),
    error_message: source.error_message,
  }))
}

function sourceTypeById(sourceId: string): string | null {
  const source = sources.find((item) => item.id === sourceId)
  return source?.source_type || null
}

function buildTimeline(items: Mention[], days: number): TimelineItem[] {
  const byKey = new Map<string, TimelineItem>()
  const useHourly = days === 1

  items.forEach((item) => {
    const d = new Date(item.published_at)
    const key = useHourly
      ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).toISOString()
      : new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()

    const row = byKey.get(key) || { date: key, total: 0, positive: 0, neutral: 0, negative: 0 }
    row.total += 1
    if (item.sentiment_label === "positive") row.positive += 1
    if (item.sentiment_label === "neutral") row.neutral += 1
    if (item.sentiment_label === "negative") row.negative += 1
    byKey.set(key, row)
  })

  return [...byKey.values()].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export const mockApi = {
  auth(username: string, password: string): AxiosResponse<AuthResponse> {
    if (!username.trim() || !password.trim() || password.length < 3) {
      return response({ detail: [{ loc: ["body"], msg: "Invalid credentials", type: "auth_error", input: username }] }, 401)
    }
    return response({
      user: {
        id: "user-1",
        email: "demo@brandradar.local",
        username,
        is_active: true,
        created_at: daysAgo(200),
        updated_at: daysAgo(1),
      },
      access_token: "mock-token",
      token_type: "bearer",
    })
  },

  getBrands(): AxiosResponse<Brand[]> {
    return response(clone(brands))
  },

  getBrand(brandId: string): AxiosResponse<Brand> {
    const found = brands.find((item) => item.id === brandId) || brands[0]
    return response(clone(found))
  },

  createBrand(data: BrandPayload): AxiosResponse<Brand> {
    const now = new Date().toISOString()
    const created: Brand = {
      id: nextId("brand"),
      project_id: PROJECT_ID,
      name: data.name,
      keywords: data.keywords,
      exclusions: data.exclusions,
      risk_keywords: data.risk_keywords,
      created_at: now,
      updated_at: now,
    }
    brands.unshift(created)
    return response(clone(created), 201)
  },

  updateBrand(brandId: string, data: BrandPayload): AxiosResponse<Brand> {
    const idx = brands.findIndex((item) => item.id === brandId)
    if (idx < 0) {
      return response(clone(brands[0]))
    }
    brands[idx] = { ...brands[idx], ...data, updated_at: new Date().toISOString() }
    return response(clone(brands[idx]))
  },

  deleteBrand(brandId: string): AxiosResponse<undefined> {
    const idx = brands.findIndex((item) => item.id === brandId)
    if (idx >= 0) {
      brands.splice(idx, 1)
      alerts = alerts.filter((item) => item.brand_id !== brandId)
      alertRules = alertRules.filter((item) => item.brand_id !== brandId)
    }
    return response(undefined, 204)
  },

  getCollectorLastRun(): AxiosResponse<CollectorLastRunResponse> {
    const collectors = sources.map((source) => ({
      source_id: source.id,
      name: source.name,
      source_type: source.source_type,
      collector_status: source.collector_status,
      last_fetched_at: source.last_fetched_at || hoursAgo(12),
      error_message: source.error_message || "",
    }))
    return response({ collectors, total: collectors.length })
  },

  getSources(enabledOnly?: boolean): AxiosResponse<Source[]> {
    const filtered = enabledOnly ? sources.filter((item) => item.is_enabled) : sources
    return response(clone(filtered))
  },

  getSource(sourceId: string): AxiosResponse<Source> {
    const found = sources.find((item) => item.id === sourceId) || sources[0]
    return response(clone(found))
  },

  createSource(data: CreateSourcePayload): AxiosResponse<Source> {
    const now = new Date().toISOString()
    const created: Source = {
      id: nextId("src"),
      project_id: PROJECT_ID,
      source_type: data.source_type,
      name: data.name,
      config: data.config,
      is_enabled: data.is_enabled,
      collector_status: "idle",
      last_fetched_at: null,
      error_message: null,
      created_at: now,
      updated_at: now,
    }
    sources.push(created)
    return response(clone(created), 201)
  },

  updateSource(sourceId: string, data: UpdateSourcePayload): AxiosResponse<Source> {
    const idx = sources.findIndex((item) => item.id === sourceId)
    if (idx < 0) return response(clone(sources[0]))
    sources[idx] = {
      ...sources[idx],
      ...data,
      config: data.config ?? sources[idx].config,
      updated_at: new Date().toISOString(),
    }
    return response(clone(sources[idx]))
  },

  deleteSource(sourceId: string): AxiosResponse<undefined> {
    const idx = sources.findIndex((item) => item.id === sourceId)
    if (idx >= 0) {
      sources.splice(idx, 1)
    }
    return response(undefined, 204)
  },

  getSummary(brandId: string, days: number): AxiosResponse<SummaryResponse> {
    const pool = filterMentionsByDays(mentionsByBrand(brandId), days)
    const data: SummaryResponse = {
      brand_id: brandId,
      days,
      total: pool.length,
      by_relevance: {
        relevant: pool.filter((item) => item.relevance_label === "relevant").length,
        uncertain: pool.filter((item) => item.relevance_label === "uncertain").length,
        irrelevant: pool.filter((item) => item.relevance_label === "irrelevant").length,
      },
      by_sentiment: {
        positive: pool.filter((item) => item.sentiment_label === "positive").length,
        neutral: pool.filter((item) => item.sentiment_label === "neutral").length,
        negative: pool.filter((item) => item.sentiment_label === "negative").length,
      },
      active_alerts: alerts.filter((item) => item.brand_id === brandId && item.status === "fired").length,
    }
    return response(data)
  },

  getTimeline(brandId: string, days: number): AxiosResponse<TimelineItem[]> {
    const pool = filterMentionsByDays(mentionsByBrand(brandId), days)
    return response(buildTimeline(pool, days))
  },

  getSentiment(brandId: string, days: number): AxiosResponse<SentimentResponse> {
    const pool = filterMentionsByDays(mentionsByBrand(brandId), days)
    const distribution = {
      positive: pool.filter((item) => item.sentiment_label === "positive").length,
      neutral: pool.filter((item) => item.sentiment_label === "neutral").length,
      negative: pool.filter((item) => item.sentiment_label === "negative").length,
    }
    const total = Math.max(1, pool.length)
    return response({
      brand_id: brandId,
      days,
      total: pool.length,
      distribution,
      percentages: {
        positive: Math.round((distribution.positive / total) * 100),
        neutral: Math.round((distribution.neutral / total) * 100),
        negative: Math.round((distribution.negative / total) * 100),
      },
    })
  },

  getAnalyticSources(brandId: string, days: number): AxiosResponse<SourceItem[]> {
    const pool = filterMentionsByDays(mentionsByBrand(brandId), days)
    const counts = new Map<string, number>()
    pool.forEach((item) => {
      const type = sourceTypeById(item.source_id) || "unknown"
      counts.set(type, (counts.get(type) || 0) + 1)
    })
    const rows: SourceItem[] = [...counts.entries()].map(([source, count]) => ({ source, mentions: count }))
    return response(rows)
  },

  getRisk(brandId: string, days: number): AxiosResponse<RiskItem[]> {
    const pool = filterMentionsByDays(mentionsByBrand(brandId), days)
    const bucket = { high: 0, medium: 0, low: 0, none: 0 }
    pool.forEach((item) => {
      if (item.sentiment_label === "negative" && item.relevance_score >= 0.85) {
        bucket.high += 1
      } else if (item.sentiment_label === "negative" && item.relevance_score >= 0.65) {
        bucket.medium += 1
      } else if (item.relevance_score >= 0.5) {
        bucket.low += 1
      } else {
        bucket.none += 1
      }
    })
    const rows: RiskItem[] = [
      { level: "high", count: bucket.high },
      { level: "medium", count: bucket.medium },
      { level: "low", count: bucket.low },
      { level: "none", count: bucket.none },
    ]
    return response(rows)
  },

  getMentions(brandId: string, sentiment?: string): AxiosResponse<Mention[]> {
    const filtered = mentionsByBrand(brandId)
      .filter((item) => !sentiment || item.sentiment_label === sentiment)
      .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      .slice(0, 10)
    return response(clone(filtered))
  },

  getFeed(params: FeedParams): AxiosResponse<Mention[]> {
    let pool = mentions.filter((item) => item.brand_id === params.brand_id)

    if (params.sentiment) {
      pool = pool.filter((item) => item.sentiment_label === params.sentiment)
    }
    if (params.relevant_only) {
      pool = pool.filter((item) => item.relevance_label === "relevant")
    }
    if (params.source_type) {
      pool = pool.filter((item) => sourceTypeById(item.source_id) === params.source_type)
    }
    if (params.q) {
      const q = params.q.toLowerCase()
      pool = pool.filter((item) =>
        item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q)
      )
    }

    const orderBy = params.order_by || "published_at"
    const sortOrder = params.sort_order || "desc"
    pool = pool.sort((a, b) => {
      const left = orderBy === "relevance_score" ? a.relevance_score : new Date(a.published_at).getTime()
      const right = orderBy === "relevance_score" ? b.relevance_score : new Date(b.published_at).getTime()
      if (left === right) return 0
      return sortOrder === "asc" ? (left < right ? -1 : 1) : (left > right ? -1 : 1)
    })

    const offset = params.offset ?? 0
    const limit = params.limit ?? 50
    const sliced = pool.slice(offset, offset + limit)
    return response(clone(sliced))
  },

  getSimilar(mentionId: string): AxiosResponse<SimilarMention[]> {
    const root = mentions.find((item) => item.id === mentionId)
    if (!root) return response([])

    const similar = mentions
      .filter((item) => item.id !== mentionId && item.cluster_id && item.cluster_id === root.cluster_id)
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.title,
        text: item.text,
        url: item.url,
        published_at: item.published_at,
        source_name: sources.find((source) => source.id === item.source_id)?.name || "Source",
        sentiment_label: item.sentiment_label,
        relevance_score: item.relevance_score,
        relation: "cluster" as const,
      }))

    return response(similar)
  },

  markMentionRead(mentionId: string): AxiosResponse<{ ok: boolean }> {
    const idx = mentions.findIndex((item) => item.id === mentionId)
    if (idx >= 0) {
      mentions[idx] = { ...mentions[idx], is_read: true, updated_at: new Date().toISOString() }
    }
    return response({ ok: true })
  },

  getAlerts(): AxiosResponse<Alert[]> {
    const sorted = [...alerts].sort((a, b) => new Date(b.fired_at).getTime() - new Date(a.fired_at).getTime())
    return response(clone(sorted))
  },

  getAlert(alertId: string): AxiosResponse<Alert> {
    const found = alerts.find((item) => item.id === alertId) || alerts[0]
    return response(clone(found))
  },

  acknowledgeAlert(alertId: string): AxiosResponse<Alert> {
    const idx = alerts.findIndex((item) => item.id === alertId)
    if (idx >= 0) {
      alerts[idx] = {
        ...alerts[idx],
        status: "acknowledged",
        acknowledged_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return response(clone(alerts[idx]))
    }
    return response(clone(alerts[0]))
  },

  resolveAlert(alertId: string): AxiosResponse<Alert> {
    const idx = alerts.findIndex((item) => item.id === alertId)
    if (idx >= 0) {
      alerts[idx] = {
        ...alerts[idx],
        status: "resolved",
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return response(clone(alerts[idx]))
    }
    return response(clone(alerts[0]))
  },

  createAlertRule(payload: AlertRulePayload): AxiosResponse<AlertRule> {
    const now = new Date().toISOString()
    const created: AlertRule = {
      id: nextId("rule"),
      ...payload,
      last_fired_at: null,
      created_at: now,
      updated_at: now,
    }
    alertRules.unshift(created)
    return response(clone(created), 201)
  },

  getAlertRules(brandId: string): AxiosResponse<AlertRule[]> {
    return response(clone(alertRules.filter((item) => item.brand_id === brandId)))
  },

  updateAlertRule(ruleId: string, payload: AlertRuleUpdatePayload): AxiosResponse<AlertRule> {
    const idx = alertRules.findIndex((item) => item.id === ruleId)
    if (idx >= 0) {
      alertRules[idx] = { ...alertRules[idx], ...payload, updated_at: new Date().toISOString() }
      return response(clone(alertRules[idx]))
    }
    return response(clone(alertRules[0]))
  },

  deleteAlertRule(ruleId: string): AxiosResponse<undefined> {
    alertRules = alertRules.filter((item) => item.id !== ruleId)
    return response(undefined, 204)
  },

  getBrandHealth(brandId: string, days: number): AxiosResponse<BrandHealthResponse> {
    const pool = filterMentionsByDays(mentionsByBrand(brandId), days)
    const negative = pool.filter((item) => item.sentiment_label === "negative").length
    const positive = pool.filter((item) => item.sentiment_label === "positive").length
    const neutral = pool.filter((item) => item.sentiment_label === "neutral").length
    const total = Math.max(1, pool.length)

    const healthScore = Math.max(0, Math.min(100, Math.round(((positive * 1.2 + neutral * 0.6 - negative) / total) * 100 + 50)))

    const trend: { date: string; score: number }[] = []
    const points = Math.min(days, 14)
    for (let i = points - 1; i >= 0; i -= 1) {
      trend.push({
        date: daysAgo(i),
        score: Math.max(10, Math.min(98, healthScore + Math.round(Math.sin(i / 2) * 8))),
      })
    }

    return response({
      brand_id: brandId,
      days,
      health_score: healthScore,
      health_trend: trend,
      reputation: {
        positive_pct: Math.round((positive / total) * 100),
        neutral_pct: Math.round((neutral / total) * 100),
        negative_pct: Math.round((negative / total) * 100),
        crisis_incidents: alerts.filter((item) => item.brand_id === brandId && item.status !== "resolved").length,
      },
    })
  },

  getSystemHealth(): AxiosResponse<SystemHealthResponse> {
    return response({
      processed_per_hour: 128,
      error_count_1h: 2,
      db_record_count: 14320,
    })
  },

  getBusinessMetrics(): AxiosResponse<BusinessMetricsResponse> {
    return response({
      nps: { current: 42, previous: 36, trend: 6 },
      positive_to_negative_ratio: { current: 1.9, previous: 1.6, trend: 0.3 },
      neutral_share_percent: { current: 33, previous: 37, trend: -4 },
      engagement_score: { current: 71, previous: 66, trend: 5 },
      crisis_incidents_count: { current: 2, previous: 3, trend: -1 },
    })
  },

  getCollectors(): AxiosResponse<Collector[]> {
    return response(clone(collectorView()))
  },

  runCollector(sourceId: string): AxiosResponse<{ ok: boolean }> {
    const idx = sources.findIndex((item) => item.id === sourceId)
    if (idx >= 0) {
      sources[idx] = {
        ...sources[idx],
        collector_status: "idle",
        last_fetched_at: new Date().toISOString(),
        error_message: null,
        updated_at: new Date().toISOString(),
      }
    }
    return response({ ok: true })
  },

  runPipeline(): AxiosResponse<{ ok: boolean }> {
    return response({ ok: true })
  },

  pingAPI(): number {
    return 200
  },

  pingCollector(): number {
    return collectorView().some((item) => item.status === "error") ? 503 : 200
  },

  pingML(): string {
    return "healthy"
  },

  pingDB(): string {
    return "healthy"
  },

  getEvents(filters?: AuditFilters): AxiosResponse<AuditEvent[]> {
    let pool = [...auditEvents]
    if (filters?.type) {
      pool = pool.filter((item) => item.type === filters.type)
    }
    if (filters?.since) {
      const since = new Date(filters.since).getTime()
      pool = pool.filter((item) => new Date(item.time).getTime() >= since)
    }

    const offset = filters?.offset ?? 0
    const limit = filters?.limit ?? pool.length
    const sliced = pool
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(offset, offset + limit)

    return response(clone(sliced))
  },

  sendMlFeedback(data: FeedbackPayload): AxiosResponse<FeedbackResponse> {
    void data
    retrainStatus.feedback_count += 1
    return response({ success: true, message: "Feedback accepted" })
  },

  getRetrainStatus(): AxiosResponse<typeof retrainStatus> {
    return response(clone(retrainStatus))
  },

  triggerRetrain(): AxiosResponse<typeof retrainStatus> {
    retrainStatus = {
      ...retrainStatus,
      is_training: false,
      trained_at: new Date().toISOString(),
      last_error: null,
    }
    return response(clone(retrainStatus))
  },

  updateRetrainConfig(threshold: number): AxiosResponse<{ auto_retrain_threshold: number }> {
    retrainStatus = { ...retrainStatus, auto_retrain_threshold: threshold }
    return response({ auto_retrain_threshold: threshold })
  },

  patchMentionFeedback(
    mentionId: string,
    data: { sentiment_label?: string; relevance_label?: string }
  ): AxiosResponse<Mention> {
    const idx = mentions.findIndex((item) => item.id === mentionId)
    if (idx >= 0) {
      mentions[idx] = {
        ...mentions[idx],
        ...(data.sentiment_label ? { sentiment_label: data.sentiment_label } : {}),
        ...(data.relevance_label ? { relevance_label: data.relevance_label } : {}),
        updated_at: new Date().toISOString(),
      }
      return response(clone(mentions[idx]))
    }
    return response(clone(mentions[0]))
  },
}
