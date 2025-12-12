import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    // نستخدم المسار المطلق هنا، لكن يجب أن يكون مسار المستودع لـ GitHub Pages!
    // المسار الصحيح لـ GitHub Pages هو: /اسم_المستودع/
    base: '/loris16/', 
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      // تأكد أنك تستخدم مفتاح Gemini API مرة واحدة فقط
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY), 
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
