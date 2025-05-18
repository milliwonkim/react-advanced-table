# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

## GitHub Pages 배포 가이드

이 프로젝트는 GitHub Pages를 통해 정적 사이트로 배포할 수 있습니다.

1.  **저장소 이름 확인 및 설정 파일 수정:**

    - `vite.config.ts` 파일의 `base` 옵션이 `'/<저장소이름>/'` 형태로 올바르게 설정되었는지 확인하세요. (예: 저장소가 `my-awesome-table` 이면 `base: '/my-awesome-table/'`)
    - `package.json` 파일의 `homepage` 필드가 `"https://<사용자이름>.github.io/<저장소이름>"` 형태로 올바르게 설정되었는지 확인하세요.

2.  **프로젝트 빌드:**

    ```bash
    pnpm build
    ```

    이 명령어를 실행하면 `docs` 폴더에 빌드 결과물이 생성됩니다.

3.  **`docs` 폴더 커밋 및 푸시:**

    - 생성된 `docs` 폴더를 Git 저장소에 커밋하고 푸시합니다. `.gitignore` 파일에 `docs/`가 포함되어 있다면 해당 라인을 제거하거나 주석 처리해야 `docs` 폴더를 커밋할 수 있습니다. (현재 설정에서는 `.gitignore`에 `docs/`가 없습니다.)

4.  **GitHub Pages 설정:**

    - GitHub 저장소의 `Settings` 탭으로 이동합니다.
    - 왼쪽 메뉴에서 `Pages`를 선택합니다.
    - `Build and deployment` 섹션의 `Source`를 `Deploy from a branch`로 선택합니다.
    - `Branch` 섹션에서 배포할 브랜치(일반적으로 `main` 또는 `master`)와 폴더(`/(root)` 또는 `/docs`)를 선택합니다. 여기서는 `main` (또는 현재 사용 중인 기본 브랜치) 브랜치와 `/docs` 폴더를 선택합니다.
    - `Save` 버튼을 클릭합니다.

5.  **배포 확인:**
    - 잠시 후 GitHub Pages 설정 페이지에 표시되는 URL (예: `https://<사용자이름>.github.io/<저장소이름>/`)로 접속하여 배포된 애플리케이션을 확인합니다.

**참고:** GitHub Actions를 사용하여 빌드 및 배포 과정을 자동화할 수도 있습니다. 관심 있으시면 관련 워크플로우 설정을 추가해 드릴 수 있습니다.
