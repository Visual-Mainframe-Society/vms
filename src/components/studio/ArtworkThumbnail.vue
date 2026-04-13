<script setup lang="ts">
defineProps<{
  src?: string | null
  avatar?: boolean
}>()
</script>

<template>
  <v-avatar v-if="avatar" rounded="lg" size="48">
    <div class="thumbnail-wrapper">
      <v-img v-if="src" :src="src" cover width="48" height="48" />
      <v-icon v-else icon="mdi-image-off-outline" color="medium-emphasis" size="48" />
    </div>
  </v-avatar>
  <div v-else class="thumbnail-wrapper">
    <v-img v-if="src" :src="src" cover width="48" height="48" />
    <v-icon v-else icon="mdi-image-off-outline" color="medium-emphasis" size="48" />
  </div>
</template>

<style scoped>
.thumbnail-wrapper {
  width: 48px;
  height: 48px;
  min-width: 48px;
  flex-shrink: 0;
  border-radius: 0.5rem; /* matches rounded-lg */
  overflow: hidden;
}
</style>
