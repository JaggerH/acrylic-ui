import { Fragment, useEffect, useState } from "react"
import {
  Home, Users, Image as ImageIcon, Settings, Star, Send,
  Search, Plus, Upload, Sparkles, Sun, Moon,
} from "lucide-react"
import { toast } from "sonner"
import { GlassCard } from "@/components/acrylic/glass-card"
import { AutoTextarea } from "@/components/acrylic/auto-textarea"
import { Button } from "@/components/acrylic/button"
import { Input } from "@/components/acrylic/input"
import { Toaster } from "@/components/acrylic/toaster"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/acrylic/dialog"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "@/components/acrylic/alert-dialog"

// Vivid backdrops so the translucency + backdrop-blur read in both themes.
const BACKDROP_DARK: React.CSSProperties = {
  background:
    "radial-gradient(60% 60% at 18% 12%, #6d28d9 0%, transparent 60%)," +
    "radial-gradient(55% 55% at 85% 18%, #db2777 0%, transparent 55%)," +
    "radial-gradient(70% 70% at 78% 88%, #0ea5e9 0%, transparent 60%)," +
    "radial-gradient(60% 60% at 12% 90%, #f59e0b 0%, transparent 55%)," +
    "linear-gradient(135deg, #0b0b12, #1a1626)",
}
const BACKDROP_LIGHT: React.CSSProperties = {
  background:
    "radial-gradient(60% 60% at 18% 12%, #c4b5fd 0%, transparent 60%)," +
    "radial-gradient(55% 55% at 85% 18%, #fbcfe8 0%, transparent 55%)," +
    "radial-gradient(70% 70% at 78% 88%, #bae6fd 0%, transparent 60%)," +
    "radial-gradient(60% 60% at 12% 90%, #fde68a 0%, transparent 55%)," +
    "linear-gradient(135deg, #f3efe8, #efe7f2)",
}

function Avatar({ letter, ring }: { letter: string; ring?: boolean }) {
  return (
    <div
      className={
        "grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-zinc-600 to-zinc-900 text-base font-medium text-zinc-50 " +
        (ring ? "ring-2 ring-primary" : "ring-1 ring-[var(--acr-border)]")
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

// macOS Push Button classes (Content Area). Each shown across Idle / Hover / Disabled.
const BUTTON_VARIANTS = [
  { key: "default", label: "Default", sample: "保存" },
  { key: "secondary", label: "Secondary", sample: "取消" },
  { key: "tinted", label: "Colored", sample: "标记" },
  { key: "destructive", label: "Destructive", sample: "删除" },
  { key: "ghost", label: "Borderless", sample: "编辑" },
] as const

// The five macOS control sizes (kit: Mn 16 / Sm 20 / Md 24 / Lg 28 / XL 36 px).
const BTN_SIZES = ["mini", "small", "medium", "large", "xl"] as const

export default function App() {
  const [note, setNote] = useState("")
  const [view, setView] = useState<"board" | "list">("board")
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    const el = document.documentElement
    el.classList.toggle("dark", theme === "dark")
    el.classList.toggle("light", theme === "light")
  }, [theme])

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10" style={theme === "dark" ? BACKDROP_DARK : BACKDROP_LIGHT} />
      <Toaster />

      {/* ---- Acrylic sidebar (frame) ---- */}
      <aside className="flex w-60 shrink-0 flex-col gap-4 border-r border-[var(--acr-border-soft)] bg-[var(--acr-surface)] p-4 backdrop-blur-2xl">
        <div className="px-1 text-lg font-semibold tracking-tight">Acrylic</div>

        <nav className="flex flex-col gap-1">
          {NAV.map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                (active
                  ? "bg-[var(--acr-chip)] text-foreground"
                  : "text-muted-foreground hover:bg-[var(--acr-hover)] hover:text-foreground")
              }
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          {/* NESTED glass: a GlassCard INSIDE the blurred sidebar */}
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
        {/* Acrylic top bar — search Input + Button actions + theme toggle */}
        <header className="flex items-center gap-2 border-b border-[var(--acr-border-soft)] bg-[var(--acr-surface)] px-6 py-3 backdrop-blur-2xl">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索照片…" className="pl-8" />
          </div>
          <div className="flex-1" />
          <Button variant="ghost" size="icon" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} title="切换主题">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          <Button variant="ghost" size="medium">
            <Upload /> 导入
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="medium">
                <Plus /> 打开对话框
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle>人物档案</DialogTitle>
                <DialogDescription>
                  72px 磨砂遮罩把整页（含侧栏）虚化，面板是半透明 tint。
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar letter="A" />
                <p className="text-sm text-muted-foreground">
                  对话框从 body portal 出来，盖在侧栏+内容之上，不被侧栏的 blur 截断。
                </p>
              </div>
              {/* AlertDialog STACKED on the Dialog — shared body-paint test */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="medium" className="w-fit text-rose-300">
                    删除这个档案…
                  </Button>
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
                    <AlertDialogAction className="bg-destructive text-white" onClick={() => toast("已删除（演示）")}>
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
                半透明面板，背景模糊透出来，平铺无阴影。
              </p>
            </GlassCard>
            <GlassCard interactive className="p-5">
              <div className="text-sm font-medium">GlassCard · interactive</div>
              <p className="mt-2 text-xs text-muted-foreground">
                悬停我 → 微微上浮 + 柔和投影（hover-only）。
              </p>
            </GlassCard>
          </section>

          {/* AutoTextarea (frosted input) NESTED inside a GlassCard */}
          <GlassCard className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <Star className="size-3.5 fill-current text-primary" /> AutoTextarea · 磨砂输入（苹果风滚动条）
            </div>
            <AutoTextarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLines={3}
              placeholder="多打几行看 maxLines 之后的苹果风滚动条…（玻璃输入框叠在玻璃卡上）"
            />
            <Button variant="secondary" size="medium" onClick={() => toast("已提交后台编辑", { description: "完成后作为新版本出现" })}>
              <Send /> 弹一个 acrylic toast
            </Button>
          </GlassCard>

          {/* Button — macOS Push Button: classes + size × state (kit layout) */}
          <GlassCard className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-2.5">
              <div className="text-sm font-medium">Button · 类别（macOS Push Button）</div>
              <div className="flex flex-wrap items-center gap-2">
                {BUTTON_VARIANTS.map((v) => (
                  <Button key={v.key} variant={v.key} size="large">{v.label}</Button>
                ))}
                <Button variant="glow" size="large"><Sparkles /> Ask Addy</Button>
              </div>
            </div>

            {/* Bordered Neutral · 尺寸 × 状态（照官方 kit 铺开）*/}
            <div className="flex flex-col gap-3 border-t border-[var(--acr-border-soft)] pt-4">
              <div className="text-sm font-medium">Bordered Neutral · 尺寸 × 状态</div>
              <div className="grid w-fit grid-cols-[4.5rem_repeat(5,auto)] items-center justify-items-start gap-x-5 gap-y-3.5">
                <div />
                {BTN_SIZES.map((s) => (
                  <div key={s} className="text-[10px] uppercase tracking-wide text-muted-foreground">{s}</div>
                ))}
                {([["idle", "Idle"], ["hover", "Hover"], ["disabled", "Disabled"]] as const).map(([state, label]) => (
                  <Fragment key={state}>
                    <div className="text-xs text-muted-foreground">{label}</div>
                    {BTN_SIZES.map((s) => (
                      <Button key={s} variant="secondary" size={s}
                        className={state === "hover" ? "bg-[var(--acr-chip-hover)]" : undefined}
                        disabled={state === "disabled"}>Label</Button>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Input · 分段控件 */}
          <GlassCard className="flex flex-col gap-4 p-5">
            <div className="text-sm font-medium">Input · 分段控件</div>
            <div className="flex w-fit items-center gap-1 rounded-full bg-[var(--acr-field)] p-1">
              {(["board", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors " +
                    (view === v
                      ? "bg-[var(--acr-solid)] text-[var(--acr-solid-fg)]"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="grid max-w-md grid-cols-1 gap-2.5">
              <Input placeholder="普通输入框…" />
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="带图标的搜索框…" className="pl-8" />
              </div>
            </div>
          </GlassCard>
        </main>
      </div>
    </div>
  )
}
