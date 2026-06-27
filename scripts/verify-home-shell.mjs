import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const url = process.argv[2] ?? "http://127.0.0.1:3000"
const outputDir = "tmp/playwright"

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(url, { waitUntil: "networkidle" })

const snapshot = () =>
  page.evaluate(() => {
  const box = (selector) => {
    const node = document.querySelector(selector)
    if (!node) return null
    const rect = node.getBoundingClientRect()
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
    }
  }

  return {
    title: document.title,
    hasShell: Boolean(document.querySelector('[data-slot="shell"]')),
    hasShellInset: Boolean(document.querySelector('[data-slot="shell-inset"]')),
    hasShellNavbar: Boolean(document.querySelector('[data-slot="shell-navbar"]')),
    hasSidebar: Boolean(document.querySelector('[data-slot="sidebar"]')),
    hasLoansBoard: document.body.innerText.includes("App intake"),
    hasPageHorizontalOverflow:
      document.documentElement.scrollWidth > document.documentElement.clientWidth,
    boxes: {
      shell: box('[data-slot="shell"]'),
      sidebar: box('[data-slot="sidebar"]'),
      inset: box('[data-slot="shell-inset"]'),
      navbar: box('[data-slot="shell-navbar"]'),
      body: box('[data-slot="shell-body"]'),
      inboxPanel: box('[data-slot="shell-panel"][data-variant="list"]'),
      detailPanel: box('[data-slot="shell-panel"][data-variant="detail"]'),
      firstItem: box('[data-slot="item"]'),
    },
    overflow: {
      page: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      },
      shellBody: (() => {
        const node = document.querySelector('[data-slot="shell-body"]')
        if (!node) return null
        return {
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
          hasHorizontalOverflow: node.scrollWidth > node.clientWidth,
        }
      })(),
      inboxContent: (() => {
        const node = document.querySelector(
          '[data-slot="shell-panel"][data-variant="list"] [data-slot="shell-content"]'
        )
        if (!node) return null
        return {
          clientWidth: node.clientWidth,
          scrollWidth: node.scrollWidth,
          hasHorizontalOverflow: node.scrollWidth > node.clientWidth,
        }
      })(),
    },
  }
})

const home = await snapshot()
await page.screenshot({ path: `${outputDir}/home-shell-page.png`, fullPage: true })

await page
  .locator('[data-slot="sidebar"] [data-slot="sidebar-menu-button"]')
  .filter({ hasText: "Inbox" })
  .click()
await page.waitForTimeout(250)

const inbox = await snapshot()
await page.screenshot({
  path: `${outputDir}/home-shell-inbox-page.png`,
  fullPage: true,
})

await browser.close()

console.log(JSON.stringify({ home, inbox }, null, 2))
