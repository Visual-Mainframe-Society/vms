<script setup lang="ts">
import AppBar from '@/components/AppBar.vue'
import AppNavigation from '@/components/AppNavigation.vue'
</script>

<template>
  <AppBar />
  <AppNavigation />
  <v-main>
    <RouterView />
  </v-main>
</template>
