<script setup lang="ts">
// 대시보드가 전달한 통계 한 건을 표시만 하는 프레젠테이션 컴포넌트다.
defineProps<{
  label: string
  value: number
  description: string
  tone: 'neutral' | 'info' | 'progress' | 'danger'
}>()
</script>

<template>
  <article class="summary-card" :class="`summary-card--${tone}`">
    <div class="summary-card__heading">
      <p>{{ label }}</p>
      <span class="summary-card__icon" aria-hidden="true">
        <svg v-if="tone === 'neutral'" viewBox="0 0 24 24">
          <path d="M4 5h16v14H4zM4 9h16M8 13h3m-3 3h6" />
        </svg>
        <svg v-else-if="tone === 'info'" viewBox="0 0 24 24">
          <path d="M4 6h16v12H4zM4 7l8 6 8-6" />
        </svg>
        <svg v-else-if="tone === 'progress'" viewBox="0 0 24 24">
          <path d="M12 6v6l4 2M21 12a9 9 0 1 1-3-6.7" />
        </svg>
        <svg v-else viewBox="0 0 24 24">
          <path d="M12 8v4m0 4h.01M5 21h14l2-4-9-14-9 14 2 4Z" />
        </svg>
      </span>
    </div>
    <strong>{{ value.toLocaleString('ko-KR') }}</strong>
    <p class="summary-card__description">{{ description }}</p>
  </article>
</template>

<style scoped>
.summary-card {
  --card-accent: var(--color-brand-700);
  --card-tint: var(--color-brand-50);

  display: grid;
  gap: var(--space-3);
  min-width: 0;
  padding: var(--space-5);
  border: 1px solid var(--color-border);
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-md);
  background: rgb(255 255 255 / 92%);
  box-shadow: var(--shadow-sm);
}

.summary-card::before {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0.1875rem;
  background: var(--card-accent);
  content: '';
}

.summary-card::after {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 1.25rem;
  height: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  content: '';
  transform: translate(50%, -50%) rotate(45deg);
}

.summary-card--neutral {
  --card-accent: #565d51;
  --card-tint: #ecebe4;
}

.summary-card--info {
  --card-accent: #356f98;
  --card-tint: #e6eff5;
}

.summary-card--progress {
  --card-accent: #9a690d;
  --card-tint: #fbefd2;
}

.summary-card--danger {
  --card-accent: #a33432;
  --card-tint: #f8e8e5;
}

.summary-card__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.summary-card__heading p {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.summary-card__icon {
  display: grid;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border-radius: var(--radius-sm);
  background: var(--card-tint);
  color: var(--card-accent);
}

.summary-card__icon svg {
  width: 1.125rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.summary-card strong {
  color: var(--color-text-strong);
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  line-height: 1;
}

.summary-card__description {
  color: var(--color-text-muted);
  font-size: 0.8125rem;
}
</style>
