<template>
  <header class="app-header">
    <RouterLink
      class="app-header__home"
      to="/"
      aria-label="배틀그라운드 플레이어 지원 운영실 홈"
    >
      <span class="app-header__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="7" />
          <path d="M16 3v7M16 22v7M3 16h7M22 16h7" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      </span>
      <span class="app-header__name">
        <strong>BATTLEGROUNDS</strong>
        <small>PLAYER SUPPORT OPS</small>
      </span>
    </RouterLink>
    <span class="app-header__environment">비공식 포트폴리오 콘셉트</span>
  </header>
</template>

<style scoped>
.app-header__home {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
}

.app-header__mark {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(248 228 169 / 48%);
  border-radius: var(--radius-sm);
  background: rgb(214 165 47 / 12%);
  color: #f4c64f;
}

.app-header__mark svg {
  width: 1.55rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: square;
  stroke-width: 1.5;
}

.app-header__name {
  display: grid;
  line-height: 1.25;
}

.app-header__name strong {
  color: #fff8e6;
  font-size: 0.875rem;
  font-weight: 900;
  letter-spacing: 0.075em;
}

.app-header__name small {
  color: rgb(255 255 255 / 52%);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.app-header__environment {
  display: none;
  width: fit-content;
  margin-top: var(--space-4);
  padding: 0.2rem 0.4rem;
  border: 1px solid rgb(255 255 255 / 14%);
  color: rgb(255 255 255 / 48%);
  font-size: 0.5625rem;
  font-weight: 800;
  letter-spacing: 0.11em;
}

@media (min-width: 75rem) {
  .app-header__environment {
    display: inline-flex;
  }
}

@media (max-width: 29.99rem) {
  .app-header__name {
    display: none;
  }
}
</style>
