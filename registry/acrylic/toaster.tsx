import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

/** Acrylic toast surface — a translucent dark pill (zinc-900/95 + backdrop-blur)
 *  that matches the glass aesthetic. Mount <Toaster /> once near the app root,
 *  then call `toast(...)` from "sonner" anywhere. Position/offset are sensible
 *  defaults you can override via props. */
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      offset={56}
      toastOptions={{
        classNames: {
          toast: "bg-zinc-900/95 border border-white/10 text-zinc-100 backdrop-blur-xl shadow-lg",
          title: "text-[12px] font-medium",
          description: "text-[11px] text-zinc-400",
          actionButton: "bg-primary text-primary-foreground text-[11px]",
        },
      }}
      {...props}
    />
  )
}
