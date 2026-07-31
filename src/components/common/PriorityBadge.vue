<script setup lang="ts">
import { computed } from 'vue'

import type { InquiryPriority } from '../../types/inquiry'
import { getPriorityLabel } from '../../utils/inquiry'

const props = defineProps<{
  priority: InquiryPriority
}>()

const label = computed(() => getPriorityLabel(props.priority))
</script>

<template>
  <span class="priority-badge" :class="`priority-badge--${priority.toLowerCase()}`">
    <span class="priority-badge__marker" aria-hidden="true"></span>
    {{ label }}
  </span>
</template>

<style scoped>
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  width: fit-content;
  color: var(--priority-color);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.priority-badge__marker {
  width: 0.25rem;
  height: 0.75rem;
  border-radius: 999px;
  background: currentcolor;
}

.priority-badge--urgent {
  --priority-color: #b52b38;
}

.priority-badge--high {
  --priority-color: #bd5a0a;
}

.priority-badge--normal {
  --priority-color: #246f77;
}

.priority-badge--low {
  --priority-color: #64757d;
}
</style>
