<!-- src/components/icons/IconVMS.vue -->
<script setup lang="ts">
import vmsSvg from '@/assets/vms.svg?raw'
import { computed } from 'vue'

const props = defineProps<{ size?: number | string }>()
const dim = computed(() => `${props.size ?? 24}px`)
</script>

<template>
  <span
    v-html="vmsSvg"
    :style="{ width: dim, height: dim, display: 'inline-flex', flexShrink: 0 }"
    class="vms-icon"
  />
</template>

<style scoped>
.vms-icon :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
