import { readFileSync } from "node:fs"

const source = readFileSync("registry/acrylic/sidebar.tsx", "utf8")

function getFunctionBody(name) {
  const start = source.indexOf(`function ${name}`)
  if (start === -1) {
    throw new Error(`${name} was not found`)
  }

  const nextFunction = source.indexOf("\nfunction ", start + 1)
  return source.slice(start, nextFunction === -1 ? source.length : nextFunction)
}

for (const name of ["SidebarMenuAction", "SidebarMenuBadge"]) {
  const body = getFunctionBody(name)

  if (!body.includes("top-1/2") || !body.includes("-translate-y-1/2")) {
    throw new Error(`${name} must be vertically centered from the row midpoint`)
  }

  if (/peer-data-\[size=(sm|default|lg)\]\/menu-button:top-/.test(body)) {
    throw new Error(`${name} must not use size-specific top offsets`)
  }
}

const menuItemBody = getFunctionBody("SidebarMenuItem")
const menuButtonVariants = source.slice(
  source.indexOf("const sidebarMenuButtonVariants"),
  source.indexOf("function SidebarMenuButton")
)
const subButtonBody = getFunctionBody("SidebarMenuSubButton")

if (!menuButtonVariants.includes("w-full")) {
  throw new Error("SidebarMenuButton must span the available sidebar width")
}

if (!menuButtonVariants.includes("whitespace-nowrap")) {
  throw new Error("SidebarMenuButton text must stay on one line before truncating")
}

if (menuButtonVariants.includes("text-ellipsis")) {
  throw new Error("SidebarMenuButton must fade overflowing text instead of rendering ellipses")
}

if (!menuButtonVariants.includes("mask-image:linear-gradient")) {
  throw new Error("SidebarMenuButton overflowing text must fade out with a gradient mask")
}

if (!menuButtonVariants.includes("[&>span]:flex-1")) {
  throw new Error("SidebarMenuButton fade must apply at the end of the remaining text slot")
}

if (menuButtonVariants.includes("span:last-child")) {
  throw new Error("SidebarMenuButton fade must target text spans, not only the last span")
}

if (!subButtonBody.includes("w-full")) {
  throw new Error("SidebarMenuSubButton must span from its indent to the sidebar edge")
}

if (!subButtonBody.includes("whitespace-nowrap")) {
  throw new Error("SidebarMenuSubButton text must stay on one line before truncating")
}

if (subButtonBody.includes("text-ellipsis")) {
  throw new Error("SidebarMenuSubButton must fade overflowing text instead of rendering ellipses")
}

if (!subButtonBody.includes("mask-image:linear-gradient")) {
  throw new Error("SidebarMenuSubButton overflowing text must fade out with a gradient mask")
}

if (!subButtonBody.includes("[&>span]:flex-1")) {
  throw new Error("SidebarMenuSubButton fade must apply at the end of the remaining text slot")
}

if (subButtonBody.includes("span:last-child")) {
  throw new Error("SidebarMenuSubButton fade must target text spans, not only the last span")
}

if (!menuItemBody.includes("[&_[data-slot=sidebar-menu-sub]]:flex")) {
  throw new Error("Collapsed hover-card submenus must remain visible inside the flyout")
}

if (!menuItemBody.includes("[&_[data-slot=sidebar-menu-sub-button]]:w-full")) {
  throw new Error("Collapsed hover-card submenu buttons must fill the flyout width")
}
