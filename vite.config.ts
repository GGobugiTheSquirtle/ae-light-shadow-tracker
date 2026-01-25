import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포시 레포지토리 이름으로 변경 (예: /another-eden-checklist/)
  // 커스텀 도메인 사용시 '/'로 설정
  base: './',
})
