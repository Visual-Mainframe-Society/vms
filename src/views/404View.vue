<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <v-container>
    <v-empty-state
      icon="mdi-map-search-outline"
      title="Page not found"
      text="The page you're looking for doesn't exist or may have been moved."
      class="mt-16 ga-4"
    >
      <template #actions>
        <v-btn
          rounded="xl"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-home-outline"
          @click="router.push({ name: 'home' })"
        >
          Go home
        </v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>
