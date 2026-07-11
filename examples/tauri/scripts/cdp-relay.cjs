// cdp-relay.cjs — Windows-side TCP relay so a CDP client running under WSL can
// reach the Tauri WebView2 devtools endpoint.
//
// Why this is needed: WebView2 binds its CDP port on 127.0.0.1 only and refuses
// connections whose origin isn't local, so a process inside WSL cannot connect
// directly — even under WSL2 mirrored networking, where the TCP layer bridges
// localhost both ways, Chromium's application layer still rejects the WSL-originated
// connection. Running THIS relay with the Windows node makes the upstream connection
// originate from Windows loopback, which WebView2 accepts.
//
// Usage (run with the WINDOWS node, not the WSL node):
//   node.exe scripts\cdp-relay.cjs
//
// Prereqs:
//   1. Launch the app with the debug port open:
//        ACRYLIC_TAURI_DEBUG=1 WSLENV=ACRYLIC_TAURI_DEBUG \
//          cargo tauri dev --target x86_64-pc-windows-gnu
//      (WSLENV forwards the flag across the WSL→Windows process boundary.)
//   2. From WSL, point a CDP client at http://localhost:9223 and send a
//      `Host: localhost` header (Chromium's DNS-rebinding guard requires it; the
//      WebSocket upgrade also needs `Host` + `Origin`).
//
// If the port never opens, a stale msedgewebview2.exe may hold the user-data lock —
// kill it and remove EBWebView/lockfile, then relaunch. See the docs for details.

const net = require("net");

const LISTEN_PORT = 9223;
const TARGET_PORT = 9222;
const TARGET_HOST = "127.0.0.1";

const server = net.createServer((client) => {
  const upstream = net.connect(TARGET_PORT, TARGET_HOST);
  client.pipe(upstream);
  upstream.pipe(client);
  const close = () => {
    client.destroy();
    upstream.destroy();
  };
  client.on("error", close);
  upstream.on("error", close);
});

server.on("error", (err) => {
  console.error(`CDP relay failed: ${err.message}`);
  process.exit(1);
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`CDP relay: 0.0.0.0:${LISTEN_PORT} -> ${TARGET_HOST}:${TARGET_PORT}`);
});
