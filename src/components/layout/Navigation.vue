<script setup lang="ts">
const navigationItems = [
  { label: '대시보드', to: '/' },
  { label: '문의 관리', to: '/inquiries' },
] as const
</script>

<template>
  <nav aria-label="주요 메뉴">
    <ul class="navigation">
      <li v-for="item in navigationItems" :key="item.to">
        <RouterLink class="navigation__link" :to="item.to">
          {{ item.label }}
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
  border-radius: var(--radius-md);
  color: rgb(255 255 255 / 72%);
  font-size: var(--font-size-sm);
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}

.navigation__link:hover {
  background: rgb(255 255 255 / 8%);
  color: var(--color-neutral-0);
}

.navigation__link.router-link-exact-active {
  border-color: rgb(255 255 255 / 12%);
  background: rgb(255 255 255 / 14%);
  color: var(--color-neutral-0);
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
