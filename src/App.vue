<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

import AppShell from '@/components/layout/AppShell.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated && route.meta.public !== true) {
      void router.replace({
        name: 'login',
        query: { redirect: route.fullPath },
      })
    }
  },
)
</script>

<template>
  <AppShell v-if="route.meta.public !== true">
    <!-- 현재 URL과 일치하는 페이지 컴포넌트가 AppShell의 본문 슬롯에 표시된다. -->
    <RouterView></RouterView>
  </AppShell>
  <RouterView v-else></RouterView>
</template>
