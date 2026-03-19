"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { sentimentBadge, type Mention } from "@/app/config/analytic"
import { getMentions } from "@/app/api/analytic"
import { useBrand } from "@/components/brand-context"

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.max(0, now - then)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} дн. назад`
  if (hours > 0) return `${hours} ч. назад`
  if (minutes > 0) return `${minutes} мин. назад`
  return "только что"
}

const tabs = [
  { value: "all", label: "Все", sentiment: undefined },
  { value: "positive", label: "Позитивные", sentiment: "positive" },
  { value: "negative", label: "Негативные", sentiment: "negative" },
  { value: "neutral", label: "Нейтральные", sentiment: "neutral" },
] as const

export function MentionsTable() {
  const { selectedBrand } = useBrand()
  const [activeTab, setActiveTab] = useState<string>("all")
  const [mentionsByTab, setMentionsByTab] = useState<Record<string, Mention[]>>({})
  const [loadingTab, setLoadingTab] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!selectedBrand) return
    const tab = tabs.find((t) => t.value === activeTab)
    if (!tab) return
    if (mentionsByTab[activeTab]) return

    setLoadingTab((prev) => ({ ...prev, [activeTab]: true }))
    getMentions(selectedBrand.id, tab.sentiment)
      .then((res) => {
        if (res.status === 200) {
          setMentionsByTab((prev) => ({ ...prev, [activeTab]: res.data }))
        }
      })
      .finally(() => setLoadingTab((prev) => ({ ...prev, [activeTab]: false })))
  }, [selectedBrand, activeTab, mentionsByTab])

  useEffect(() => {
    setMentionsByTab({})
  }, [selectedBrand])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Последние упоминания</CardTitle>
        <CardDescription>Последние 10 упоминаний бренда</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => {
            const mentions = mentionsByTab[tab.value] ?? []
            const isLoading = loadingTab[tab.value] ?? true

            return (
              <TabsContent key={tab.value} value={tab.value}>
                {isLoading ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Заголовок</TableHead>
                        <TableHead>Текст</TableHead>
                        <TableHead className="w-28">Тональность</TableHead>
                        <TableHead className="w-20 text-right">Релев.</TableHead>
                        <TableHead className="w-32 text-right">Время</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <TableRow key={`mentions-table-skeleton-${idx}`}>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-12" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="ml-auto h-4 w-20" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Заголовок</TableHead>
                        <TableHead>Текст</TableHead>
                        <TableHead className="w-28">Тональность</TableHead>
                        <TableHead className="w-20 text-right">Релев.</TableHead>
                        <TableHead className="w-32 text-right">Время</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mentions.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            <a href={m.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {m.title}
                            </a>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{m.text}</TableCell>
                          <TableCell>
                            {sentimentBadge[m.sentiment_label] && (
                              <Badge variant="secondary" className={sentimentBadge[m.sentiment_label].className}>
                                {sentimentBadge[m.sentiment_label].label}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {Math.round(m.relevance_score * 100)}%
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {timeAgo(m.published_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {mentions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Нет упоминаний
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </CardContent>
    </Card>
  )
}
