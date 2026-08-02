<script setup lang="ts">
// 메뉴 정보를 배열로 분리해 같은 구조의 RouterLink를 v-for로 반복한다.
const navigationItems = [
  { label: '전황 대시보드', to: '/' },
  { label: '플레이어 문의', to: '/inquiries' },
] as const
</script>

<template>
  <nav aria-label="주요 메뉴">
    <ul class="navigation">
      <li v-for="item in navigationItems" :key="item.to">
        <RouterLink class="navigation__link" :to="item.to">
          <span class="navigation__icon" aria-hidden="true">
            <svg v-if="item.to === '/'" viewBox="0 0 24 24">
              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
            </svg>
            <svg v-else viewBox="0 0 24 24">
              <path d="M4 5h16v14H4zM4 9h16M8 13h8M8 16h5" />
            </svg>
          </span>
          <strong>{{ item.label }}</strong>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navigation {
  display: flex;
  gap: var(--space-2);
  padding: 0;
  margin: 0;
  overflow-x: auto;
  list-style: none;
  scrollbar-width: thin;
}

.navigation__link {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  gap: var(--space-3);
  border-radius: var(--radius-sm);
  color: rgb(255 255 255 / 66%);
  font-size: var(--font-size-sm);
  text-decoration: none;
  white-space: nowrap;
}

.navigation__icon {
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 12%);
  color: rgb(255 255 255 / 55%);
}

.navigation__icon svg {
  width: 1rem;
  fill: none;
  stroke: currentcolor;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.navigation__link strong {
  font-size: 0.8125rem;
  font-weight: 750;
}

.navigation__link:hover {
  background: rgb(255 255 255 / 8%);
  color: var(--color-neutral-0);
}

.navigation__link.router-link-exact-active {
  border-color: rgb(214 165 47 / 42%);
  background: linear-gradient(90deg, rgb(214 165 47 / 18%), rgb(255 255 255 / 5%));
  color: #fff8e6;
  box-shadow: inset 0.1875rem 0 #d6a52f;
}

.navigation__link.router-link-exact-active .navigation__icon {
  border-color: rgb(214 165 47 / 48%);
  color: #f4c64f;
}

@media (min-width: 75rem) {
  .navigation {
    display: grid;
    overflow: visible;
  }

  .navigation__link {
    min-height: 3rem;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .navigation__link {
    transition:
      background-color 160ms ease,
      border-color 160ms ease,
      color 160ms ease;
  }
}
</style>
