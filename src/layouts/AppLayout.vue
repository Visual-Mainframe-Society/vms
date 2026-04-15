<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import StateSignedOut from '@/components/StateSignedOut.vue'
import AppNavigationDrawer from '@/components/AppNavigationDrawer.vue'

const auth = useAuthStore()
const route = useRoute()
</script>

<template>
  <AppNavigationDrawer />
  <v-main>
    <StateSignedOut v-if="route.meta.requiresAuth && !auth.isSignedIn" />
    <RouterView v-else />
  </v-main>
</template>
