'use client'

import { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { TAG_COLOR_CLASSES, type Tag } from '@/app/config/settings'

export function TagInput({
  tags,
  onTagsChange,
  placeholder,
  variant = 'default',
}: Tag) {
  const [input, setInput] = useState('')

  function addTag() {
    const nextTag = input.trim()
    if (!nextTag) return
    if (!tags.includes(nextTag)) {
      onTagsChange([...tags, nextTag])
    }
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      addTag()
    }
  }

  function removeTag(tag: string) {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className='flex flex-wrap items-center gap-2 rounded-md border border-input bg-transparent px-2.5 py-1.5'>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm ${TAG_COLOR_CLASSES[variant]}`}
        >
          {tag}
          <button
            type='button'
            onClick={() => removeTag(tag)}
            className='ml-0.5 rounded-full hover:opacity-70'
          >
            <X className='size-3' />
          </button>
        </span>
      ))}
      <input
        className='min-w-30 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground'
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  )
}
