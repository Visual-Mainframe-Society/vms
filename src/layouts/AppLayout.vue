<script setup lang="ts">
import AppNavigationDrawer from '@/components/AppNavigationDrawer.vue'
</script>

<template>
  <AppNavigationDrawer />
  <v-main>
    <RouterView />
  </v-main>
</template>
