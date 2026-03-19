'use client'

import React, { useEffect, useState } from 'react'
import { ChevronDown, Menu, Plus } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import CreateBrandDialog from '@/components/create-brand-dialog'
import { useBrand } from '@/components/brand-context'
import { getCollectorLastRun } from '@/app/api/sources'

function timeAgo(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime())
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'только что'
  if (mins < 60) return `${mins} мин. назад`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ч. назад`
  const days = Math.floor(hours / 24)
  return `${days} дн. назад`
}

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { brands, selectedBrand, setSelectedBrand } = useBrand()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  useEffect(() => {
    getCollectorLastRun()
      .then((res) => {
        const collectors = res.data?.collectors
        if (collectors?.length) {
          const latest = collectors.reduce((a, b) =>
            new Date(a.last_fetched_at) > new Date(b.last_fetched_at) ? a : b
          )
          setLastUpdate(latest.last_fetched_at)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <header className='bg-[#e8f2ec] p-4 w-full'>
        <div className='flex items-center gap-3'>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden shrink-0'
          onClick={onMenuClick}
        >
          <Menu className='size-5' />
        </Button>
        <div className='w-full max-w-72'>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
            <Button variant='outline' className='w-full justify-between text-base font-semibold'>
                {selectedBrand?.name ?? 'Выберите бренд'}
                <ChevronDown className='ml-2 size-4' />
            </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
            {brands.map((brand) => (
                <DropdownMenuItem
                key={brand.id}
                onSelect={() => setSelectedBrand(brand)}
                className={brand.id === selectedBrand?.id ? 'font-semibold' : ''}
                >
                {brand.name}
                </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setDialogOpen(true)}>
                <Plus className='mr-2 size-4' />
                Создать новый бренд
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
        </div>
        </div>
      <p className='mt-2 text-zinc-500'>Последнее обновление: {lastUpdate ? timeAgo(lastUpdate) : 'загрузка...'}</p>
      <CreateBrandDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </header>
  )
}
