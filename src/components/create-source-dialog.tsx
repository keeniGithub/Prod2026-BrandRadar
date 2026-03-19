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
import { createSource } from '@/app/api/sources'
import {
  FORBIDDEN_SOURCE_NAME_CHARS_GLOBAL_REGEX,
  FORBIDDEN_SOURCE_NAME_CHARS_REGEX,
  MAX_SOURCE_NAME_LENGTH,
  TELEGRAM_CHANNEL_REGEX,
  type SourceDialogType,
} from '@/app/config/sources'

interface CreateSourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export default function CreateSourceDialog({ open, onOpenChange, onCreated }: CreateSourceDialogProps) {
  const [sourceType, setSourceType] = useState<SourceDialogType>('telegram')
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('')
  const [rssUrl, setRssUrl] = useState('')
  const [nameError, setNameError] = useState('')
  const [channelError, setChannelError] = useState('')
  const [rssUrlError, setRssUrlError] = useState('')

  const handleNameChange = (value: string) => {
    const sanitizedValue = value.replace(FORBIDDEN_SOURCE_NAME_CHARS_GLOBAL_REGEX, '').slice(0, MAX_SOURCE_NAME_LENGTH)
    setName(sanitizedValue)
    if (nameError) {
      setNameError('')
    }
  }

  const handleChannelChange = (value: string) => {
    setChannel(value)
    if (channelError) {
      setChannelError('')
    }
  }

  const handleRssUrlChange = (value: string) => {
    setRssUrl(value)
    if (rssUrlError) {
      setRssUrlError('')
    }
  }

  const resetForm = () => {
    setName('')
    setChannel('')
    setRssUrl('')
    setSourceType('telegram')
    setNameError('')
    setChannelError('')
    setRssUrlError('')
  }

  const handleCreate = async () => {
    setNameError('')
    setChannelError('')
    setRssUrlError('')

    const normalizedName = name.trim()

    if (!normalizedName) {
      setNameError('Введите название источника')
      return
    }

    if (normalizedName.length > MAX_SOURCE_NAME_LENGTH) {
      setNameError(`Название не должно быть длиннее ${MAX_SOURCE_NAME_LENGTH} символов`)
      return
    }

    if (FORBIDDEN_SOURCE_NAME_CHARS_REGEX.test(normalizedName)) {
      setNameError('Название содержит запрещенные символы')
      return
    }

    const normalizedChannel = channel.trim().replace(/^@+/, '')
    const normalizedRssUrl = rssUrl.trim()

    if (sourceType === 'telegram') {
      if (!normalizedChannel) {
        setChannelError('Введите имя Telegram-канала')
        return
      }

      if (!TELEGRAM_CHANNEL_REGEX.test(normalizedChannel)) {
        setChannelError('Только a-z, A-Z, 0-9 и _. Длина: от 4 до 32 символов')
        return
      }
    }

    if (sourceType === 'rss' && !normalizedRssUrl) {
      setRssUrlError('Введите URL RSS-ленты')
      return
    }

    const config = sourceType === 'telegram'
      ? { channel: normalizedChannel }
      : { url: normalizedRssUrl }

    const promise = createSource({
      source_type: sourceType,
      name: normalizedName,
      is_enabled: true,
      config,
    }).then(async (response) => {
      if (response.status === 200 || response.status === 201) {
        onCreated()
        onOpenChange(false)
        resetForm()
        return response
      }
      throw new Error('Ошибка при создании')
    })

    toast.promise(promise, {
      loading: 'Создание источника...',
      success: 'Источник создан',
      error: 'Ошибка при создании источника',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Добавить источник данных</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>Тип источника</Label>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant={sourceType === 'telegram' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSourceType('telegram')}
              >
                Telegram
              </Button>
              <Button
                type='button'
                variant={sourceType === 'rss' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setSourceType('rss')}
              >
                RSS
              </Button>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='source-name'>Название</Label>
            <Input
              id='source-name'
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              maxLength={MAX_SOURCE_NAME_LENGTH}
              placeholder={sourceType === 'telegram' ? 'Мой Telegram канал' : 'Моя RSS лента'}
            />
            {nameError && <p className='text-xs text-destructive'>{nameError}</p>}
            <p className='text-xs text-muted-foreground'>
              До {MAX_SOURCE_NAME_LENGTH} символов. Разрешены буквы, цифры, пробел, . _ -
            </p>
          </div>

          {sourceType === 'telegram' ? (
            <div className='space-y-2'>
              <Label htmlFor='tg-channel'>Канал / username</Label>
              <Input
                id='tg-channel'
                value={channel}
                onChange={(e) => handleChannelChange(e.target.value)}
                placeholder='channel_name'
                minLength={4}
                maxLength={32}
              />
              {channelError && <p className='text-xs text-destructive'>{channelError}</p>}
              <p className='text-xs text-muted-foreground'>
                Тег без @. Например: brand_radar_case
              </p>
            </div>
          ) : (
            <div className='space-y-2'>
              <Label htmlFor='rss-url'>URL ленты</Label>
              <Input
                id='rss-url'
                value={rssUrl}
                onChange={(e) => handleRssUrlChange(e.target.value)}
                placeholder='https://example.com/rss'
              />
              {rssUrlError && <p className='text-xs text-destructive'>{rssUrlError}</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => { onOpenChange(false); resetForm() }}>
            Отмена
          </Button>
          <Button onClick={handleCreate}>Добавить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
