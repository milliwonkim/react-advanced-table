import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages 배포를 위한 base 경로 설정
  // 예: https://<username>.github.io/<repository-name>/
  // 이 경우 base는 '/<repository-name>/' 입니다.
  // 실제 저장소 이름으로 수정해주세요.
  base: "/advanced-react-table/",
  build: {
    // 빌드 결과물을 'docs' 폴더에 생성합니다.
    // GitHub Pages에서 이 폴더를 읽도록 설정할 수 있습니다.
    outDir: "docs",
  },
  server: {
    port: 3000, // Optional: specify dev server port
    open: true, // Optional: open browser on start
  },
  resolve: {
    alias: {
      // If you have path aliases, define them here
      // '@/': '/src/',
    },
  },
});
