// pwa-assets.config.ts
import { defineConfig, minimalPreset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimalPreset,
    maskable: {
      sizes: [512],
      resizeOptions: { background: '#000000' },
    },
    apple: {
      sizes: [180],
    },
  },
  images: ['src/assets/vms.svg'],
})
