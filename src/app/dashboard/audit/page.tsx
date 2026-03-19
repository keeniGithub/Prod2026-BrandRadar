"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff, RefreshCw } from "lucide-react"
import { AuditEvent, AuditEventType, AuditFilters, typeBadge } from "@/app/config/audit"
import { getEvents } from "@/app/api/audit"
import {
  getAuditEventKey,
  getHiddenAuditEventKeys,
  getLocalAuditEvents,
  hideAuditEvent,
  unhideAuditEvent,
} from "@/lib/local-audit"

/** Количество событий на одной странице */
const PAGE_SIZE = 25

export default function Audit() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set())
  const [showHidden, setShowHidden] = useState(false)
  const [loading, setLoading] = useState(true)

  const [type, setType] = useState<AuditEventType | "all">("all")
  const [since, setSince] = useState("")
  // Текущая страница (0-based) для клиентской пагинации по полученным событиям
  const [page, setPage] = useState(0)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    // Загружаем больший блок, чтобы клиентская пагинация работала плавно
    const filters: AuditFilters = {
      type: type === "all" ? null : type,
      since: since || null,
      offset: 0,
      limit: 500,
    }
    try {
      const response = await getEvents(filters)
      if (response.status === 200) {
        const localEvents = getLocalAuditEvents()
        const merged = [...localEvents, ...response.data].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        )
        setEvents(merged)
        // Сбрасываем страницу при каждой перезагрузке данных
        setPage(0)
      }
    } catch (err) {
      console.error('[Audit] Ошибка загрузки событий:', err)
    } finally {
      setLoading(false)
    }
  }, [type, since])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    setHiddenKeys(new Set(getHiddenAuditEventKeys()))
  }, [])

  function isHidden(event: AuditEvent) {
    return hiddenKeys.has(getAuditEventKey(event))
  }

  function onHide(event: AuditEvent) {
    hideAuditEvent(event)
    setHiddenKeys(new Set(getHiddenAuditEventKeys()))
  }

  function onUnhide(event: AuditEvent) {
    unhideAuditEvent(event)
    setHiddenKeys(new Set(getHiddenAuditEventKeys()))
  }

  function formatTime(iso: string) {
    const d = new Date(iso)
    return d.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const allDisplayed = showHidden ? events : events.filter((event) => !isHidden(event))
  const totalPages = Math.max(1, Math.ceil(allDisplayed.length / PAGE_SIZE))
  const displayedEvents = allDisplayed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function exportCsv() {
    const header = "ID,Время,Событие,Тип,Пользователь,Детали"
    const rows = allDisplayed.map((r) =>
      [r.id, formatTime(r.time), r.event, typeBadge[r.type].label, r.user, r.details]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    )
    const csv = "\uFEFF" + [header, ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "audit-log.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Журнал событий</CardTitle>
        <CardAction>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHidden((prev) => !prev)}>
              {showHidden ? <EyeOff data-icon="inline-start" /> : <Eye data-icon="inline-start" />}
              {showHidden ? "Скрыть скрытые" : "Показать скрытые"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download data-icon="inline-start" />
              Экспорт
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Тип</Label>
            <Select value={type} onValueChange={(v) => setType(v as AuditEventType | "all")}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Все" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="alert">Алерт</SelectItem>
                <SelectItem value="settings">Настройки</SelectItem>
                <SelectItem value="system">Система</SelectItem>
                <SelectItem value="ml">ML</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>С даты</Label>
            <Input
              type="datetime-local"
              className="w-55"
              value={since}
              onChange={(e) => setSince(e.target.value)}
            />
          </div>

          <Button
            className="bg-[#4fd168] text-white hover:bg-[#47bf5f]"
            onClick={fetchEvents}
            disabled={loading}
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">ID</TableHead>
              <TableHead className="w-44">Время</TableHead>
              <TableHead>Событие</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Детали</TableHead>
              <TableHead className="w-44 text-right">Действие</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && displayedEvents.length === 0 ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <TableRow key={`audit-skeleton-${idx}`}>
                  <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-56" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="ml-auto h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : displayedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Нет событий
                </TableCell>
              </TableRow>
            ) : (
              displayedEvents.map((row) => {
                const badge = typeBadge[row.type]
                const rowIsHidden = isHidden(row)
                return (
                  <TableRow key={`${row.id}-${row.time}`} className={rowIsHidden ? "opacity-45" : undefined}>
                    <TableCell className="text-muted-foreground">{row.id}</TableCell>
                    <TableCell className="text-muted-foreground">{formatTime(row.time)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{row.event}</span>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>{row.user}</TableCell>
                    <TableCell className="text-muted-foreground">{row.details}</TableCell>
                    <TableCell className="text-right">
                      {rowIsHidden ? (
                        <Button variant="outline" size="sm" onClick={() => onUnhide(row)}>
                          Показать
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => onHide(row)}>
                          Скрыть
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        {/* Пагинация — заменяет числовые поля Offset/Limit */}
        {allDisplayed.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">
              Показано {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, allDisplayed.length)} из {allDisplayed.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="size-4" />
                Назад
              </Button>
              <span className="px-3 text-sm text-muted-foreground">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Далее
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
