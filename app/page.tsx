import { Game } from "@/components/Game";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center gap-6 px-4 py-8 sm:py-12">
      <h1 className="text-3xl font-bold tracking-tight">지뢰찾기</h1>
      <Game />
    </main>
  );
}
