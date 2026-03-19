import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExternalLink } from "lucide-react"
import { Mention } from "./types"
import { highlightText } from "./mentions-feed"
import toast from "react-hot-toast"
import { sendMlFeedback, patchMentionFeedback } from "@/app/api/feedback"
import { getSimilar } from "@/app/api/mentions"
import type { SimilarMention } from "@/app/config/mentions"
import type {
  FeedbackField,
  RelevanceFeedbackValue,
  SentimentFeedbackValue,
} from "@/app/config/feedback"

export interface MentionModalProps {
  open: boolean
  onClose: () => void
  mention: Mention | null
  onMentionUpdate?: (updated: Mention) => void
  keywords?: string[]
  riskKeywords?: string[]
  searchQuery?: string
}



function formatDateTime(dt: string): string {
  if (!dt) return ""
  const d = new Date(dt)
  const pad = (n: number) => n.toString().padStart(2, "0")
  const day = pad(d.getDate())
  const month = pad(d.getMonth() + 1)
  const year = d.getFullYear()
  const hours = pad(d.getHours())
  const mins = pad(d.getMinutes())
  return `${day}.${month}.${year} ${hours}:${mins}`
}

export const MentionModal: React.FC<MentionModalProps> = ({ open, onClose, mention, onMentionUpdate, keywords = [], riskKeywords = [], searchQuery = "" }) => {
  const [feedbackField, setFeedbackField] = React.useState<FeedbackField>("sentiment")
  const [sentimentCorrect, setSentimentCorrect] = React.useState<SentimentFeedbackValue>("neutral")
  const [relevanceCorrect, setRelevanceCorrect] = React.useState<RelevanceFeedbackValue>("uncertain")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submittedKeys, setSubmittedKeys] = React.useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("ml_feedback_submitted")
      return new Set(raw ? JSON.parse(raw) : [])
    } catch { return new Set() }
  })
  const [similar, setSimilar] = React.useState<SimilarMention[]>([])
  const [similarLoading, setSimilarLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open || !mention) {
      setSimilar([])
      return
    }

    setSimilarLoading(true)
    getSimilar(mention.id)
      .then((res) => {
        if (res.status === 200) {
          setSimilar(res.data)
        }
      })
      .finally(() => setSimilarLoading(false))
  }, [open, mention?.id])


  React.useEffect(() => {
    if (!mention) return

    if (
      mention.sentiment_label === "positive" ||
      mention.sentiment_label === "neutral" ||
      mention.sentiment_label === "negative"
    ) {
      setSentimentCorrect(mention.sentiment_label)
    } else {
      setSentimentCorrect("neutral")
    }

    if (
      mention.relevance_label === "relevant" ||
      mention.relevance_label === "uncertain" ||
      mention.relevance_label === "irrelevant"
    ) {
      setRelevanceCorrect(mention.relevance_label)
    } else {
      setRelevanceCorrect("uncertain")
    }
  }, [mention])

  if (!mention) return null

  const predictedSentiment: SentimentFeedbackValue =
    mention.sentiment_label === "positive" ||
    mention.sentiment_label === "neutral" ||
    mention.sentiment_label === "negative"
      ? mention.sentiment_label
      : "neutral"

  const predictedRelevance: RelevanceFeedbackValue =
    mention.relevance_label === "relevant" ||
    mention.relevance_label === "uncertain" ||
    mention.relevance_label === "irrelevant"
      ? mention.relevance_label
      : "uncertain"

  const predictedValue = feedbackField === "sentiment" ? predictedSentiment : predictedRelevance
  const correctValue = feedbackField === "sentiment" ? sentimentCorrect : relevanceCorrect

  const submitFeedback = async () => {
    setIsSubmitting(true)
    try {
      await sendMlFeedback({
        mention_id: mention.id,
        field: feedbackField,
        predicted: predictedValue,
        correct: correctValue,
        title: mention.title ?? "",
        text: mention.text ?? "",
      })

      const patchData = feedbackField === "sentiment"
        ? { sentiment_label: sentimentCorrect }
        : { relevance_label: relevanceCorrect }

      const patchRes = await patchMentionFeedback(mention.id, patchData)
      if (patchRes.status >= 200 && patchRes.status < 300) {
        onMentionUpdate?.(patchRes.data)
        const key = `${mention.id}:${feedbackField}:${correctValue}`
        const next = new Set(submittedKeys).add(key)
        setSubmittedKeys(next)
        try { localStorage.setItem("ml_feedback_submitted", JSON.stringify([...next])) } catch { /* ignore */ }
        toast.success("Фидбек сохранён")
      } else {
        toast.error("Не удалось сохранить фидбек")
      }
    } catch {
      toast.error("Ошибка при отправке фидбека")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg md:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{mention.title || "Без заголовка"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Текст + похожие */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400">{formatDateTime(mention.published_at)}</div>
            <div className="text-base whitespace-pre-line text-gray-800">
              {highlightText(mention.text, keywords, riskKeywords, searchQuery)}
            </div>
            {(() => {
              const meta = mention.ml_metadata as { top_features?: { word: string; weight: number }[]; is_uncertain?: boolean } | null
              const features = meta?.top_features?.slice(0, 8) ?? []
              if (features.length === 0) return null
              const maxW = Math.max(...features.map(f => Math.abs(f.weight)))
              return (
                <div className="pt-1">
                  <p className="mb-1.5 text-xs text-gray-400">Ключевые сигналы</p>
                  <div className="flex flex-wrap gap-1.5">
                    {features.map((f) => {
                      const intensity = maxW > 0 ? Math.abs(f.weight) / maxW : 0.5
                      return (
                        <span
                          key={f.word}
                          title={`вес: ${f.weight.toFixed(3)}`}
                          className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700"
                          style={{ opacity: 0.5 + intensity * 0.5 }}
                        >
                          {f.word}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
            {mention.url && (
              <a href={mention.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 underline">Источник</a>
            )}

            {(similarLoading || similar.length > 0) && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-sm font-semibold text-gray-800">Похожие публикации</p>
                {similarLoading ? (
                  <p className="text-xs text-gray-400">Загрузка...</p>
                ) : (
                  <div className="max-h-56 space-y-2 overflow-y-auto">
                    {similar.map((s) => (
                      <div key={s.id} className="rounded-lg border bg-gray-50 px-3 py-2 text-sm">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-gray-700">{s.source_name}</span>
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${s.relation === "duplicate" ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"}`}>
                            {s.relation === "duplicate" ? "дубликат" : "похожий"}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-gray-600">{s.text}</p>
                        {s.url && (
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-teal-600 hover:underline"
                          >
                            <ExternalLink className="size-3" />Источник
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Фидбек снизу */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold text-gray-800">Фидбек для ML</p>
            <p className="text-zinc-500">Предсказано: <span className="font-medium text-zinc-600">{predictedValue}</span></p>
            <div className="flex flex-wrap items-end gap-2">
              <Select
                value={feedbackField}
                onValueChange={(v) => setFeedbackField(v as FeedbackField)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Поле" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentiment">Тональность</SelectItem>
                  <SelectItem value="relevance">Релевантность</SelectItem>
                </SelectContent>
              </Select>

              {feedbackField === "sentiment" ? (
                <Select
                  value={sentimentCorrect}
                  onValueChange={(v) => setSentimentCorrect(v as SentimentFeedbackValue)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Верное значение" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">positive</SelectItem>
                    <SelectItem value="neutral">neutral</SelectItem>
                    <SelectItem value="negative">negative</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={relevanceCorrect}
                  onValueChange={(v) => setRelevanceCorrect(v as RelevanceFeedbackValue)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Верное значение" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevant">relevant</SelectItem>
                    <SelectItem value="uncertain">uncertain</SelectItem>
                    <SelectItem value="irrelevant">irrelevant</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button
                type="button"
                onClick={submitFeedback}
                disabled={isSubmitting || submittedKeys.has(`${mention.id}:${feedbackField}:${correctValue}`)}
              >
                {isSubmitting ? "Отправка..." : "Отправить фидбек"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
