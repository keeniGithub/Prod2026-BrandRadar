"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Логируем неожиданные ошибки для диагностики
    console.error("Unexpected application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8f2ec] px-4">
      <section className="flex w-full max-w-xl flex-row items-center rounded-lg p-6 text-center md:p-8">
        <Image src="/500.png" width={320} height={240} alt="500" priority className="h-auto w-full max-w-[320px]" />
        <div className="text-left ml-10">
          <p className="mt-2 text-7xl font-black tracking-tight text-slate-900 md:text-8xl">500</p>
          <p className="mt-2 max-w-md text-xs text-slate-500 md:text-sm">
            PROD упал...
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {/* Восстановление без перезагрузки страницы — предпочтительный путь */}
            <Button
              onClick={reset}
              className="bg-[#4fd168] text-white hover:bg-[#47bf5f] hover:text-white"
            >
              Попробовать снова
            </Button>
            <Button asChild variant="outline">
              <Link href="/">На главную</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
