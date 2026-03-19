"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
  /** Управляет видимостью диалога */
  open: boolean
  /** Заголовок диалога */
  title: string
  /** Описание действия, требующего подтверждения */
  description: string
  /** Текст кнопки подтверждения (по умолчанию «Удалить») */
  confirmLabel?: string
  /** Тип кнопки подтверждения — определяет визуальный акцент */
  variant?: "destructive" | "default"
  /** Вызывается при подтверждении */
  onConfirm: () => void
  /** Вызывается при отмене или закрытии */
  onCancel: () => void
}

/**
 * Компонент подтверждения деструктивных действий.
 * Заменяет нативный window.confirm(), который ломает дизайн-систему
 * и блокирует поток рендеринга React.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Удалить",
  variant = "destructive",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter className="flex gap-2 sm:flex-row-reverse">
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Отмена
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
