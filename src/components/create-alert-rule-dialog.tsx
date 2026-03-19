'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { createAlertRule } from '@/app/api/alerts'
import { useBrand } from '@/components/brand-context'
import { SENTIMENT_OPTIONS, type SentimentFilter } from '@/app/config/alert'

interface CreateAlertRuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export default function CreateAlertRuleDialog({ open, onOpenChange, onCreated }: CreateAlertRuleDialogProps) {
  const { selectedBrand } = useBrand()
  const [threshold, setThreshold] = useState(5)
  const [windowSeconds, setWindowSeconds] = useState(3600)
  const [cooldownSeconds, setCooldownSeconds] = useState(3600)
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('negative')
  const [isEnabled, setIsEnabled] = useState(true)

  const resetForm = () => {
    setThreshold(5)
    setWindowSeconds(3600)
    setCooldownSeconds(3600)
    setSentimentFilter('negative')
    setIsEnabled(true)
  }

  const handleCreate = async () => {
    if (!selectedBrand) {
      toast.error('Выберите бренд')
      return
    }
    if (threshold <= 0) {
      toast.error('Порог должен быть больше 0')
      return
    }
    if (windowSeconds <= 0) {
      toast.error('Окно наблюдения должно быть больше 0')
      return
    }

    const promise = createAlertRule({
      brand_id: selectedBrand.id,
      threshold,
      window_seconds: windowSeconds,
      cooldown_seconds: cooldownSeconds,
      sentiment_filter: sentimentFilter,
      is_enabled: isEnabled,
    }).then(async (response) => {
      if (response.status === 200 || response.status === 201) {
        onCreated?.()
        onOpenChange(false)
        resetForm()
        return response
      }
      throw new Error('Ошибка при создании')
    })

    toast.promise(promise, {
      loading: 'Создание правила...',
      success: 'Правило алерта создано',
      error: 'Ошибка при создании правила',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Новое правило алерта</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='threshold'>Порог срабатывания (кол-во упоминаний)</Label>
            <Input
              id='threshold'
              type='number'
              min={1}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
            <p className='text-xs text-muted-foreground'>
              Алерт сработает при достижении этого числа упоминаний
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='window'>Окно наблюдения (секунды)</Label>
            <Input
              id='window'
              type='number'
              min={60}
              step={60}
              value={windowSeconds}
              onChange={(e) => setWindowSeconds(Number(e.target.value))}
            />
            <p className='text-xs text-muted-foreground'>
              Период в секундах для подсчёта упоминаний. {windowSeconds >= 3600 ? `${Math.floor(windowSeconds / 3600)} ч ${Math.round((windowSeconds % 3600) / 60)} мин` : `${Math.round(windowSeconds / 60)} мин`}
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='cooldown'>Кулдаун (секунды)</Label>
            <Input
              id='cooldown'
              type='number'
              min={60}
              step={60}
              value={cooldownSeconds}
              onChange={(e) => setCooldownSeconds(Number(e.target.value))}
            />
            <p className='text-xs text-muted-foreground'>
              Пауза после срабатывания до повторного алерта. {cooldownSeconds >= 3600 ? `${Math.floor(cooldownSeconds / 3600)} ч ${Math.round((cooldownSeconds % 3600) / 60)} мин` : `${Math.round(cooldownSeconds / 60)} мин`}
            </p>
          </div>

          <div className='space-y-2'>
            <Label>Фильтр по тональности</Label>
            <div className='flex gap-2'>
              {SENTIMENT_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type='button'
                  variant={sentimentFilter === opt.value ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSentimentFilter(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <Label htmlFor='is-enabled'>Включено</Label>
            <button
              id='is-enabled'
              type='button'
              role='switch'
              aria-checked={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isEnabled ? 'bg-green-500' : 'bg-zinc-300'}`}
            >
              <span className={`inline-block size-4 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => { onOpenChange(false); resetForm() }}>
            Отмена
          </Button>
          <Button onClick={handleCreate}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
