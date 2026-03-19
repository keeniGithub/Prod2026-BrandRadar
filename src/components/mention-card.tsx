"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Link2, Smile } from "lucide-react"
import { cn } from "@/lib/utils"
import { MentionCardProps, riskConfig, sentimentConfig } from "@/app/config/card"

function highlightText(text: string, words: string[]) {
  if (!words.length) return text

  const escaped = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const regex = new RegExp(`(${escaped.join("|")})`, "gi")
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (regex.test(part)) {
      regex.lastIndex = 0
      return (
        <mark key={i} className="rounded-sm bg-blue-200 px-0.5">
          {part}
        </mark>
      )
    }
    return part
  })
}

export function MentionCard({
  source,
  sourceIcon,
  timeAgo,
  sentiment,
  relevance,
  riskLevel,
  text,
  highlightWords = [],
  cluster,
  whyImportant,
  sources,
}: MentionCardProps) {
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const sConfig = sentimentConfig[sentiment]

  return (
    <div
      className={cn(
        "rounded-xl border border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        sConfig.border
      )}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {sourceIcon && <span>{sourceIcon}</span>}
          <span className="font-semibold text-gray-800">{source}</span>
          <span className="text-gray-400">|</span>
          <span>{timeAgo}</span>
        </div>

        <div className="flex items-center gap-2">
          {riskLevel && riskConfig[riskLevel] && (
            <span
              className={cn(
                "rounded-md px-2.5 py-0.5 text-xs font-bold",
                riskConfig[riskLevel].bg,
                riskConfig[riskLevel].text
              )}
            >
              {riskConfig[riskLevel].label}
            </span>
          )}
          <span className="rounded-md bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Релевантность: {relevance}%
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-medium",
              sConfig.bg,
              sConfig.color
            )}
          >
            <Smile className="w-3 h-3"/>
            {sConfig.label}
          </span>
        </div>
      </div>

      <p className="mb-3 text-base leading-relaxed text-gray-800">
        {highlightText(text, highlightWords)}
      </p>

      {cluster && (
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
            {cluster.label}
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
            {cluster.similarCount} похожих
          </span>
        </div>
      )}

      <div className={cn("mb-3 rounded-lg px-4 py-2.5", sConfig.bg)}>
        <span className="font-semibold text-gray-700">Почему это важно: </span>
        <span className="text-gray-600">{whyImportant}</span>
      </div>

      <button
        type="button"
        onClick={() => setSourcesOpen(!sourcesOpen)}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-teal-600 transition-colors hover:bg-gray-50"
      >
        <Link2 className="size-3.5" />
        Источники ({sources.length})
        {sourcesOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
      </button>

      {sourcesOpen && (
        <ul className="mt-2 space-y-1 pl-4">
          {sources.map((s, i) => (
            <li key={i} className="text-sm">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 underline hover:text-teal-800"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
