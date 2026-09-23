import { defineConfig } from 'vite'

// One static page, no framework, no plugins. `base: './'` keeps the built asset
// paths relative so `wrangler pages deploy dist` works from any Pages project path.
export default defineConfig({
  base: './',
  server: { port: 5173 },
  preview: { port: 4173 },
})
