import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/fs": "http://localhost:8000",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split MUI into its own chunk
          if (id.includes('@mui')) {
            return 'vendor-mui';
          }
          // Split Ant Design into its own chunk
          if (id.includes('antd') || id.includes('@ant-design')) {
            return 'vendor-antd';
          }
          // Split heavy libraries (PDF, Excel, html2canvas)
          if (id.includes('jspdf') || id.includes('exceljs') || id.includes('html2canvas')) {
            return 'vendor-utils';
          }
          // Split React and other small common libraries
          if (id.includes('node_modules')) {
             return 'vendor-base';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Optional: increase limit since we are managing chunks
  },
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      'antd',
      '@ant-design/icons',
      'react-router-dom',
      'axios',
      'date-fns'
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});