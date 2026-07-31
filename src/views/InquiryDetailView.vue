<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="page">
    <header class="page-header">
      <p class="page-header__eyebrow">Inquiry detail</p>
      <h1>문의 상세</h1>
      <p class="page-header__description">
        문의 번호 {{ route.params.id }}의 고객 정보와 처리 이력을 확인합니다.
      </p>
    </header>

    <section class="placeholder-panel" aria-labelledby="inquiry-detail-ready-title">
      <h2 id="inquiry-detail-ready-title">상세 화면 준비 완료</h2>
      <p>
        다음 기능 작업에서 상태·담당자 변경, 처리 이력, 운영 메모를 실제 Mock API와
        연결합니다.
      </p>
    </section>
  </div>
</template>
