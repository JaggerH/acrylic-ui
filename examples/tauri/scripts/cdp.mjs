import { readFileSync } from "node:fs"
import WebSocket from "ws"

// Minimal CDP client for the Tauri WebView2 window — the WSL-side companion to
// cdp-relay.cjs. Evaluates JS inside the running WebView and prints the result,
// so you can inspect the frontend's runtime state without a visible devtools.
//
// Usage (from WSL, with the app running under ACRYLIC_TAURI_DEBUG and the relay up):
//   node cdp.mjs '<js expression>'      evaluate an expression, print JSON result
//   node cdp.mjs --file script.js       evaluate a file's contents
//
// Env:
//   CDP_URL     CDP endpoint (default http://localhost:9223 — the relay's port).
//   CDP_TARGET  substring to pick a page target by url/title (default: first page).
//
// Requires `ws` (npm i) — Node's built-in WebSocket can't set the Host/Origin
// headers WebView2's DNS-rebinding guard needs. The relay + these headers are what
// let a WSL process reach WebView2's loopback-only CDP port. See docs/tauri.

// Default target = the Windows-side relay (9223 -> Windows 127.0.0.1:9222). WebView2
// binds CDP loopback-only and rejects non-loopback-origin connections, so WSL goes
// through the relay. Chromium's DNS-rebinding guard requires Host: localhost.
const CDP = (process.env.CDP_URL || "http://localhost:9223").replace(/\/$/, "")
const HDRS = { Host: "localhost" }

function getExpr() {
  const a = process.argv.slice(2)
  if (a[0] === "--file") return readFileSync(a[1], "utf8")
  return a[0]
}

async function main() {
  const expr = getExpr()
  if (!expr) {
    console.error('usage: node cdp.mjs "<js>" | --file <path>')
    process.exit(2)
  }

  let targets
  try {
    targets = await (await fetch(CDP + "/json", { headers: HDRS })).json()
  } catch (e) {
    console.error(`CANNOT reach CDP at ${CDP}: ${e.message || e}`)
    console.error("→ Is the app running with ACRYLIC_TAURI_DEBUG=1 and the relay up?")
    console.error("→ Port may be held by a stale msedgewebview2.exe — see docs/tauri.")
    process.exit(1)
  }

  const pages = targets.filter((t) => t.type === "page" && t.webSocketDebuggerUrl)
  const filter = process.env.CDP_TARGET
  const pick =
    (filter && pages.find((t) => `${t.url} ${t.title}`.includes(filter))) || pages[0]
  if (!pick) {
    console.error(
      "no page target. targets:",
      JSON.stringify(targets.map((t) => ({ type: t.type, url: t.url })))
    )
    process.exit(1)
  }

  // Rewrite the ws host to whatever host we actually reached CDP on (the relay).
  const wsUrl = new URL(pick.webSocketDebuggerUrl)
  wsUrl.host = new URL(CDP).host
  const ws = new WebSocket(wsUrl.toString(), { headers: HDRS, origin: "http://localhost" })

  let id = 0
  const pending = new Map()
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id
      pending.set(mid, { resolve, reject })
      ws.send(JSON.stringify({ id: mid, method, params }))
    })

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString())
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
    }
  })

  ws.on("open", async () => {
    try {
      await send("Runtime.enable")
      const r = await send("Runtime.evaluate", {
        expression: expr,
        returnByValue: true,
        awaitPromise: true,
      })
      if (r.exceptionDetails) {
        const ex = r.exceptionDetails.exception
        console.error("JS EXCEPTION:", ex?.description || JSON.stringify(r.exceptionDetails))
        process.exit(1)
      }
      const v = r.result?.value
      console.log(typeof v === "string" ? v : JSON.stringify(v, null, 2))
      ws.close()
      process.exit(0)
    } catch (e) {
      console.error("CDP error:", e.message || e)
      process.exit(1)
    }
  })
  ws.on("error", (e) => {
    console.error("WS error:", e.message || e)
    process.exit(1)
  })
}

main()
