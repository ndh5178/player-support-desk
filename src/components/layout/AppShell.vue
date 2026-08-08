<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import Navigation from './Navigation.vue'
</script>

<template>
  <div class="app-shell">
    <!-- 키보드 사용자가 반복되는 내비게이션을 건너뛰고 본문으로 이동할 수 있다. -->
    <a class="skip-link" href="#main-content">본문 바로가기</a>

    <aside class="app-shell__sidebar" aria-label="앱 내비게이션">
      <AppHeader></AppHeader>
      <Navigation></Navigation>

      <div class="app-shell__status" aria-label="지원 운영 환경">
        <p><span aria-hidden="true"></span> 데모 환경</p>
        <strong>KR / PC 플레이어 지원</strong>
        <small>모의 플레이어 지원 환경</small>
      </div>
    </aside>

    <main id="main-content" class="app-shell__main" tabindex="-1">
      <div class="app-shell__content">
        <!-- App.vue가 전달한 현재 라우트 화면을 공통 레이아웃 안에 삽입한다. -->
        <slot></slot>
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.skip-link {
  position: fixed;
  z-index: 100;
  top: var(--space-3);
  left: var(--space-3);
  min-height: 2.75rem;
  padding: 0.625rem var(--space-4);
  border-radius: var(--radius-sm);
  background: var(--color-neutral-0);
  color: var(--color-brand-900);
  font-weight: 800;
  text-decoration: none;
  transform: translateY(calc(-100% - var(--space-5)));
}

.skip-link:focus {
  transform: translateY(0);
}

.app-shell__sidebar {
  position: relative;
  z-index: 1;
  display: grid;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid rgb(255 255 255 / 14%);
  overflow: hidden;
  background:
    linear-gradient(rgb(255 255 255 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 3%) 1px, transparent 1px),
    radial-gradient(circle at 20% 12%, rgb(214 165 47 / 12%), transparent 16rem),
    var(--color-tactical-900);
  background-size:
    2.5rem 2.5rem,
    2.5rem 2.5rem,
    auto,
    auto;
  color: var(--color-neutral-0);
}

.app-shell__sidebar::after {
  position: absolute;
  z-index: -1;
  right: -6rem;
  bottom: 4rem;
  width: 14rem;
  height: 14rem;
  border: 1px solid rgb(214 165 47 / 10%);
  border-radius: 50%;
  box-shadow:
    0 0 0 2rem rgb(214 165 47 / 3%),
    0 0 0 4rem rgb(214 165 47 / 2%);
  content: '';
}

.app-shell__status {
  display: none;
  align-self: end;
  padding: var(--space-4);
  border: 1px solid rgb(255 255 255 / 10%);
  background: rgb(0 0 0 / 16%);
}

.app-shell__status p {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: #f4c64f;
  font-size: 0.625rem;
  font-weight: 850;
  letter-spacing: 0.12em;
}

.app-shell__status p span {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background: #70b986;
  box-shadow: 0 0 0 0.1875rem rgb(112 185 134 / 14%);
}

.app-shell__status strong,
.app-shell__status small {
  display: block;
}

.app-shell__status strong {
  margin-top: var(--space-3);
  color: #fff8e6;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
}

.app-shell__status small {
  margin-top: 0.2rem;
  color: rgb(255 255 255 / 42%);
  font-size: 0.6875rem;
}

.app-shell__sidebar :deep(:focus-visible) {
  outline-color: var(--color-focus-on-dark);
}

.app-shell__main {
  min-width: 0;
}

.app-shell__main:focus {
  outline: none;
}

.app-shell__content {
  width: min(100%, var(--content-max-width));
  margin-inline: auto;
  padding: var(--space-8) var(--space-4) 4rem;
}

@media (min-width: 48rem) {
  .app-shell__sidebar {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    padding-inline: var(--space-8);
  }

  .app-shell__content {
    padding-inline: var(--space-8);
  }
}

@media (min-width: 75rem) {
  .app-shell {
    display: grid;
    grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  }

  .app-shell__sidebar {
    position: sticky;
    top: 0;
    align-self: start;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
    align-content: stretch;
    gap: var(--space-10);
    height: 100vh;
    padding: var(--space-8) var(--space-5);
    border-right: 1px solid rgb(255 255 255 / 14%);
    border-bottom: 0;
  }

  .app-shell__status {
    display: block;
  }

  .app-shell__content {
    padding: var(--space-10);
  }
}

@media (prefers-reduced-motion: no-preference) {
  .skip-link {
    transition: transform 160ms ease;
  }
}
</style>
