<script setup lang="ts">
defineProps<{ icon: string; text: string }>()
</script>

<template>
  <div class="d-flex flex-column align-center py-4 ga-2 text-medium-emphasis">
    <v-icon size="36" >{{ icon }}</v-icon>
    <span >{{ text }}</span>
  </div>
</template>
