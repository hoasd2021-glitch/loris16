import path from 'path';
import { defineConfig, loadEnv } from 'vite'; // 👈 تأكد من استيراد loadEnv إذا كنت تستخدمه
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // 1. حذف السطر الخاطئ هنا: base: './',

  return {
    // 2. وضع خاصية base هنا (أعلى الكائن):
    base: './', 
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()], // هنا يجب أن تستخدم [react()] وليس [/* ... */]
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY), // 💡 يبدو أنك كررت هذا السطر، يمكنك تركه أو حذفه
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
