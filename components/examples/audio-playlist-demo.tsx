"use client"

import * as React from "react"
import { ListMusic } from "lucide-react"

import { Button } from "@/registry/acrylic/button"
import { Sheet, SheetContent, SheetTrigger } from "@/registry/acrylic/sheet"
import { AudioPlaylist, type PlaylistTrack } from "@/registry/acrylic/audio-playlist"

const TRACKS: PlaylistTrack[] = [
  { id: "1", title: "海屿你", artist: "马也_Crabbit", duration: 295, hires: true, cover: "https://avatar.vercel.sh/haiyuni.png" },
  { id: "2", title: "玻璃", artist: "Gareth.T", duration: 185, hires: true, mv: true, cover: "https://avatar.vercel.sh/boli.png" },
  { id: "3", title: "如果呢", artist: "郑润泽", duration: 257, hires: true, cover: "https://avatar.vercel.sh/ruguone.png" },
  { id: "4", title: "Баллада（民谣）", artist: "Xcho / MOT", duration: 182, hires: true, cover: "https://avatar.vercel.sh/ballada.png" },
  { id: "5", title: "Angel", artist: "尹美莱 / Tiger JK", duration: 255, vip: true, hires: true, mv: true, cover: "https://avatar.vercel.sh/angel.png" },
  { id: "6", title: "遐想", artist: "郑润泽", duration: 189, hires: true, mv: true, cover: "https://avatar.vercel.sh/xiaxiang.png" },
  { id: "7", title: "恋人", artist: "李荣浩", duration: 275, vip: true, hires: true, mv: true, cover: "https://avatar.vercel.sh/lianren.png" },
  { id: "8", title: "周杰伦的床边故事", artist: "周杰伦", duration: 244, vip: true, hires: true, cover: "https://avatar.vercel.sh/jay.png" },
  { id: "9", title: "失眠飞行", artist: "接个吻、开一枪 / 沈以诚", duration: 218, hires: true, mv: true, cover: "https://avatar.vercel.sh/shimian.png" },
]

// Click the button to open a right-side Sheet that loads the "current playlist" — the
// AudioPlaylist fills the sheet body; selecting a row sets the playing track.
export default function AudioPlaylistDemo() {
  const [currentId, setCurrentId] = React.useState("1")
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="neutral">
          <ListMusic className="size-4" />
          播放列表
        </Button>
      </SheetTrigger>
      <SheetContent className="gap-0 p-0">
        <AudioPlaylist
          className="pt-3 [&>div:first-child]:pr-9"
          tracks={TRACKS}
          currentId={currentId}
          onSelect={setCurrentId}
        />
      </SheetContent>
    </Sheet>
  )
}
