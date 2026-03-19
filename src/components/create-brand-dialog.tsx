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
import { Separator } from '@/components/ui/separator'
import toast from 'react-hot-toast'
import { createBrand } from '@/app/api/brands'
import { useBrand } from '@/components/brand-context'
import { TagInput } from '@/components/tag-input'

interface CreateBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateBrandDialog({ open, onOpenChange }: CreateBrandDialogProps) {
  const { setSelectedBrand, refreshBrands } = useBrand()
  const [brandName, setBrandName] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [exclusions, setExclusions] = useState<string[]>([])
  const [riskWords, setRiskWords] = useState<string[]>([])

  const handleCreate = async () => {
    if (!brandName.trim()) {
      toast.error('Введите название бренда')
      return
    }
    const promise = createBrand({
      name: brandName,
      keywords,
      exclusions,
      risk_keywords: riskWords,
    }).then(async (response) => {
      if (response.status === 200 || response.status === 201) {
        setSelectedBrand(response.data)
        await refreshBrands()
        onOpenChange(false)
        setBrandName('')
        setKeywords([])
        setExclusions([])
        setRiskWords([])
        return response
      }
      throw new Error('Ошибка при создании')
    })
    toast.promise(promise, {
      loading: 'Создание бренда...',
      success: 'Бренд создан',
      error: 'Ошибка при создании бренда',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Создать новый бренд</DialogTitle>
        </DialogHeader>

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
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreate}>Создать</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}