import { useState } from "react"
import { Home, Users, Image as ImageIcon, Settings, Star, Send } from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/acrylic/glass-card"
import { AutoTextarea } from "@/components/acrylic/auto-textarea"
import { Toaster } from "@/components/acrylic/toaster"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/acrylic/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/acrylic/alert-dialog"

// A vivid backdrop so the translucency + backdrop-blur actually read.
const BACKDROP: React.CSSProperties = {
  background:
    "radial-gradient(60% 60% at 18% 12%, #6d28d9 0%, transparent 60%)," +
    "radial-gradient(55% 55% at 85% 18%, #db2777 0%, transparent 55%)," +
    "radial-gradient(70% 70% at 78% 88%, #0ea5e9 0%, transparent 60%)," +
    "radial-gradient(60% 60% at 12% 90%, #f59e0b 0%, transparent 55%)," +
    "linear-gradient(135deg, #0b0b12, #1a1626)",
}

function Avatar({ letter, ring }: { letter: string; ring?: boolean }) {
  return (
    <div
      className={
        "grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-base font-medium text-zinc-100 " +
        (ring ? "ring-2 ring-yellow-400" : "ring-1 ring-white/15")
      }
    >
      {letter}
    </div>
  )
}

const NAV = [
  { icon: Home, label: "概览", active: false },
  { icon: ImageIcon, label: "照片", active: true },
  { icon: Users, label: "人物档案", active: false },
  { icon: Settings, label: "设置", active: false },
]

export default function App() {
  const [note, setNote] = useState("")

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" style={BACKDROP} />
      <Toaster />

      {/* ---- Acrylic sidebar (frame) — its own backdrop-blur surface ---- */}
      <aside className="flex w-60 shrink-0 flex-col gap-4 border-r border-white/10 bg-zinc-950/45 p-4 backdrop-blur-2xl">
        <div className="px-1 text-lg font-semibold tracking-tight">Acrylic</div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                (active
                  ? "bg-white/10 text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white")
              }
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          {/* NESTED glass: a GlassCard INSIDE the blurred sidebar — interference test */}
          <GlassCard interactive className="flex items-center gap-3 p-3">
            <Avatar letter="黄" ring />
            <div className="min-w-0">
              <div className="truncate text-xs font-medium">黄杰</div>
              <div className="text-[10px] text-muted-foreground">4 张参考</div>
            </div>
          </GlassCard>
        </div>
      </aside>

      {/* ---- Content ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Acrylic top bar */}
        <header className="flex items-center justify-between border-b border-white/10 bg-zinc-950/35 px-6 py-3 backdrop-blur-2xl">
          <div className="text-sm text-muted-foreground">照片 · 组件融合测试</div>
          <Dialog>
            <DialogTrigger asChild>
              <button className="rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90">
                打开对话框
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle>人物档案</DialogTitle>
                <DialogDescription>
                  72px 磨砂遮罩把整页（含侧栏）虚化，面板是半透明白 tint。
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar letter="A" />
                <p className="text-sm text-muted-foreground">
                  对话框从 body portal 出来，盖在侧栏+内容之上，验证不被侧栏的 blur 截断。
                </p>
              </div>
              {/* AlertDialog STACKED on top of this Dialog — tests the shared
                  body-paint counter: cancelling/confirming the alert must NOT
                  unfrost this dialog underneath. */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="w-fit rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-rose-200 transition-colors hover:bg-white/10">
                    删除这个档案…
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[400px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除档案？</AlertDialogTitle>
                    <AlertDialogDescription>
                      磨砂确认框叠在磨砂对话框之上——取消后下层对话框仍应保持磨砂。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-white"
                      onClick={() => toast("已删除（演示）")}
                    >
                      删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <section className="grid grid-cols-2 gap-4">
            <GlassCard className="p-5">
              <div className="text-sm font-medium">GlassCard · 静态</div>
              <p className="mt-2 text-xs text-muted-foreground">
                半透明炭黑面板，背景模糊透出来，平铺无阴影。
              </p>
            </GlassCard>
            <GlassCard interactive className="p-5">
              <div className="text-sm font-medium">GlassCard · interactive</div>
              <p className="mt-2 text-xs text-muted-foreground">
                悬停我 → 微微上浮 + 柔和投影（hover-only）。
              </p>
            </GlassCard>
          </section>

          {/* AutoTextarea (frosted input) NESTED inside a GlassCard — triple stack */}
          <GlassCard className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Star className="size-3.5 fill-current text-yellow-400" /> AutoTextarea · 磨砂输入
            </div>
            <AutoTextarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLines={5}
              placeholder="描述想怎么改这张图…（玻璃输入框叠在玻璃卡上）"
            />
            <button
              onClick={() => toast("已提交后台编辑", { description: "完成后作为新版本出现" })}
              className="flex w-fit items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white transition-colors hover:bg-white/15"
            >
              <Send className="size-3.5" /> 弹一个 acrylic toast
            </button>
          </GlassCard>
        </main>
      </div>
    </div>
  )
}
