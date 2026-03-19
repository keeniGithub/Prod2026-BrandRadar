"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function Filters() {
  const [tonality, setTonality] = useState("all")
  const [riskLevel, setRiskLevel] = useState("all")
  const [relevance, setRelevance] = useState("all")
  const [source, setSource] = useState("all")
  const [search, setSearch] = useState("")

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Тональность</Label>
        <Select value={tonality} onValueChange={setTonality}>
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
        <Label>Уровень риска</Label>
        <Select value={riskLevel} onValueChange={setRiskLevel}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Все" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="medium">Средний</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
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
            <SelectItem value="medium">Средняя (0.5-0.8) </SelectItem>
            <SelectItem value="low">Низкая (&lt; 0.5)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Тип источника</Label>
        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Все" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="messanger">Мессенджеры</SelectItem>
            <SelectItem value="social">Соц. Сети</SelectItem>
            <SelectItem value="forum">Форумы</SelectItem>
            <SelectItem value="media">СМИ</SelectItem>
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
        />
      </div>

      <Button className="bg-[#4fd168] text-white hover:bg-[#47bf5f]">
        <RefreshCw className="size-4" />
        Обновить
      </Button>
    </div>
  )
}
