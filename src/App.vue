<template>
  <main class="setup-page">
    <p class="setup-page__eyebrow">Player Support Operations</p>
    <h1>플레이어 지원 데스크</h1>
    <p class="setup-page__description">
      글로벌 게임 서비스의 고객 문의를 빠르게 파악하고 처리하기 위한 운영
      대시보드입니다.
    </p>
  </main>
</template>

<style scoped>
.setup-page {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
  padding-block: 6rem;
}

.setup-page__eyebrow {
  margin: 0 0 0.75rem;
  color: var(--color-brand-700);
  font-size: var(--font-size-sm);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--color-text-strong);
  font-size: clamp(2rem, 7vw, 4rem);
  line-height: 1.1;
}

.setup-page__description {
  max-width: 42rem;
  margin: 1.25rem 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  line-height: 1.7;
}
</style>
