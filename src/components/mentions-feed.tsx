"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { RefreshCw, Newspaper, Smile, ExternalLink, Rss, Send, Globe, ChevronDown, ChevronUp, Sliders, ThumbsDown, Meh, Eye, EyeOff } from "lucide-react"
import { getSimilar, markAsRead } from "@/app/api/mentions"
import type { SimilarMention } from "@/app/config/mentions"
import { getSources as fetchSources } from "@/app/api/sources"
import { Source } from "@/app/config/sources"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBrand } from "@/components/brand-context"
import { getFeed } from "@/app/api/mentions"
import { FeedOrderBy, FeedSortOrder } from "@/app/config/mentions"
import { Mention } from "./types"
import { sentimentConfig, riskConfig } from "@/app/config/card"

const LIMIT = 50

function timeAgo(iso: string) {
    const now = Date.now()
    const then = new Date(iso).getTime()
    const diff = Math.max(0, now - then)
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "только что"
    if (mins < 60) return `${mins} мин. назад`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ч. назад`
    const days = Math.floor(hours / 24)
    return `${days} дн. назад`
}

export function highlightText(text: string, keywords: string[], riskKeywords: string[], searchQuery: string) {
    const parts: { text: string; type: "plain" | "keyword" | "risk" | "search" }[] = []
    const allPatterns: { pattern: string; type: "keyword" | "risk" | "search" }[] = []

    for (const kw of keywords) {
        if (kw) allPatterns.push({ pattern: kw, type: "keyword" })
    }
    for (const rw of riskKeywords) {
        if (rw) allPatterns.push({ pattern: rw, type: "risk" })
    }
    if (searchQuery) {
        allPatterns.push({ pattern: searchQuery, type: "search" })
    }

    if (allPatterns.length === 0) return text

    const escaped = allPatterns.map((p) => ({
        ...p,
        pattern: p.pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    }))
    const regex = new RegExp(
        `(${escaped.map((e) => e.pattern).join("|")})`,
        "gi"
    )
    const splits = text.split(regex)

    for (const segment of splits) {
        if (!segment) continue
        const matchedSearch =
            searchQuery && segment.toLowerCase() === searchQuery.toLowerCase()
        const matchedRisk =
            !matchedSearch &&
            riskKeywords.some((rw) => rw && segment.toLowerCase() === rw.toLowerCase())
        const matchedKeyword =
            !matchedSearch &&
            !matchedRisk &&
            keywords.some((kw) => kw && segment.toLowerCase() === kw.toLowerCase())

        if (matchedSearch) {
            parts.push({ text: segment, type: "search" })
        } else if (matchedRisk) {
            parts.push({ text: segment, type: "risk" })
        } else if (matchedKeyword) {
            parts.push({ text: segment, type: "keyword" })
        } else {
            parts.push({ text: segment, type: "plain" })
        }
    }

    return parts.map((p, i) => {
        if (p.type === "search")
            return (
                <mark key={i} className="rounded-sm bg-yellow-200 px-0.5">
                    {p.text}
                </mark>
            )
        if (p.type === "keyword")
            return (
                <mark key={i} className="rounded-sm bg-green-200 text-green-900 px-0.5">
                    {p.text}
                </mark>
            )
        if (p.type === "risk")
            return (
                <mark key={i} className="rounded-sm bg-red-200 text-red-900 px-0.5">
                    {p.text}
                </mark>
            )
        return p.text
    })
}

function findWordsInText(text: string, words: string[]): string[] {
    const lower = text.toLowerCase()
    return words.filter((w) => w && lower.includes(w.toLowerCase()))
}

import React from "react"
function buildWhyImportant(
    text: string,
    keywords: string[],
    riskKeywords: string[]
): React.ReactNode | null {
    const foundKeywords = findWordsInText(text, keywords)
    const foundRiskKeywords = findWordsInText(text, riskKeywords)
    if (foundKeywords.length === 0 && foundRiskKeywords.length === 0) return null

    const parts: React.ReactNode[] = []
    if (foundKeywords.length > 0) {
        parts.push(
            <span key="kw">содержит ключевые слова: {foundKeywords.map((kw, i) => (
                <span key={kw} className="text-green-700 font-semibold">{kw}{i < foundKeywords.length - 1 ? ', ' : ''}</span>
            ))}</span>
        )
    }
    if (foundRiskKeywords.length > 0) {
        parts.push(
            <span key="risk" className="ml-2">risk-слова: {foundRiskKeywords.map((rw, i) => (
                <span key={rw} className="text-red-700 font-semibold">{rw}{i < foundRiskKeywords.length - 1 ? ', ' : ''}</span>
            ))}</span>
        )
    }
    return <>{parts.map((p, i) => <React.Fragment key={i}>{i > 0 && '; '}{p}</React.Fragment>)}</>
}

function getSourceIcon(sourceType?: string | null) {
    if (sourceType === "telegram") return <Send className="size-4 text-sky-600" />
    if (sourceType === "rss" || sourceType == undefined) return <Rss className="size-4 text-orange-600" />
    if (sourceType === "web") return <Globe className="size-4 text-gray-500" />
    return <Globe className="size-4 text-gray-400" />
}

import { MentionModal } from "./mention-modal"

interface FeedItemProps {
    mention: Mention
    keywords: string[]
    riskKeywords: string[]
    searchQuery: string
    sourceTypeMap: Record<string, string>
    onOpen: (mention: Mention) => void
    isRead: boolean
    onMarkRead: (id: string) => void
}

function getShortText(text: string, maxWords = 10): string {
    const words = text.split(/\s+/)
    if (words.length <= maxWords) return text
    return words.slice(0, maxWords).join(" ") + "…"
}

const FeedItem: React.FC<FeedItemProps> = ({ mention, keywords, riskKeywords, searchQuery, sourceTypeMap, onOpen, isRead, onMarkRead }) => {
    const [showSimilar, setShowSimilar] = useState(false)
    const [similar, setSimilar] = useState<SimilarMention[]>([])
    const [similarLoading, setSimilarLoading] = useState(false)
    const [loadedSimilarCount, setLoadedSimilarCount] = useState<number | null>(null)

    const handleToggleSimilar = (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!showSimilar && similar.length === 0) {
            setSimilarLoading(true)
            getSimilar(mention.id)
                .then((res) => {
                    if (res.status === 200) {
                        setSimilar(res.data)
                        setLoadedSimilarCount(res.data.length)
                    }
                })
                .finally(() => setSimilarLoading(false))
        }

        setShowSimilar((value) => !value)
    }

    const sentiment = (mention.sentiment_label as "positive" | "neutral" | "negative") || null
    const sConfig = sentiment ? sentimentConfig[sentiment] : sentimentConfig.neutral
    const relevancePct = Math.round(mention.relevance_score * 100)
    const whyImportant = buildWhyImportant(mention.text, keywords, riskKeywords)
    const hasRiskWords = findWordsInText(mention.text, riskKeywords).length > 0
    const shouldShowWhyImportant =
        !!whyImportant &&
        ((sentiment === "positive" || sentiment === "negative") && mention.relevance_score > 0.8 || hasRiskWords)

    const sourceType = sourceTypeMap[mention.source_id] || null

    return (
        <>
            <article
                className={cn(
                    "rounded-xl border border-l-4 bg-white p-3 sm:p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer",
                    sConfig.border
                )}
                onClick={() => onOpen(mention)}
            >
                <div className="mb-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                    <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
                        <span aria-hidden="true" className="shrink-0">{getSourceIcon(sourceType)}</span>
                        <span className="truncate font-semibold text-gray-800">{mention.title || "Без заголовка"}</span>
                        <span className="shrink-0 text-xs text-gray-400">{timeAgo(mention.published_at)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {mention.relevance_label === "relevant" && relevancePct >= 80 && hasRiskWords && (
                            <span className={cn("rounded-md px-2 py-0.5 text-xs font-bold", riskConfig.high?.bg, riskConfig.high?.text)}>
                                HIGH RISK
                            </span>
                        )}
                        <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                            {relevancePct}%
                        </span>
                        <span
                            className={cn(
                                "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                                sConfig.bg,
                                sConfig.color
                            )}
                        >
                            <Smile className="size-3" />
                            {sConfig.label}
                        </span>
                    </div>
                </div>
                <p className="mb-3 text-base leading-relaxed text-gray-800 line-clamp-2">
                    {highlightText(getShortText(mention.text, 30), keywords, riskKeywords, searchQuery)}
                </p>
                {shouldShowWhyImportant && (
                    <div className={cn("mb-3 rounded-lg px-4 py-2.5", sConfig.bg)}>
                        <span className="font-semibold text-gray-700">Почему это важно: </span>
                        <span className="text-gray-600">{whyImportant}</span>
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                    {mention.url && (
                        <a
                            href={mention.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-teal-600 transition-colors hover:bg-gray-50"
                            onClick={e => e.stopPropagation()}
                        >
                            <ExternalLink className="size-3.5" />
                            Источник
                        </a>
                    )}
                    {mention.similar_count > 0 && (
                        <button
                            type="button"
                            onClick={handleToggleSimilar}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                        >
                            {showSimilar ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                            {loadedSimilarCount ?? mention.similar_count} похожих
                        </button>
                    )}
                    <button
                        type="button"
                        title={isRead ? "Прочитано" : "Пометить прочитанным"}
                        onClick={(e) => { e.stopPropagation(); onMarkRead(mention.id) }}
                        className={cn(
                            "ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                            isRead
                                ? "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                : "bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500"
                        )}
                    >
                        {isRead ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        <span className="hidden sm:inline">{isRead ? "Прочитано" : "Прочитать"}</span>
                    </button>
                </div>

                {showSimilar && (
                    <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                        {similarLoading && <p className="text-xs text-gray-400">Загрузка...</p>}
                        {similar.map((s) => (
                            <div key={s.id} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                                <div className="mb-1 flex items-center gap-2">
                                    <span className="font-medium text-gray-700">{s.source_name}</span>
                                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${s.relation === "duplicate" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                                        {s.relation === "duplicate" ? "дубликат" : "похожий"}
                                    </span>
                                </div>
                                <p className="line-clamp-3 text-xs leading-relaxed text-gray-600">{s.text}</p>
                            </div>
                        ))}
                        {!similarLoading && similar.length === 0 && (
                            <p className="text-xs text-gray-400">Похожие не найдены</p>
                        )}
                    </div>
                )}
            </article>
        </>
    )
}

function FeedItemSkeleton() {
    return (
        <article className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-full" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-md" />
                    <Skeleton className="h-6 w-20 rounded-md" />
                </div>
            </div>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-[90%]" />
            <Skeleton className="mb-4 h-4 w-[70%]" />
            <Skeleton className="h-8 w-28 rounded-full" />
        </article>
    )
}

export function MentionsFeed() {
    const { selectedBrand } = useBrand()
    const [mentions, setMentions] = useState<Mention[]>([])
    const [loading, setLoading] = useState(true)
    const [sentiment, setSentiment] = useState("all")
    const [relevance, setRelevance] = useState("all")
    const [sourceType, setSourceType] = useState("all")
    const [orderBy, setOrderBy] = useState<FeedOrderBy>("published_at")
    const [sortOrder, setSortOrder] = useState<FeedSortOrder>("desc")
    const [search, setSearch] = useState("")
    const offsetRef = useRef(0)
    const [hasMore, setHasMore] = useState(true)
    const [sources, setSources] = useState<Source[]>([])
    const [modalMention, setModalMention] = useState<Mention | null>(null)
    const [readIds, setReadIds] = useState<Set<string>>(new Set())
    const [showRead, setShowRead] = useState("all")

    const sourceTypeMap = sources.reduce<Record<string, string>>((acc, s) => {
        acc[s.id] = s.source_type
        return acc
    }, {})

    useEffect(() => {
        if (!selectedBrand) return
        fetchSources().then((res) => {
            if (res.status === 200) setSources(res.data)
        })
    }, [selectedBrand])

    const load = useCallback(
        async (reset = false) => {
            if (!selectedBrand) return
            setLoading(true)
            const currentOffset = reset ? 0 : offsetRef.current
            const res = await getFeed({
                brand_id: selectedBrand.id,
                sentiment: sentiment === "all" ? undefined : sentiment,
                relevant_only: relevance === "high" ? true : undefined,
                source_type: sourceType === "all" ? undefined : sourceType,
                order_by: orderBy,
                sort_order: sortOrder,
                q: search || undefined,
                offset: currentOffset,
                limit: LIMIT,
            })
            if (res.status === 200) {
                let data: Mention[] = res.data

                if (relevance === "high") {
                    data = data.filter((m) => m.relevance_score > 0.8)
                } else if (relevance === "medium") {
                    data = data.filter((m) => m.relevance_score >= 0.5 && m.relevance_score <= 0.8)
                } else if (relevance === "low") {
                    data = data.filter((m) => m.relevance_score < 0.5)
                }

                if (reset) {
                    setMentions(data)
                    offsetRef.current = data.length
                } else {
                    setMentions((prev) => [...prev, ...data])
                    const newOffset = currentOffset + data.length
                    offsetRef.current = newOffset
                }
                setHasMore(res.data.length === LIMIT)
            }
            setLoading(false)
        },
        [selectedBrand, sentiment, relevance, sourceType, orderBy, sortOrder, search]
    )

    useEffect(() => {
        load(true)
    }, [load])

    const handleSearch = () => {
        load(true)
    }

    const handleMarkRead = (id: string) => {
        setReadIds((prev) => {
            if (prev.has(id)) return prev
            const next = new Set(prev)
            next.add(id)
            markAsRead(id).catch(() => {
                setReadIds((p) => { const r = new Set(p); r.delete(id); return r })
            })
            return next
        })
    }

    const visibleMentions = mentions.filter((m) => {
        const read = readIds.has(m.id) || m.is_read
        if (showRead === "unread") return !read
        if (showRead === "read") return read
        return true
    })

    const showInitialSkeleton = selectedBrand && loading && mentions.length === 0

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <Newspaper className="size-5 text-gray-700" />
                <h2 className="text-xl font-bold">Лента упоминаний</h2>
            </div>

            <div className="flex flex-wrap items-end gap-4">
                {/* Desktop filters (visible on md and up) */}
                <div className="hidden md:flex md:flex-wrap md:items-end md:gap-4 md:w-full">
                    <div className="flex flex-col gap-1.5">
                        <Label>Тональность</Label>
                        <Select value={sentiment} onValueChange={setSentiment}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="positive">Позитивная</SelectItem>
                                <SelectItem value="neutral">Нейтральная</SelectItem>
                                <SelectItem value="negative">Негативная</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Релевантность</Label>
                        <Select value={relevance} onValueChange={setRelevance}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="high">Высокая (&gt; 0.8)</SelectItem>
                                <SelectItem value="medium">Средняя (0.5–0.8)</SelectItem>
                                <SelectItem value="low">Низкая (&lt; 0.5)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Тип источника</Label>
                        <Select value={sourceType} onValueChange={setSourceType}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="telegram">Telegram</SelectItem>
                                <SelectItem value="rss">RSS</SelectItem>
                                <SelectItem value="web">Веб</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Сортировка</Label>
                        <Select value={orderBy} onValueChange={(v) => setOrderBy(v as FeedOrderBy)}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="По времени" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="published_at">По времени</SelectItem>
                                <SelectItem value="relevance_score">По релевантности</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Порядок</Label>
                        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as FeedSortOrder)}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="По убыванию" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="desc">По убыванию</SelectItem>
                                <SelectItem value="asc">По возрастанию</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Просмотренные</Label>
                        <Select value={showRead} onValueChange={setShowRead}>
                            <SelectTrigger className="w-45">
                                <SelectValue placeholder="Все" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Все</SelectItem>
                                <SelectItem value="unread">Непрочитанные</SelectItem>
                                <SelectItem value="read">Прочитанные</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Поиск</Label>
                        <Input
                            className="w-55"
                            placeholder="Поиск по тексту..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                </div>

                {/* Mobile filters button (visible on md and down) */}
                <div className="flex md:hidden items-end gap-2 w-full">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <Label>Поиск</Label>
                        <Input
                            className="w-full"
                            placeholder="Поиск по тексту..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="shrink-0">
                                <Sliders className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <div className="space-y-4 p-3">
                                <div className="flex flex-col gap-1.5">
                                    <Label>Тональность</Label>
                                    <Select value={sentiment} onValueChange={setSentiment}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Все" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все</SelectItem>
                                            <SelectItem value="positive">Позитивная</SelectItem>
                                            <SelectItem value="neutral">Нейтральная</SelectItem>
                                            <SelectItem value="negative">Негативная</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Релевантность</Label>
                                    <Select value={relevance} onValueChange={setRelevance}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Все" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все</SelectItem>
                                            <SelectItem value="high">Высокая (&gt; 0.8)</SelectItem>
                                            <SelectItem value="medium">Средняя (0.5–0.8)</SelectItem>
                                            <SelectItem value="low">Низкая (&lt; 0.5)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Тип источника</Label>
                                    <Select value={sourceType} onValueChange={setSourceType}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Все" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все</SelectItem>
                                            <SelectItem value="telegram">Telegram</SelectItem>
                                            <SelectItem value="rss">RSS</SelectItem>
                                            <SelectItem value="web">Веб</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Сортировка</Label>
                                    <Select value={orderBy} onValueChange={(v) => setOrderBy(v as FeedOrderBy)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="По времени" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="published_at">По времени</SelectItem>
                                            <SelectItem value="relevance_score">По релевантности</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Порядок</Label>
                                    <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as FeedSortOrder)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="По убыванию" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">По убыванию</SelectItem>
                                            <SelectItem value="asc">По возрастанию</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label>Просмотренные</Label>
                                    <Select value={showRead} onValueChange={setShowRead}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Все" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Все</SelectItem>
                                            <SelectItem value="unread">Непрочитанные</SelectItem>
                                            <SelectItem value="read">Прочитанные</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <Button
                    className="bg-[#4fd168] text-white hover:bg-[#47bf5f] md:mt-5"
                    onClick={() => load(true)}
                    disabled={loading}
                >
                    <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                    Обновить
                </Button>
            </div>

            {!selectedBrand && (
                <p className="text-sm text-gray-500">Выберите бренд для просмотра ленты.</p>
            )}

            {selectedBrand && mentions.length === 0 && !loading && (
                <p className="text-sm text-gray-500">Нет упоминаний.</p>
            )}

            <div className="space-y-4">
                {showInitialSkeleton && (
                    Array.from({ length: 6 }).map((_, idx) => (
                        <FeedItemSkeleton key={idx} />
                    ))
                )}
                {visibleMentions.map((m) => (
                    <FeedItem
                        key={m.id}
                        mention={m}
                        keywords={selectedBrand?.keywords ?? []}
                        riskKeywords={selectedBrand?.risk_keywords ?? []}
                        searchQuery={search}
                        sourceTypeMap={sourceTypeMap}
                        onOpen={setModalMention}
                        isRead={readIds.has(m.id) || m.is_read}
                        onMarkRead={handleMarkRead}
                    />
                ))}
            </div>

            {hasMore && mentions.length > 0 && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => load(false)}
                        disabled={loading}
                    >
                        {loading ? "Загрузка…" : "Загрузить ещё"}
                    </Button>
                </div>
            )}

            <MentionModal
                open={!!modalMention}
                onClose={() => setModalMention(null)}
                mention={modalMention}
                keywords={selectedBrand?.keywords ?? []}
                riskKeywords={selectedBrand?.risk_keywords ?? []}
                searchQuery={search}
                onMentionUpdate={(updated) => {
                    setMentions((prev) => prev.map((m) => m.id === updated.id ? updated : m))
                    setModalMention(updated)
                }}
            />
        </section>
    )
}
