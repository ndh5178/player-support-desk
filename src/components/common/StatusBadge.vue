<script setup lang="ts">
import { computed } from 'vue'

import type { InquiryStatus } from '../../types/inquiry'
import { getStatusLabel } from '../../utils/inquiry'

const props = defineProps<{
  status: InquiryStatus
}>()

const label = computed(() => getStatusLabel(props.status))
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status.toLowerCase()}`">
    <span class="status-badge__dot" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  width: fit-content;
  padding: 0.3125rem 0.625rem;
  border-radius: 999px;
  background: var(--status-background);
  color: var(--status-color);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.status-badge__dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: currentcolor;
}

.status-badge--new {
  --status-background: #e8f3ff;
  --status-color: #155da1;
}

.status-badge--in_progress {
  --status-background: #fff3d6;
  --status-color: #8a5700;
}

.status-badge--waiting_customer {
  --status-background: #f0ebff;
  --status-color: #6645a8;
}

.status-badge--resolved {
  --status-background: #e8f7ef;
  --status-color: #24734c;
}
</style>
