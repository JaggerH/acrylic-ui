/// <reference types="vite/client" />

// @fontsource-variable/inter ships a CSS entry with no type declarations; declare
// it so the side-effect `import "@fontsource-variable/inter"` in main.tsx type-checks.
declare module "@fontsource-variable/inter"
