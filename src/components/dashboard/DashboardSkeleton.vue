<template>
  <div class="dashboard-skeleton" role="status" aria-live="polite">
    <span class="dashboard-skeleton__announcement"> 운영 현황을 불러오는 중입니다. </span>

    <div class="dashboard-skeleton__cards" aria-hidden="true">
      <div v-for="index in 4" :key="index" class="skeleton-card">
        <span></span>
        <strong></strong>
        <span></span>
      </div>
    </div>

    <div class="dashboard-skeleton__panels" aria-hidden="true">
      <div class="skeleton-panel skeleton-panel--wide">
        <span class="skeleton-panel__title"></span>
        <span v-for="index in 5" :key="index" class="skeleton-panel__row"></span>
      </div>
      <div class="skeleton-panel">
        <span class="skeleton-panel__title"></span>
        <span v-for="index in 4" :key="index" class="skeleton-panel__bar"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-skeleton {
  display: grid;
  gap: var(--space-6);
}

.dashboard-skeleton__announcement {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.dashboard-skeleton__cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.skeleton-card,
.skeleton-panel {
  overflow: hidden;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 80%);
}

.skeleton-card {
  display: grid;
  gap: var(--space-4);
}

.skeleton-card span,
.skeleton-card strong,
.skeleton-panel span {
  display: block;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-50) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s infinite linear;
}

.skeleton-card span:first-child {
  width: 55%;
  height: 0.875rem;
}

.skeleton-card strong {
  width: 35%;
  height: 2.25rem;
}

.skeleton-card span:last-child {
  width: 75%;
  height: 0.75rem;
}

.dashboard-skeleton__panels {
  display: grid;
  gap: var(--space-4);
}

.skeleton-panel {
  display: grid;
  align-content: start;
  gap: var(--space-5);
  min-height: 22rem;
}

.skeleton-panel__title {
  width: 35%;
  height: 1.25rem;
}

.skeleton-panel__row {
  width: 100%;
  height: 2.75rem;
}

.skeleton-panel__bar {
  width: 100%;
  height: 1.75rem;
}

@keyframes skeleton-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (min-width: 48rem) {
  .dashboard-skeleton__cards {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (min-width: 75rem) {
  .dashboard-skeleton__panels {
    grid-template-columns: minmax(0, 1.8fr) minmax(18rem, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card span,
  .skeleton-card strong,
  .skeleton-panel span {
    animation: none;
  }
}
</style>
