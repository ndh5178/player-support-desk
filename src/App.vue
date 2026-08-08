<script setup lang="ts">
import { RouterView } from 'vue-router'

import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <!-- 현재 URL과 일치하는 페이지 컴포넌트가 AppShell의 본문 슬롯에 표시된다. -->
    <RouterView></RouterView>
  </AppShell>
</template>
