<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import Navigation from './Navigation.vue'
</script>

<template>
  <div class="app-shell">
    <aside class="app-shell__sidebar">
      <AppHeader />
      <Navigation />
    </aside>

    <main id="main-content" class="app-shell__main">
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

.app-shell__main {
  min-width: 0;
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
</style>
