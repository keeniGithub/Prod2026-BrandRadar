"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  BellRing,
  ChartNoAxesCombined,
  ChevronDown,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Play,
  Settings,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { pages } from "@/app/config/pages";
import OnboardingModal from "@/components/onboarding-modal";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useState } from "react";
import { pingAPI, pingCollector, pingDB, pingML } from "@/app/api/ping";
import { useAlerts } from "@/components/alert-context";
import { Collector } from "@/app/config/health";
import { getCollectors, runCollector, runPipeline } from "@/app/api/health";

const activeClass = "bg-[#4fd168] text-white hover:bg-[#47bf5f] hover:text-white";
const inactiveClass = "text-[#122f3a] hover:bg-[#d7e8df]";

export default function Navbar({ onNavigate }: { onNavigate?: () => void } = {}) {
    const pathname = usePathname();
    const isActive = (href: string) => pathname === href;
    const [apiOk, setApiOk] = useState<boolean | null>(null);
    const [mlOk, setMlOk] = useState<boolean | null>(null);
    const [collectorOk, setCollectorOk] = useState<boolean | null>(null);
    const [dbOk, setDbOk] = useState<boolean | null>(null);
    const [collectors, setCollectors] = useState<Collector[]>([]);
    const [collectorsLoading, setCollectorsLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    // Множество source_id коллекторов, которые в данный момент запускаются
    const [runningCollectors, setRunningCollectors] = useState<Set<string>>(new Set());
    // Флаг запуска пайплайна
    const [pipelineRunning, setPipelineRunning] = useState(false);
    const { unreadCount } = useAlerts();

    useEffect(() => {
        // Запускаем все проверки независимо, чтобы сбой одного не скрывал статус остальных
        pingAPI()
            .then((status) => setApiOk(status >= 200 && status < 400))
            .catch(() => setApiOk(false));

        pingML()
            .then((status) => setMlOk(status === "healthy"))
            .catch(() => setMlOk(false));

        pingCollector()
            .then((status) => setCollectorOk(status >= 200 && status < 400))
            .catch(() => setCollectorOk(false));

        pingDB()
            .then((status) => setDbOk(status === "healthy"))
            .catch(() => setDbOk(false));

        // Загрузить список collectors
        const fetchCollectors = async () => {
            try {
                const response = await getCollectors();
                if (response.data && Array.isArray(response.data)) {
                    setCollectors(response.data);
                } else {
                    setCollectors([]);
                }
            } catch (error) {
                console.error("Failed to fetch collectors:", error);
                setCollectors([]);
            } finally {
                setCollectorsLoading(false);
            }
        };

        fetchCollectors();
    }, [])

    /**
     * Запускает сбор данных для конкретного коллектора.
     * Блокирует повторный запуск до завершения текущего.
     */
    const handleRunCollector = useCallback(async (sourceId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (runningCollectors.has(sourceId)) return;

        setRunningCollectors((prev) => new Set(prev).add(sourceId));
        try {
            await runCollector(sourceId);
        } catch (error) {
            console.error("Failed to run collector:", sourceId, error);
        } finally {
            setRunningCollectors((prev) => {
                const next = new Set(prev);
                next.delete(sourceId);
                return next;
            });
        }
    }, [runningCollectors]);

    /**
     * Запускает пайплайн для всех коллекторов в статусе idle.
     */
    const handleRunAllIdle = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        const idleCollectors = collectors.filter(
            (c) => c.status === "idle" && c.source_id && !runningCollectors.has(c.source_id)
        );
        if (idleCollectors.length === 0) return;

        setRunningCollectors((prev) => {
            const next = new Set(prev);
            idleCollectors.forEach((c) => next.add(c.source_id));
            return next;
        });

        await Promise.all(
            idleCollectors.map((c) =>
                runCollector(c.source_id)
                    .catch((err) => console.error("Failed to run collector:", c.source_id, err))
                    .finally(() => {
                        setRunningCollectors((prev) => {
                            const next = new Set(prev);
                            next.delete(c.source_id);
                            return next;
                        });
                    })
            )
        );
    }, [collectors, runningCollectors]);

    /**
     * Запускает пайплайн обработки данных.
     * Блокирует повторный запуск до завершения текущего.
     */
    const handleRunPipeline = useCallback(async () => {
        if (pipelineRunning) return;

        setPipelineRunning(true);
        try {
            await runPipeline();
        } catch (error) {
            console.error("Failed to run pipeline:", error);
        } finally {
            setPipelineRunning(false);
        }
    }, [pipelineRunning]);

    return (
        <nav className="flex h-full w-64 flex-col border-r border-[#c8dbd1] bg-[#e8f2ec] px-5 py-6">
            <Link href={pages.DASHBOARD.ROOT} onClick={onNavigate} className="mb-6">
                <Image
                    src="/logo.png"
                    width={300}
                    height={30}
                    alt="Brand Radar"
                    className="mb-4 h-auto"
                />
            </Link>

            <div className="mb-6">
                <OnboardingModal />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#264350]/60">
                Основное
            </p>
            <div className="mb-5 space-y-1">
                <Link href={pages.DASHBOARD.ROOT} onClick={onNavigate}>
                    <Button
                        variant="ghost"
                        className={cn("h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium", isActive(pages.DASHBOARD.ROOT) ? activeClass : inactiveClass)}
                    >
                        <LayoutDashboard className="size-5" />
                        Дашборд
                    </Button>
                </Link>

                <Link href={pages.DASHBOARD.ALERT} onClick={onNavigate}>
                    <Button
                        variant="ghost"
                        className={cn("h-10 w-full justify-between rounded-lg px-3 text-sm font-medium", isActive(pages.DASHBOARD.ALERT) ? activeClass : inactiveClass)}
                    >
                        <span className="flex items-center gap-3">
                            <BellRing className="size-5" />
                            Алерты
                        </span>
                        {unreadCount > 0 && (
                            <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#ef4a4a] text-[11px] font-semibold text-white">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </Button>
                </Link>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#264350]/60">
                Данные
            </p>
            <div className="mb-5 space-y-1">
                <Link href={pages.DASHBOARD.ANALYTIC} onClick={onNavigate}>
                    <Button
                        variant="ghost"
                        className={cn("h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium", isActive(pages.DASHBOARD.ANALYTIC) ? activeClass : inactiveClass)}
                    >
                        <ChartNoAxesCombined className="size-5" />
                        Аналитика
                    </Button>
                </Link>

                <Link href={pages.DASHBOARD.HEALTH} onClick={onNavigate}>
                    <Button
                        variant="ghost"
                        className={cn("h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium", isActive(pages.DASHBOARD.HEALTH) ? activeClass : inactiveClass)}
                    >
                        <Heart className="size-5"/>
                        Health
                    </Button>
                </Link>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#264350]/60">
                Система
            </p>
            <div className="space-y-1">
                <Link href={pages.DASHBOARD.AUDIT} onClick={onNavigate}>
                    <Button
                        variant="ghost"
                        className={cn("h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium", isActive(pages.DASHBOARD.AUDIT) ? activeClass : inactiveClass)}
                    >
                        <ClipboardList className="size-5" />
                        Журнал событий
                    </Button>
                </Link>

                <Link href={pages.DASHBOARD.SETTINGS} onClick={onNavigate}>
                    <Button
                        variant="ghost"
                        className={cn("h-10 w-full justify-start gap-3 rounded-lg px-3 text-sm font-medium", isActive(pages.DASHBOARD.SETTINGS) ? activeClass : inactiveClass)}
                    >
                        <Settings className="size-5" />
                        Настройки
                    </Button>
                </Link>
            </div>

            <div className="mt-auto pt-4">
                <Separator className="mb-4 bg-[#ccddd4]" />
                
                {/* Collectors Dropdown */}
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setDropdownOpen(!dropdownOpen);
                            }}
                            className="flex w-full items-center justify-between rounded py-1 text-left hover:bg-[#d7e8df]"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Activity
                                    className={cn(
                                        "w-3 h-3 shrink-0",
                                        collectorOk === null
                                            ? "text-zinc-500"
                                            : collectorOk
                                            ? "text-[#0fb276]"
                                            : "text-red-500"
                                    )}
                                    strokeWidth={4}
                                />
                                <span className="text-sm text-[#193440] truncate">
                                    Collector {collectors.filter(c => c.status !== "error").length}/{collectors.length}
                                </span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-[#193440] shrink-0" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        className="min-w-64 ml-8" 
                        align="start" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {collectorsLoading ? (
                            <div className="px-2 py-1.5 text-sm text-zinc-600">Загрузка...</div>
                        ) : collectors.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-zinc-600">Нет collectors</div>
                        ) : (
                            <>
                                {collectors.map((collector) => (
                                    <div
                                        key={collector.name}
                                        className="px-2 py-1.5 hover:bg-zinc-100 rounded cursor-default"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex w-full items-center justify-between gap-3">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div
                                                    className={cn(
                                                        "w-2 h-2 rounded-full shrink-0",
                                                        collector.status === "error"
                                                            ? "bg-red-500"
                                                            : "bg-[#0fb276]"
                                                    )}
                                                />
                                                <span className="text-sm truncate">{collector.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <span className="text-xs text-zinc-500">{collector.status}</span>
                                                {/* Кнопка запуска коллектора: доступна только в статусе idle */}
                                                {collector.source_id && (
                                                    <button
                                                        title={collector.status === "idle" ? "Запустить пайплайн" : "Доступно только в статусе idle"}
                                                        disabled={collector.status !== "idle" || runningCollectors.has(collector.source_id)}
                                                        onClick={(e) => handleRunCollector(collector.source_id, e)}
                                                        className={cn(
                                                            "ml-1 rounded p-0.5 transition-colors",
                                                            collector.status !== "idle" || runningCollectors.has(collector.source_id)
                                                                ? "cursor-not-allowed text-zinc-300"
                                                                : "text-zinc-400 hover:text-[#0fb276] hover:bg-zinc-200"
                                                        )}
                                                    >
                                                        <Play className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Кнопка запуска всех idle коллекторов */}
                                {collectors.some((c) => c.source_id && c.status === "idle" && !runningCollectors.has(c.source_id)) && (
                                    <>
                                        <Separator className="my-1" />
                                        <div className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                title="Запустить пайплайн для всех idle коллекторов"
                                                onClick={handleRunAllIdle}
                                                className="flex w-full items-center gap-2 rounded px-1 py-1 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors"
                                            >
                                                <Play className="w-3 h-3 text-[#0fb276]" />
                                                <span>
                                                    Запустить все (
                                                    {collectors.filter((c) => c.source_id && c.status === "idle" && !runningCollectors.has(c.source_id)).length}
                                                    )
                                                </span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Кнопка запуска пайплайна обработки данных */}
                <button
                    title="Запустить пайплайн обработки"
                    disabled={pipelineRunning}
                    onClick={handleRunPipeline}
                    className={cn(
                        "flex w-full items-center gap-2 rounded py-1 text-sm text-[#193440] transition-colors",
                        pipelineRunning
                            ? "cursor-not-allowed opacity-60"
                            : "hover:bg-[#d7e8df]"
                    )}
                >
                    <Workflow
                        className={cn(
                            "w-3 h-3 shrink-0",
                            pipelineRunning ? "text-zinc-400" : "text-[#193440]"
                        )}
                        strokeWidth={2}
                    />
                    <span className="flex-1 text-left truncate">
                        {pipelineRunning ? "Запуск..." : "Pipeline run"}
                    </span>
                    {!pipelineRunning && (
                        <Play className="w-3 h-3 shrink-0 text-zinc-400" />
                    )}
                </button>

                <div className="flex items-center gap-2 py-1 text-sm text-[#193440]">
                    <Activity
                        className={cn(
                            "w-3 h-3",
                            mlOk === null
                                ? "text-zinc-500"
                                : mlOk
                                ? "text-[#0fb276]"
                                : "text-red-500"
                        )}
                        strokeWidth={4}
                    />
                    ML Service
                </div>
                <div className="flex items-center gap-2 py-1 text-sm text-[#193440]">
                    <Activity
                        className={cn(
                            "w-3 h-3",
                            apiOk === null
                                ? "text-zinc-500"
                                : apiOk
                                ? "text-[#0fb276]"
                                : "text-red-500"
                        )}
                        strokeWidth={4}
                    />
                    API
                </div>
                <div className="flex items-center gap-2 py-1 text-sm text-[#193440]">
                    <Activity
                        className={cn(
                            "w-3 h-3",
                            dbOk === null
                                ? "text-zinc-500"
                                : dbOk
                                ? "text-[#0fb276]"
                                : "text-red-500"
                        )}
                        strokeWidth={4}
                    />
                    Database
                </div>
            </div>
        </nav>
    );
}
