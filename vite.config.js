import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/MugiWash/', // Important: doit correspondre au nom de votre repo
  build: {
    outDir: 'dist',
  },
})