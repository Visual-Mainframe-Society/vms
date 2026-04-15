<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import StateSignedOut from '@/components/StateSignedOut.vue'
import StateNotAdmin from '@/components/StateNotAdmin.vue'

const auth = useAuthStore()
const profile = useProfileStore()
</script>

<template>
  <v-app-bar flat border="b">
    <v-app-bar-title>
      <span class="font-weight-bold">Admin</span>
    </v-app-bar-title>

    <template #append>
      <v-btn
        v-if="auth.isSignedIn"
        variant="text"
        class="text-none mr-2"
        rounded="lg"
        :loading="auth.isSigningOut"
        @click="auth.signOut"
      >
        Sign out
      </v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <StateSignedOut v-if="!auth.isSignedIn" />
    <StateNotAdmin v-else-if="!profile.isAdmin" />
    <RouterView v-else />
  </v-main>
</template>
