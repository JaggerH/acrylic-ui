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
