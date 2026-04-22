<script setup lang="ts">
defineProps<{
  imageUrls: string[]
  modelValue: number
}>()

defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

<template>
  <v-carousel
    v-if="imageUrls.length"
    :model-value="modelValue"
    height="100%"
    hide-delimiter-background
    :show-arrows="imageUrls.length > 1 ? 'hover' : false"
    class="flush-carousel"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-carousel-item v-for="(url, i) in imageUrls" :key="i">
      <img :src="url" style="display: block; width: 100%; height: 100%; object-fit: contain" />
    </v-carousel-item>
  </v-carousel>

  <div v-else class="d-flex align-center justify-center" style="height: 100%">
    <v-icon size="72" color="medium-emphasis">mdi-image-off-outline</v-icon>
  </div>
</template>

<style scoped>
.flush-carousel :deep(.v-carousel-item > div) {
  padding: 0 !important;
}
</style>
