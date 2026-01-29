import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // 主进程入口文件
        entry: 'electron/main.js',
        vite: {
          build: {
            rollupOptions: {
              external: ['sqlite3', 'playwright-extra', 'puppeteer-extra-plugin-stealth', 'xlsx', 'electron'],
              output: {
                format: 'cjs',
              },
            },
          },
        },
      },
      {
        entry: 'electron/preload.js',
        onstart(options) {
          // 预加载脚本完成后通知渲染进程重新加载
          options.reload()
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
