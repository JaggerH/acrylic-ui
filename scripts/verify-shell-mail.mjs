import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"

const url = process.argv[2] ?? "http://127.0.0.1:3000/docs/components/shell"
const outputDir = "tmp/playwright"

await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto(url, { waitUntil: "networkidle" })

const result = await page.evaluate(() => {
  const text = document.body.innerText
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
  const overflow = (selector) => {
    const node = document.querySelector(selector)
    if (!node) return null
    return {
      clientWidth: node.clientWidth,
      scrollWidth: node.scrollWidth,
      hasHorizontalOverflow: node.scrollWidth > node.clientWidth,
    }
  }

  return {
    title: document.title,
    hasShellMail: text.includes("Shell") && text.includes("Inbox"),
    hasFigmaDimensions:
      document.documentElement.innerHTML.includes("h-[500px]") ||
      document.documentElement.innerHTML.includes("w-[800px]"),
    boxes: {
      shell: box('[data-slot="shell"]'),
      inboxPanel: box('[data-slot="shell-panel"][data-variant="list"]'),
      detailPanel: box('[data-slot="shell-panel"][data-variant="detail"]'),
      firstItem: box('[data-slot="item"]'),
      detailToolbar: box('[data-slot="shell-navbar"]'),
    },
    overflow: {
      inboxContent: overflow('[data-slot="shell-panel"][data-variant="list"] [data-slot="shell-content"]'),
      inboxList: overflow('[data-slot="shell-panel"][data-variant="list"] [data-slot="shell-content"] > div'),
    },
  }
})

const shell = page
  .locator('[data-slot="shell"]')
  .filter({
    has: page.locator('[data-slot="shell-panel"][data-variant="list"]'),
  })
  .first()
await shell.locator('[data-slot="sidebar-trigger"]').first().waitFor({
  state: "visible",
})
await page.waitForTimeout(500)

const beforeCollapse = await shell.evaluate((node) => {
  const sidebar = node.querySelector('[data-slot="sidebar"]')
  const trigger = node.querySelector('[data-slot="sidebar-trigger"]')
  return {
    state: sidebar?.getAttribute('data-state'),
    collapsible: sidebar?.getAttribute('data-collapsible'),
    triggerText: trigger?.textContent,
    triggerBox: (() => {
      if (!trigger) return null
      const rect = trigger.getBoundingClientRect()
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      }
    })(),
  }
})

await shell.locator('[data-slot="sidebar-trigger"]').first().click()
await page.waitForTimeout(250)

const collapsed = await shell.evaluate((node) => {
  const box = (selector) => {
    const target = node.querySelector(selector)
    if (!target) return null
    const rect = target.getBoundingClientRect()
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      x: Math.round(rect.x),
      y: Math.round(rect.y),
    }
  }

  const sidebar = node.querySelector('[data-slot="sidebar"]')

  return {
    before: undefined,
    state: sidebar?.getAttribute('data-state'),
    collapsible: sidebar?.getAttribute('data-collapsible'),
    shell: (() => {
      const rect = node.getBoundingClientRect()
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
      }
    })(),
    sidebar: box('[data-slot="sidebar"]'),
    sidebarGap: box('[data-slot="sidebar-gap"]'),
    inboxPanel: box('[data-slot="shell-panel"][data-variant="list"]'),
  }
})
collapsed.before = beforeCollapse

await page.screenshot({ path: `${outputDir}/shell-mail-page.png`, fullPage: true })
await browser.close()

console.log(JSON.stringify({ ...result, collapsed }, null, 2))
