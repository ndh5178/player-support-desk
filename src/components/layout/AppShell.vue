<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import Navigation from './Navigation.vue'
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">본문 바로가기</a>

    <aside class="app-shell__sidebar" aria-label="앱 내비게이션">
      <AppHeader />
      <Navigation />
    </aside>

    <main id="main-content" class="app-shell__main" tabindex="-1">
      <div class="app-shell__content">
        <slot />
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
  background:
    linear-gradient(145deg, rgb(255 255 255 / 7%), transparent 40%),
    var(--color-brand-900);
  color: var(--color-neutral-0);
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
    align-content: start;
    gap: var(--space-10);
    height: 100vh;
    padding: var(--space-8) var(--space-5);
    border-right: 1px solid rgb(255 255 255 / 14%);
    border-bottom: 0;
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
