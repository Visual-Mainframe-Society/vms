<script setup lang="ts">
import AppSnackbar from './components/AppSnackbar.vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
auth.init()
</script>

<template>
  <v-app>
    <AppSnackbar />
    <RouterView />
  </v-app>
</template>
