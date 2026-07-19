import AudioPlayerStageDemo from "@/components/examples/audio-player-stage-demo"

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-lg font-semibold text-muted-foreground">
        Audio Player Stage — full-screen lyrics (Silk background)
      </h1>
      <AudioPlayerStageDemo />
    </main>
  )
}
