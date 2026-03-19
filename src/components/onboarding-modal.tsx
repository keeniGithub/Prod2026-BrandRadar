"use client";

import { useState } from "react";
import { HelpCircle, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="h-9 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium text-[#122f3a] hover:bg-[#d7e8df]"
      >
        <HelpCircle className="size-4" />
        Что это?
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="flex flex-col w-[90vw] max-w-none!">
            <DialogTitle className="text-2xl font-bold text-[#122f3a] shrink-0">
              Brand Radar
            </DialogTitle>

            <div className="space-y-6 overflow-y-auto flex-1">
              {/* Что это */}
              <section>
                <h2 className="text-lg font-semibold text-[#122f3a] mb-2">
                  🎯 Что это?
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Brand Radar — это платформа, которая следит за упоминаниями
                  вашего бренда в интернете
                </p>
                <p className="mt-4">
                    Система автоматически собирает
                    упоминания из разных источников, анализирует тональность речи
                    и дает вам полную картину того, что люди говорят о вашем
                    бренде.
                </p>
              </section>

              {/* Для кого */}
              <section>
                <h2 className="text-lg font-semibold text-[#122f3a] mb-2">
                  👥 Для кого это?
                </h2>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Проект создан для компаний, которые заботятся о своей
                  репутации:
                </p>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">✓</span>
                    <span className="text-gray-700">
                      <strong>Маркетинг-команды</strong> — отслеживают
                      эффективность кампаний
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">✓</span>
                    <span className="text-gray-700">
                      <strong>PR-специалисты</strong> — реагируют на кризисы и
                      управляют имиджем
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">✓</span>
                    <span className="text-gray-700">
                      <strong>Руководители</strong> — видят общую картину о
                      здоровье бренда
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">✓</span>
                    <span className="text-gray-700">
                      <strong>E-commerce</strong> и <strong>SaaS</strong> —
                      отслеживают отзывы и feedback
                    </span>
                  </li>
                </ul>
              </section>

              {/* Зачем это нужно */}
              <section>
                <h2 className="text-lg font-semibold text-[#122f3a] mb-2">
                  💡 Зачем это нужно?
                </h2>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">•</span>
                    <span className="text-gray-700">
                      <strong>Быстро реагировать</strong> на критику и
                      негативные упоминания
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">•</span>
                    <span className="text-gray-700">
                      <strong>Анализировать стратегию</strong> на основе реальных
                      данных
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">•</span>
                    <span className="text-gray-700">
                      <strong>Находить возможности</strong> для улучшения
                      продукта
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">•</span>
                    <span className="text-gray-700">
                      <strong>Защищать репутацию</strong> от появления
                      корпоративных кризисов
                    </span>
                  </li>
                </ul>
              </section>

              {/* Сравнение конкурентов */}
              <section>
                <h2 className="text-lg font-semibold text-[#122f3a] mb-4">
                  🏆 Почему Brand Radar лучше?
                </h2>
                <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-[#e8f2ec]">
                      <TableRow className="border-b hover:bg-[#e8f2ec]">
                        <TableHead className="font-semibold text-[#122f3a] py-3">
                          Функция
                        </TableHead>
                        <TableHead className="font-semibold text-[#122f3a] py-3">
                          Brand Radar
                        </TableHead>
                        <TableHead className="font-semibold text-[#122f3a] py-3">
                          Google Alerts
                        </TableHead>
                        <TableHead className="font-semibold text-[#122f3a] py-3">
                          Mention
                        </TableHead>
                        <TableHead className="font-semibold text-[#122f3a] py-3">
                          Talkwalker
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Анализ тональности
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Упоминания в социальных сетях
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Real-time уведомления
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Кастомные алерты
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          ML анализ здоровья бренда
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Управление несколькими брендами
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Доступная цена
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium text-gray-700">
                          Интегрированная аналитика
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <X className="inline text-gray-400" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                        <TableCell className="text-center">
                          <Check className="inline text-[#4fd168]" size={20} />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </section>

              {/* Что где находится */}
              <section>
                <h2 className="text-lg font-semibold text-[#122f3a] mb-2">
                  📊 Вкладки и их назначение
                </h2>
                <div className="space-y-3">
                  <div className="bg-[#e8f2ec] p-3 rounded-lg">
                    <p className="font-semibold text-[#122f3a]">Дашборд</p>
                    <p className="text-sm text-gray-700">
                      Главная страница с быстрым обзором всех важных метрик и
                      событий
                    </p>
                  </div>
                  <div className="bg-[#e8f2ec] p-3 rounded-lg">
                    <p className="font-semibold text-[#122f3a]">Алерты</p>
                    <p className="text-sm text-gray-700">
                      Система оповещений о важных упоминаниях, риска и событиях.
                      Не пропусти ничего важного!
                    </p>
                  </div>
                  <div className="bg-[#e8f2ec] p-3 rounded-lg">
                    <p className="font-semibold text-[#122f3a]">Аналитика</p>
                    <p className="text-sm text-gray-700">
                      Подробная статистика: графики, тренды, анализ тональности
                      упоминаний и источники
                    </p>
                  </div>
                  <div className="bg-[#e8f2ec] p-3 rounded-lg">
                    <p className="font-semibold text-[#122f3a]">Health</p>
                    <p className="text-sm text-gray-700">
                      Общее состояние бренда: риски, метрики здоровья и
                      рекомендации по улучшению
                    </p>
                  </div>
                  <div className="bg-[#e8f2ec] p-3 rounded-lg">
                    <p className="font-semibold text-[#122f3a]">Журнал событий</p>
                    <p className="text-sm text-gray-700">
                      История всех действий и изменений в системе
                    </p>
                  </div>
                  <div className="bg-[#e8f2ec] p-3 rounded-lg">
                    <p className="font-semibold text-[#122f3a]">Настройки</p>
                    <p className="text-sm text-gray-700">
                      Подключай источники, создавай алерты, управляй брендами и
                      аккаунтами
                    </p>
                  </div>
                </div>
              </section>

              {/* Быстрый старт */}
              <section className="bg-[#e8f2ec] p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-[#122f3a] mb-2">
                  🚀 С чего начать?
                </h2>
                <ol className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">1.</span>
                    <span className="text-gray-700">
                      Создайте свой бренд на верхней панели
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">2.</span>
                    <span className="text-gray-700">
                      Подключи источники (соцсети, новостные сайты и т.д.)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">3.</span>
                    <span className="text-gray-700">
                      Создай первый алерт, чтобы не пропустить важное
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#4fd168] font-bold shrink-0">4.</span>
                    <span className="text-gray-700">
                      Смотри данные на Дашборде и в Аналитике
                    </span>
                  </li>
                </ol>
              </section>
            </div>

            <Button
              onClick={() => setOpen(false)}
              className="w-full bg-[#4fd168] hover:bg-[#47bf5f] text-white"
            >
              Понятно, начинаю работать!
            </Button>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
