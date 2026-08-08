<script setup lang="ts">
// 부모는 오류 내용을 Props로 주고, 이 컴포넌트는 재시도 의도만 retry 이벤트로 알린다.
defineProps<{
  title: string
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

<template>
  <section class="error-state" role="alert" aria-live="assertive">
    <span class="error-state__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          d="M12 8v4m0 4h.01M10.3 3.9 2.7 17.1A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.9L13.7 3.9a2 2 0 0 0-3.4 0Z"
        />
      </svg>
    </span>
    <div>
      <h2>{{ title }}</h2>
      <p>{{ message }}</p>
    </div>
    <button type="button" v-on:click="$emit('retry')">다시 시도</button>
  </section>
</template>

<style scoped>
.error-state {
  display: grid;
  justify-items: center;
  gap: var(--space-4);
  padding: clamp(var(--space-8), 8vw, 4.5rem) var(--space-5);
  border: 1px solid #f0c9cd;
  border-radius: var(--radius-lg);
  background: rgb(255 255 255 / 90%);
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.error-state__icon {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 50%;
  background: #fdebed;
  color: #a32431;
}

.error-state__icon svg {
  width: 1.5rem;
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.error-state h2 {
  color: var(--color-text-strong);
  font-size: 1.125rem;
}

.error-state p {
  max-width: 32rem;
  margin-top: var(--space-2);
  color: var(--color-text-muted);
}

.error-state button {
  min-height: 2.75rem;
  padding: 0.625rem var(--space-5);
  border: 0;
  border-radius: var(--radius-sm);
  background: var(--color-brand-700);
  color: var(--color-neutral-0);
  font-weight: 700;
  cursor: pointer;
}

.error-state button:hover {
  background: var(--color-brand-900);
}
</style>
