<template>
  <div
    class="detail-skeleton"
    aria-label="문의 상세 정보를 불러오는 중"
    role="status"
    data-testid="inquiry-detail-skeleton"
  >
    <span class="sr-only">문의 상세 정보를 불러오는 중입니다.</span>

    <div class="detail-skeleton__header">
      <span class="skeleton-line skeleton-line--short"></span>
      <span class="skeleton-line skeleton-line--title"></span>
      <span class="skeleton-line skeleton-line--medium"></span>
    </div>

    <div class="detail-skeleton__layout">
      <div class="detail-skeleton__main">
        <section v-for="index in 2" :key="index" class="skeleton-card">
          <span class="skeleton-line skeleton-line--heading"></span>
          <span class="skeleton-line"></span>
          <span class="skeleton-line"></span>
          <span class="skeleton-line skeleton-line--medium"></span>
        </section>
      </div>
      <div class="detail-skeleton__aside">
        <section v-for="index in 2" :key="index" class="skeleton-card">
          <span class="skeleton-line skeleton-line--heading"></span>
          <span class="skeleton-field"></span>
          <span class="skeleton-field"></span>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-skeleton,
.detail-skeleton__main,
.detail-skeleton__aside {
  display: grid;
  gap: var(--space-5);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

.detail-skeleton__header {
  display: grid;
  gap: var(--space-3);
}

.detail-skeleton__layout {
  display: grid;
  gap: var(--space-5);
}

.skeleton-card {
  display: grid;
  gap: var(--space-4);
  min-height: 12rem;
  padding: var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 88%);
}

.skeleton-line,
.skeleton-field {
  display: block;
  height: 0.875rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-50) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.4s infinite linear;
}

.skeleton-line--short {
  width: 7rem;
}

.skeleton-line--title {
  width: min(36rem, 75%);
  height: 2rem;
}

.skeleton-line--medium {
  width: 60%;
}

.skeleton-line--heading {
  width: 9rem;
  height: 1.25rem;
}

.skeleton-field {
  height: 3rem;
  border-radius: var(--radius-sm);
}

@keyframes loading {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}

@media (min-width: 64rem) {
  .detail-skeleton__layout {
    grid-template-columns: minmax(0, 1.75fr) minmax(19rem, 0.8fr);
    align-items: start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-line,
  .skeleton-field {
    animation: none;
  }
}
</style>
