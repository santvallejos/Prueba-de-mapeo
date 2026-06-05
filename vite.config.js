import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: [
      {
        // Forzar coincidencia exacta con expresión regular. Así funciona tanto en el servidor 
        // como en la pre-optimización (esbuild) y no colisiona con subrutas como CSS o JS internos.
        find: /^leaflet-draw$/,
        replacement: path.resolve(__dirname, './src/shims/leaflet-draw-shim.js')
      }
    ]
  }
})

