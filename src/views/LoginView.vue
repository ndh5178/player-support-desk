<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const localErrorMessage = ref('')
const errorMessage = computed(() => localErrorMessage.value || authStore.errorMessage)

function clearError(): void {
  localErrorMessage.value = ''
  authStore.clearError()
}

function getRedirectPath(): string {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }

  return '/'
}

async function handleSubmit(): Promise<void> {
  clearError()

  if (!username.value.trim() || !password.value) {
    localErrorMessage.value = '아이디와 비밀번호를 모두 입력해 주세요.'
    return
  }

  const succeeded = await authStore.login(username.value.trim(), password.value)
  if (succeeded) {
    await router.replace(getRedirectPath())
  }
}
</script>

<template>
  <div class="login-page">
    <a class="login-page__skip" href="#main-content">본문 바로가기</a>

    <main id="main-content" class="login-page__main">
      <section class="login-page__briefing" aria-labelledby="login-title">
        <AppHeader></AppHeader>

        <div class="login-page__briefing-copy">
          <p class="login-page__signal"><span aria-hidden="true"></span> SUPPORT ACCESS</p>
          <h1 id="login-title">플레이어 지원 운영실</h1>
          <p>
            담당자 계정으로 로그인해 플레이어 문의 현황을 확인하고 대응 작업을
            이어가세요.
          </p>
        </div>

        <dl class="login-page__environment" aria-label="접속 환경">
          <div>
            <dt>지역</dt>
            <dd>한국</dd>
          </div>
          <div>
            <dt>플랫폼</dt>
            <dd>PC</dd>
          </div>
          <div>
            <dt>환경</dt>
            <dd>비공식 포트폴리오</dd>
          </div>
        </dl>
      </section>

      <section class="login-panel" aria-labelledby="login-form-title">
        <div class="login-panel__heading">
          <p>담당자 인증</p>
          <h2 id="login-form-title">운영 계정 로그인</h2>
          <span>문의 정보는 로그인한 지원 담당자만 확인할 수 있습니다.</span>
        </div>

        <form
          class="login-form"
          novalidate
          v-bind:aria-busy="authStore.isSubmitting"
          v-on:submit.prevent="handleSubmit"
        >
          <div class="login-form__field">
            <label for="username">아이디</label>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              autocomplete="username"
              inputmode="text"
              v-bind:aria-invalid="Boolean(errorMessage)"
              v-bind:aria-describedby="errorMessage ? 'login-error' : undefined"
              v-bind:disabled="authStore.isSubmitting"
              v-on:input="clearError"
            />
          </div>

          <div class="login-form__field">
            <label for="password">비밀번호</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              v-bind:aria-invalid="Boolean(errorMessage)"
              v-bind:aria-describedby="errorMessage ? 'login-error' : undefined"
              v-bind:disabled="authStore.isSubmitting"
              v-on:input="clearError"
            />
          </div>

          <p v-if="errorMessage" id="login-error" class="login-form__error" role="alert">
            {{ errorMessage }}
          </p>

          <button type="submit" v-bind:disabled="authStore.isSubmitting">
            {{ authStore.isSubmitting ? '로그인 확인 중' : '운영실 접속' }}
          </button>
        </form>

        <div class="login-panel__demo">
          <strong>로컬 학습 계정</strong>
          <span>아이디 seoyun · 비밀번호 password</span>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: clamp(var(--space-4), 4vw, var(--space-10));
  background:
    linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px),
    radial-gradient(circle at 14% 12%, rgb(214 165 47 / 18%), transparent 24rem),
    var(--color-tactical-900);
  background-size:
    3rem 3rem,
    3rem 3rem,
    auto,
    auto;
}

.login-page__skip {
  position: fixed;
  z-index: 10;
  top: var(--space-3);
  left: var(--space-3);
  padding: 0.625rem var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-neutral-0);
  color: var(--color-brand-900);
  font-weight: 800;
  text-decoration: none;
  transform: translateY(calc(-100% - var(--space-5)));
}

.login-page__skip:focus {
  transform: translateY(0);
}

.login-page__main {
  display: grid;
  width: min(100%, 72rem);
  min-height: calc(100vh - clamp(var(--space-8), 8vw, 5rem));
  margin-inline: auto;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 14%);
  background: var(--color-neutral-50);
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 28%);
}

.login-page__briefing {
  display: grid;
  align-content: space-between;
  gap: var(--space-10);
  padding: clamp(var(--space-6), 6vw, 4rem);
  background:
    linear-gradient(145deg, rgb(214 165 47 / 9%), transparent 54%),
    var(--color-tactical-900);
  color: var(--color-neutral-0);
}

.login-page__briefing-copy {
  max-width: 32rem;
}

.login-page__signal {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: #f4c64f;
  font-size: 0.6875rem;
  font-weight: 850;
  letter-spacing: 0.14em;
}

.login-page__signal span {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #70b986;
  box-shadow: 0 0 0 0.2rem rgb(112 185 134 / 15%);
}

.login-page__briefing h1 {
  margin-top: var(--space-4);
  color: #fff8e6;
  font-size: clamp(2rem, 6vw, 3.75rem);
  line-height: 1.08;
  letter-spacing: -0.05em;
}

.login-page__briefing-copy > p:last-child {
  margin-top: var(--space-5);
  color: rgb(255 255 255 / 64%);
  font-size: var(--font-size-lg);
}

.login-page__environment {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid rgb(255 255 255 / 12%);
}

.login-page__environment div {
  padding-top: var(--space-4);
}

.login-page__environment dt {
  color: rgb(255 255 255 / 42%);
  font-size: 0.6875rem;
}

.login-page__environment dd {
  margin: var(--space-1) 0 0;
  color: #fff8e6;
  font-size: 0.75rem;
  font-weight: 750;
}

.login-panel {
  display: grid;
  align-content: center;
  padding: clamp(var(--space-6), 7vw, 5rem);
}

.login-panel__heading > p {
  color: var(--color-brand-700);
  font-size: 0.6875rem;
  font-weight: 850;
  letter-spacing: 0.12em;
}

.login-panel__heading h2 {
  margin-top: var(--space-2);
  color: var(--color-text-strong);
  font-size: clamp(1.5rem, 4vw, 2rem);
  letter-spacing: -0.035em;
}

.login-panel__heading span {
  display: block;
  margin-top: var(--space-2);
  color: var(--color-text-muted);
}

.login-form {
  display: grid;
  gap: var(--space-5);
  margin-top: var(--space-8);
}

.login-form__field {
  display: grid;
  gap: var(--space-2);
}

.login-form__field label {
  color: var(--color-text-strong);
  font-size: var(--font-size-sm);
  font-weight: 750;
}

.login-form__field input {
  width: 100%;
  min-height: 3rem;
  padding: 0 var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-neutral-0);
  color: var(--color-text-strong);
}

.login-form__field input:hover {
  border-color: var(--color-neutral-500);
}

.login-form__field input[aria-invalid='true'] {
  border-color: #a93232;
}

.login-form__error {
  padding: var(--space-3) var(--space-4);
  border-left: 0.1875rem solid #a93232;
  background: #fff0ef;
  color: #7f2222;
  font-size: var(--font-size-sm);
}

.login-form button {
  min-height: 3.25rem;
  border: 1px solid var(--color-tactical-900);
  border-radius: var(--radius-sm);
  background: var(--color-tactical-900);
  color: #fff8e6;
  font-weight: 850;
  cursor: pointer;
}

.login-form button:hover:not(:disabled) {
  background: var(--color-tactical-800);
}

.login-form button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.login-panel__demo {
  display: grid;
  gap: var(--space-1);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

.login-panel__demo strong {
  color: var(--color-text);
}

@media (min-width: 56rem) {
  .login-page__main {
    grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 0.85fr);
  }
}

@media (max-width: 29.99rem) {
  .login-page {
    padding: 0;
  }

  .login-page__main {
    min-height: 100vh;
    border: 0;
  }

  .login-page__environment {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .login-page__environment div {
    display: flex;
    justify-content: space-between;
    padding-top: var(--space-3);
    border-top: 1px solid rgb(255 255 255 / 8%);
  }

  .login-page__environment dd {
    margin: 0;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .login-page__skip,
  .login-form button,
  .login-form__field input {
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      transform 160ms ease;
  }
}
</style>
