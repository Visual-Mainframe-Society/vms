<script setup lang="ts">
defineProps<{ icon: string; text: string }>()
</script>

<template>
  <div class="d-flex flex-column align-center py-12 text-medium-emphasis">
    <v-icon size="40" class="mb-3">{{ icon }}</v-icon>
    <span class="text-body-2">{{ text }}</span>
  </div>
</template>
