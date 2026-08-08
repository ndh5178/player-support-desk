import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'public/mockServiceWorker.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // 학습을 위해 객체 속성 이름과 값이 같아도 둘을 모두 명시한다.
      'object-shorthand': ['error', 'never'],
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      // Vue 지시어와 컴포넌트 종료 태그를 생략하지 않는다.
      'vue/v-bind-style': ['error', 'longform'],
      'vue/v-on-style': ['error', 'longform'],
      'vue/v-slot-style': ['error', 'longform'],
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'never',
          },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },
  {
    files: ['vite.config.ts', 'tests/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  eslintConfigPrettier,
  {
    files: ['**/*.vue'],
    rules: {
      // Prettier 설정 이후에도 컴포넌트 종료 태그를 생략하지 않는 규칙을 유지한다.
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'never',
            component: 'never',
          },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },
)
