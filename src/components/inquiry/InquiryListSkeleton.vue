<template>
  <div class="list-skeleton" role="status" aria-live="polite">
    <span class="list-skeleton__announcement"> 문의 목록을 불러오는 중입니다. </span>

    <div class="list-skeleton__table" aria-hidden="true">
      <span class="list-skeleton__header"></span>
      <span v-for="index in 6" v-bind:key="index" class="list-skeleton__row"></span>
    </div>
  </div>
</template>

<style scoped>
.list-skeleton__announcement {
  position: absolute;
  overflow: hidden;
  width: 1px;
  height: 1px;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.list-skeleton__table {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 85%);
}

.list-skeleton__header,
.list-skeleton__row {
  display: block;
  border-radius: var(--radius-sm);
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-50) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 200% 100%;
  animation: list-skeleton-shimmer 1.4s infinite linear;
}

.list-skeleton__header {
  height: 2.5rem;
}

.list-skeleton__row {
  height: 5.25rem;
}

@keyframes list-skeleton-shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .list-skeleton__header,
  .list-skeleton__row {
    animation: none;
  }
}
</style>
