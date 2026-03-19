import type { Metadata } from "next";
import { MentionsFeed } from "@/components/mentions-feed"

export const metadata: Metadata = {
  title: "Дашборд",
};

export default function Dashboard() {
  return (
    <main className="m-7 space-y-4">
      <h1 className='text-2xl font-bold'>Дашборд</h1>
      <MentionsFeed />
    </main>
  )
}
