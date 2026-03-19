import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8f2ec] px-4">
      <section className="flex w-full max-w-xl flex-row items-center rounded-lg p-6 text-center md:p-8">
        <Image src="/404.png" width={320} height={240} alt="404" priority className="h-auto w-full max-w-[320px]" />
        <div className="text-left">
            <p className="mt-2 text-7xl font-black tracking-tight text-slate-900 md:text-8xl">404</p>
            <p className="mt-2 max-w-md text-xs text-slate-500 md:text-sm">
            Где я? Кажется, вы заблудились.
            </p>
            <Button asChild className="mt-6 bg-[#4fd168] text-white hover:bg-[#47bf5f] hover:text-white">
            <Link href="/">На главную</Link>
        </Button>
        </div>
      </section>
    </main>
  );
}