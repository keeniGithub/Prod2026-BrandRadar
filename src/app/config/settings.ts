export type Tag = {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder: string
  variant?: 'default' | 'green' | 'red'
}

export type TagVariant = NonNullable<Tag['variant']>

export const TAG_COLOR_CLASSES: Record<TagVariant, string> = {
  default: 'bg-zinc-200 text-zinc-800',
  green: 'bg-green-500 text-white',
  red: 'bg-red-500 text-white',
}