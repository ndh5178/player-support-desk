<template>
  <header class="app-header">
    <RouterLink class="app-header__home" to="/" aria-label="플레이어 지원 데스크 홈">
      <span class="app-header__mark" aria-hidden="true">PS</span>
      <span class="app-header__name">
        <strong>Player Support</strong>
        <small>Operations Desk</small>
      </span>
    </RouterLink>
  </header>
</template>

<style scoped>
.app-header__home {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  border-radius: var(--radius-sm);
  color: inherit;
  text-decoration: none;
}

.app-header__mark {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 32%);
  border-radius: var(--radius-md);
  background: var(--color-brand-500);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
}

.app-header__name {
  display: grid;
  line-height: 1.25;
}

.app-header__name strong {
  font-size: 0.9375rem;
}

.app-header__name small {
  color: rgb(255 255 255 / 62%);
  font-size: 0.75rem;
}

@media (max-width: 29.99rem) {
  .app-header__name {
    display: none;
  }
}
</style>
