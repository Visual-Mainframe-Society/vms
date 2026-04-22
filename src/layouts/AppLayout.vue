<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import StateSignedOut from '@/components/EmptyStateSignedOut.vue'
import AppNavigationDrawer from '@/components/AppNavigationDrawer.vue'
import AppBottomNavigation from '@/components/AppBottomNavigation.vue'

const auth = useAuthStore()
const route = useRoute()
</script>

<template>
  <AppNavigationDrawer />
  <AppBottomNavigation v-if="$vuetify.display.mobile" />
  <v-main>
    <StateSignedOut v-if="route.meta.requiresAuth && !auth.isSignedIn" />
    <RouterView v-else />
  </v-main>
</template>
