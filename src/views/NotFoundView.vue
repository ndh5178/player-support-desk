<template>
  <div class="page">
    <header class="page-header">
      <p class="page-header__eyebrow">404 error</p>
      <h1>페이지를 찾을 수 없습니다</h1>
      <p class="page-header__description">
        주소가 올바른지 확인하거나 대시보드로 돌아가 주세요.
      </p>
    </header>

    <p>
      <RouterLink class="back-link" to="/">대시보드로 돌아가기</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  padding-inline: var(--space-5);
  border-radius: var(--radius-md);
  background: var(--color-brand-600);
  color: var(--color-neutral-0);
  font-weight: 700;
  text-decoration: none;
}

.back-link:hover {
  background: var(--color-brand-700);
}
</style>
