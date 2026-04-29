import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const parsePort = (value: string | undefined, fallback: number) => {
  const port = Number(value);

  return Number.isInteger(port) && port > 0 ? port : fallback;
};

export default defineConfig(({ mode }) => {
  const env = {
    ...loadEnv(mode, process.cwd(), ''),
    ...process.env,
  };
  const uiPort = parsePort(env.UI_PORT, 5173);
  const backendPort = parsePort(env.BACKEND_PORT, 3001);

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: uiPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: uiPort,
      strictPort: true,
    },
  };
});
