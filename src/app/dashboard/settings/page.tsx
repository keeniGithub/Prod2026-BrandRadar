'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Save, Trash2, Plus, Pencil, Check, Loader2, RefreshCw, Brain } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import toast from 'react-hot-toast'
import { useBrand } from '@/components/brand-context'
import { updateBrand, deleteBrand } from '@/app/api/brands'
import { getSources, updateSource, deleteSource } from '@/app/api/sources'
import { Source } from '@/app/config/sources'
import CreateSourceDialog from '@/components/create-source-dialog'
import CreateAlertRuleDialog from '@/components/create-alert-rule-dialog'
import { getAlertRules, updateAlertRule, deleteAlertRule } from '@/app/api/alerts'
import { getRetrainStatus, triggerRetrain, type RetrainStatus } from '@/app/api/feedback'
import { AlertRule, SENTIMENT_OPTIONS, SENTIMENT_LABELS, type SentimentFilter } from '@/app/config/alert'
import { TagInput } from '@/components/tag-input'

export default function Settings() {
  const { selectedBrand, refreshBrands } = useBrand()

  const [brandName, setBrandName] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [exclusions, setExclusions] = useState<string[]>([])
  const [riskWords, setRiskWords] = useState<string[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(true)
  const [createSourceOpen, setCreateSourceOpen] = useState(false)
  const [createAlertRuleOpen, setCreateAlertRuleOpen] = useState(false)
  const [alertRules, setAlertRules] = useState<AlertRule[]>([])
  const [rulesLoading, setRulesLoading] = useState(true)
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ threshold: 0, window_seconds: 0, cooldown_seconds: 0, sentiment_filter: 'negative' as SentimentFilter })
  const [retrainStatus, setRetrainStatus] = useState<RetrainStatus | null>(null)
  const [retrainLoading, setRetrainLoading] = useState(false)

  // --- Состояния диалогов подтверждения деструктивных действий ---
  const [deleteBrandDialogOpen, setDeleteBrandDialogOpen] = useState(false)
  const [deleteSourceTarget, setDeleteSourceTarget] = useState<Source | null>(null)
  const [deleteRuleTarget, setDeleteRuleTarget] = useState<AlertRule | null>(null)

  const fetchSources = useCallback(async () => {
    try {
      const response = await getSources()
      if (response.status === 200) {
        setSources(response.data)
      }
    } catch (err) {
      console.error('[Settings] Ошибка загрузки источников:', err)
    } finally {
      setSourcesLoading(false)
    }
  }, [])

  const fetchAlertRules = useCallback(async () => {
    if (!selectedBrand?.id) {
      setRulesLoading(false)
      return
    }
    try {
      const response = await getAlertRules(selectedBrand.id)
      if (response.status === 200) {
        setAlertRules(response.data)
      }
    } catch (err) {
      console.error('[Settings] Ошибка загрузки правил алертов:', err)
    } finally {
      setRulesLoading(false)
    }
  }, [selectedBrand?.id])

  const fetchRetrainStatus = useCallback(async () => {
    try {
      const response = await getRetrainStatus()
      if (response.status === 200) {
        setRetrainStatus(response.data)
      }
    } catch {
      // ML сервис может быть недоступен в локальной среде — graceful degradation
    }
  }, [])

  useEffect(() => {
    fetchSources()
  }, [fetchSources])

  useEffect(() => {
    fetchAlertRules()
  }, [fetchAlertRules])

  useEffect(() => {
    fetchRetrainStatus()
    const interval = setInterval(fetchRetrainStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchRetrainStatus])

  const handleToggleSource = async (source: Source) => {
    const newEnabled = !source.is_enabled
    // Оптимистичное обновление: мгновенно применяем изменение в UI
    setSources((prev) =>
      prev.map((s) => (s.id === source.id ? { ...s, is_enabled: newEnabled } : s))
    )
    try {
      const response = await updateSource(source.id, { name: source.name, config: source.config, is_enabled: newEnabled })
      if (response.status !== 200) {
        // Откат при ошибке сервера
        setSources((prev) =>
          prev.map((s) => (s.id === source.id ? { ...s, is_enabled: source.is_enabled } : s))
        )
        toast.error('Ошибка при обновлении источника')
      }
    } catch (err) {
      console.error('[Settings] Ошибка переключения источника:', err)
      // Откат при сетевой ошибке
      setSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, is_enabled: source.is_enabled } : s))
      )
      toast.error('Ошибка при обновлении источника')
    }
  }

  const handleDeleteSourceConfirmed = async () => {
    if (!deleteSourceTarget) return
    const source = deleteSourceTarget
    setDeleteSourceTarget(null)
    const promise = deleteSource(source.id).then(async (response) => {
      if (response.status === 204) {
        await fetchSources()
        return response
      }
      throw new Error('Ошибка при удалении')
    })
    toast.promise(promise, {
      loading: 'Удаление...',
      success: 'Источник удалён',
      error: 'Ошибка при удалении источника',
    })
  }

  useEffect(() => {
    if (selectedBrand) {
      setBrandName(selectedBrand.name)
      setKeywords(selectedBrand.keywords)
      setExclusions(selectedBrand.exclusions)
      setRiskWords(selectedBrand.risk_keywords)
    }
  }, [selectedBrand])

  const hasChanges = useMemo(() => {
    if (!selectedBrand) return false
    return (
      brandName !== selectedBrand.name ||
      JSON.stringify(keywords) !== JSON.stringify(selectedBrand.keywords) ||
      JSON.stringify(exclusions) !== JSON.stringify(selectedBrand.exclusions) ||
      JSON.stringify(riskWords) !== JSON.stringify(selectedBrand.risk_keywords)
    )
  }, [selectedBrand, brandName, keywords, exclusions, riskWords])

  useEffect(() => {
    if (!hasChanges) return
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges])

  const router = useRouter()
  const originalPush = router.push

  useEffect(() => {
    if (!hasChanges) return

    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('http')) return
      if (!confirm('У вас есть несохранённые изменения. Покинуть страницу?')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [hasChanges, originalPush])

  const handleReset = () => {
    if (selectedBrand) {
      setBrandName(selectedBrand.name)
      setKeywords(selectedBrand.keywords)
      setExclusions(selectedBrand.exclusions)
      setRiskWords(selectedBrand.risk_keywords)
      toast.success('Изменения сброшены')
    }
  }

  const handleSave = async () => {
    if (!selectedBrand) return
    const promise = updateBrand(selectedBrand.id, {
      name: brandName,
      keywords,
      exclusions,
      risk_keywords: riskWords,
    }).then(async (response) => {
      if (response.status === 200) {
        await refreshBrands()
        return response
      }
      throw new Error('Ошибка при сохранении')
    })
    toast.promise(promise, {
      loading: 'Сохранение...',
      success: 'Настройки сохранены',
      error: 'Ошибка при сохранении',
    })
  }

  const handleDeleteBrandConfirmed = async () => {
    if (!selectedBrand) return
    setDeleteBrandDialogOpen(false)
    const promise = deleteBrand(selectedBrand.id).then(async (response) => {
      if (response.status === 204) {
        await refreshBrands()
        return response
      }
      throw new Error('Ошибка при удалении')
    })
    toast.promise(promise, {
      loading: 'Удаление...',
      success: 'Бренд удалён',
      error: 'Ошибка при удалении',
    })
  }

  return (
    <div className='w-full space-y-8 py-6 px-6'>
      <div>
        <h1 className='text-2xl font-bold'>Настройки бренда</h1>
        <p className='text-sm text-muted-foreground'>
          Редактируйте параметры мониторинга вашего бренда
        </p>
      </div>

      <div className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='brand-name'>Название бренда</Label>
          <Input
            id='brand-name'
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder='TechCorp'
          />
        </div>

        <Separator />

        <div className='space-y-2'>
          <Label>Ключевые слова для поиска</Label>
          <p className='text-sm text-green-600'>
            Система будет искать упоминания по этим словам
          </p>
          <TagInput
            tags={keywords}
            onTagsChange={setKeywords}
            placeholder='Добавить слово... (пробел или Enter)'
            variant='green'
          />
        </div>

        <Separator />

        <div className='space-y-2'>
          <Label>Слова-исключения</Label>
          <p className='text-sm text-zinc-500'>
            Публикации с этими словами будут игнорироваться
          </p>
          <TagInput
            tags={exclusions}
            onTagsChange={setExclusions}
            placeholder='Добавить исключение... (пробел или Enter)'
          />
        </div>

        <Separator />

        <div className='space-y-2'>
          <Label>Risk-слова (усиливают негатив)</Label>
          <p className='text-sm text-red-500'>
            При наличии этих слов риск повышается автоматически
          </p>
          <TagInput
            tags={riskWords}
            onTagsChange={setRiskWords}
            placeholder='Добавить risk-слово... (пробел или Enter)'
            variant='red'
          />
        </div>

        <Separator />

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>Источники данных</Label>
            <Button variant='outline' size='sm' onClick={() => setCreateSourceOpen(true)}>
              <Plus className='mr-1 size-4' />
              Добавить
            </Button>
          </div>

          {sourcesLoading ? (
            <div className='space-y-2 py-1'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`source-skeleton-${idx}`} className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-4 w-40' />
                      <Skeleton className='h-5 w-12 rounded-full' />
                    </div>
                    <Skeleton className='h-3 w-56' />
                  </div>
                  <Skeleton className='h-6 w-10 rounded-full' />
                </div>
              ))}
            </div>
          ) : sources.length === 0 ? (
            <p className='text-sm text-muted-foreground py-4 text-center'>Источники не найдены</p>
          ) : (
            <div className='space-y-1'>
              {sources.map((source) => (
                <div key={source.id} className='flex items-center justify-between rounded-lg border p-3'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium'>{source.name}</p>
                      <span className='rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 uppercase'>
                        {source.source_type}
                      </span>
                    </div>
                    <p className='text-xs text-zinc-500 truncate'>
                      {source.source_type === 'telegram' && source.config?.channel
                        ? `@${source.config.channel}`
                        : source.source_type === 'rss' && source.config?.url
                          ? String(source.config.url)
                          : source.collector_status === 'error'
                            ? source.error_message || 'Ошибка'
                            : 'Активен'}
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {!['Telegram', 'RSS', 'Web'].includes(source.name) && (
                      <Button
                        variant='ghost'
                        size='sm'
                        className='size-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50'
                        onClick={() => setDeleteSourceTarget(source)}
                      >
                        <Trash2 className='size-3.5' />
                      </Button>
                    )}
                    <Switch
                      checked={source.is_enabled}
                      onCheckedChange={() => handleToggleSource(source)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateSourceDialog
          open={createSourceOpen}
          onOpenChange={setCreateSourceOpen}
          onCreated={fetchSources}
        />

        <Separator />

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <Label>Правила алертов</Label>
              <p className='text-sm text-muted-foreground'>Настройте пороги и окна наблюдения</p>
            </div>
            <Button variant='outline' size='sm' onClick={() => setCreateAlertRuleOpen(true)}>
              <Plus className='mr-1 size-4' />
              Добавить
            </Button>
          </div>

          {rulesLoading ? (
            <div className='space-y-2 py-1'>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={`rule-skeleton-${idx}`} className='rounded-lg border p-3 space-y-2'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-4 w-28' />
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-28' />
                    <Skeleton className='h-5 w-16 rounded-full' />
                  </div>
                  <div className='flex items-center justify-between'>
                    <Skeleton className='h-3 w-44' />
                    <div className='flex items-center gap-2'>
                      <Skeleton className='h-8 w-8' />
                      <Skeleton className='h-8 w-8' />
                      <Skeleton className='h-6 w-10 rounded-full' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : alertRules.length === 0 ? (
            <p className='text-sm text-muted-foreground py-4 text-center'>Правила не найдены</p>
          ) : (
            <div className='space-y-1'>
              {alertRules.map((rule) => (
                <div key={rule.id} className='rounded-lg border p-3 space-y-2'>
                  {editingRuleId === rule.id ? (
                    <div className='space-y-3'>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <Label className='text-xs'>Порог</Label>
                          <Input type='number' min={1} value={editForm.threshold} onChange={(e) => setEditForm((f) => ({ ...f, threshold: Number(e.target.value) }))} />
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs'>Окно (сек)</Label>
                          <Input type='number' min={60} step={60} value={editForm.window_seconds} onChange={(e) => setEditForm((f) => ({ ...f, window_seconds: Number(e.target.value) }))} />
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs'>Кулдаун (сек)</Label>
                          <Input type='number' min={60} step={60} value={editForm.cooldown_seconds} onChange={(e) => setEditForm((f) => ({ ...f, cooldown_seconds: Number(e.target.value) }))} />
                        </div>
                        <div className='space-y-1'>
                          <Label className='text-xs'>Тональность</Label>
                          <div className='flex gap-1'>
                            {SENTIMENT_OPTIONS.map((option) => (
                              <Button key={option.value} type='button' size='sm' variant={editForm.sentiment_filter === option.value ? 'default' : 'outline'} className='text-xs px-2 h-8' onClick={() => setEditForm((f) => ({ ...f, sentiment_filter: option.value }))}>
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className='flex gap-2 justify-end'>
                        <Button variant='ghost' size='sm' onClick={() => setEditingRuleId(null)}>Отмена</Button>
                        <Button size='sm' onClick={async () => {
                          const promise = updateAlertRule(rule.id, { ...editForm, is_enabled: rule.is_enabled }).then(async (res) => {
                            if (res.status === 200) { await fetchAlertRules(); setEditingRuleId(null); return res }
                            throw new Error('Ошибка')
                          })
                          toast.promise(promise, { loading: 'Сохранение...', success: 'Правило обновлено', error: 'Ошибка при обновлении' })
                        }}>
                          <Check className='mr-1 size-3' />Сохранить
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center justify-between'>
                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='text-sm font-medium'>Порог: {rule.threshold}</span>
                          <span className='text-xs text-zinc-500'>•</span>
                          <span className='text-xs text-zinc-500'>Окно: {rule.window_seconds >= 3600 ? `${Math.floor(rule.window_seconds / 3600)}ч ${Math.round((rule.window_seconds % 3600) / 60)}м` : `${Math.round(rule.window_seconds / 60)}м`}</span>
                          <span className='text-xs text-zinc-500'>•</span>
                          <span className='text-xs text-zinc-500'>Кулдаун: {rule.cooldown_seconds >= 3600 ? `${Math.floor(rule.cooldown_seconds / 3600)}ч ${Math.round((rule.cooldown_seconds % 3600) / 60)}м` : `${Math.round(rule.cooldown_seconds / 60)}м`}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${rule.sentiment_filter === 'negative' ? 'bg-red-100 text-red-600' : rule.sentiment_filter === 'positive' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            {SENTIMENT_LABELS[rule.sentiment_filter]}
                          </span>
                        </div>
                        {rule.last_fired_at && (
                          <p className='text-xs text-zinc-400 mt-0.5'>Последний: {new Date(rule.last_fired_at).toLocaleString('ru-RU')}</p>
                        )}
                      </div>
                      <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='sm' className='size-8 p-0' onClick={() => { setEditingRuleId(rule.id); setEditForm({ threshold: rule.threshold, window_seconds: rule.window_seconds, cooldown_seconds: rule.cooldown_seconds, sentiment_filter: rule.sentiment_filter }) }}>
                          <Pencil className='size-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50'
                          onClick={() => setDeleteRuleTarget(rule)}
                        >
                          <Trash2 className='size-3.5' />
                        </Button>
                        <Switch checked={rule.is_enabled} onCheckedChange={async (checked) => {
                          setAlertRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_enabled: checked } : r))
                          try {
                            const res = await updateAlertRule(rule.id, { threshold: rule.threshold, window_seconds: rule.window_seconds, cooldown_seconds: rule.cooldown_seconds, sentiment_filter: rule.sentiment_filter, is_enabled: checked })
                            if (res.status !== 200) {
                              setAlertRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_enabled: !checked } : r))
                              toast.error('Ошибка при обновлении')
                            }
                          } catch (err) {
                            console.error('[Settings] Ошибка переключения правила алерта:', err)
                            setAlertRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_enabled: !checked } : r))
                            toast.error('Ошибка при обновлении')
                          }
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <CreateAlertRuleDialog
          open={createAlertRuleOpen}
          onOpenChange={setCreateAlertRuleOpen}
          onCreated={fetchAlertRules}
        />

        <Separator />

        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Brain className='size-4 text-muted-foreground' />
            <Label>ML модель</Label>
          </div>

          {retrainStatus ? (
            <div className='space-y-4 rounded-lg border p-4'>
              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-xs text-muted-foreground'>Фидбеков собрано</p>
                  <p className='font-medium'>{retrainStatus.feedback_count}</p>
                </div>
                <div>
                  <p className='text-xs text-muted-foreground'>Последнее обучение</p>
                  <p className='font-medium'>
                    {retrainStatus.trained_at
                      ? new Date(retrainStatus.trained_at).toLocaleString('ru-RU')
                      : '—'}
                  </p>
                </div>
              </div>

              {retrainStatus.last_error && (
                <p className='text-xs text-red-500'>Ошибка: {retrainStatus.last_error}</p>
              )}

              <Button
                className='w-full'
                variant='outline'
                disabled={retrainStatus.is_training || retrainLoading}
                onClick={async () => {
                  setRetrainLoading(true)
                  try {
                    await triggerRetrain()
                    await fetchRetrainStatus()
                    toast.success('Дообучение запущено в фоне')
                  } catch (err) {
                    console.error('[Settings] Ошибка запуска дообучения:', err)
                    toast.error('Ошибка при запуске дообучения')
                  } finally {
                    setRetrainLoading(false)
                  }
                }}
              >
                {retrainStatus.is_training ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Обучение...
                  </>
                ) : (
                  <>
                    <RefreshCw className='mr-2 size-4' />
                    Переобучить сейчас
                  </>
                )}
              </Button>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground'>ML сервис недоступен</p>
          )}
        </div>
      </div>

      <div className='flex justify-between pt-2 flex-col md:flex-row gap-4'>
        <Button variant='destructive' onClick={() => setDeleteBrandDialogOpen(true)}>
          <Trash2 className='mr-2 size-4' />
          Удалить бренд
        </Button>
        <div className='flex gap-3 flex-col md:flex-row'>
          <Button variant='outline' onClick={handleReset} disabled={!hasChanges} className='w-full md:w-auto'>Сбросить</Button>
          <Button onClick={handleSave} disabled={!hasChanges} className='w-full md:w-auto'>
            <Save className='mr-2 size-4' />
            Сохранить
          </Button>
        </div>
      </div>

      {hasChanges && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 rounded-lg border bg-white px-5 py-3 shadow-lg'>
          <span className='text-sm font-medium text-amber-600'>У вас есть несохранённые изменения</span>
          <Button size='sm' variant='outline' onClick={handleReset}>Сбросить</Button>
          <Button size='sm' onClick={handleSave}>
            <Save className='mr-2 size-3' />
            Сохранить
          </Button>
        </div>
      )}

      {/* Диалоги подтверждения деструктивных действий */}
      <ConfirmDialog
        open={deleteBrandDialogOpen}
        title='Удалить бренд'
        description={`Вы уверены, что хотите удалить бренд "${selectedBrand?.name}"? Это действие необратимо.`}
        confirmLabel='Удалить бренд'
        onConfirm={handleDeleteBrandConfirmed}
        onCancel={() => setDeleteBrandDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteSourceTarget !== null}
        title='Удалить источник'
        description={`Удалить источник "${deleteSourceTarget?.name}"? Данные, собранные из него, сохранятся.`}
        onConfirm={handleDeleteSourceConfirmed}
        onCancel={() => setDeleteSourceTarget(null)}
      />

      <ConfirmDialog
        open={deleteRuleTarget !== null}
        title='Удалить правило алерта'
        description='Удалить это правило? Алерты, уже отправленные по нему, сохранятся.'
        onConfirm={async () => {
          if (!deleteRuleTarget) return
          const rule = deleteRuleTarget
          setDeleteRuleTarget(null)
          const promise = deleteAlertRule(rule.id).then(async (res) => {
            if (res.status === 200 || res.status === 204) { await fetchAlertRules(); return res }
            throw new Error('Ошибка')
          })
          toast.promise(promise, { loading: 'Удаление...', success: 'Правило удалено', error: 'Ошибка при удалении' })
        }}
        onCancel={() => setDeleteRuleTarget(null)}
      />
    </div>
  )
}
