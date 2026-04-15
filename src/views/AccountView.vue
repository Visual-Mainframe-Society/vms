<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'

const auth = useAuthStore()
const profile = useProfileStore()
</script>

<template>
  <v-container>
    <v-card class="text-center" color="background" elevation="0">
      <v-avatar size="96" class="my-4">
        <img
          v-if="profile.avatarUrl"
          :src="profile.avatarUrl"
          referrerpolicy="no-referrer"
          style="width: 96px; height: 96px; object-fit: cover; border-radius: 50%"
        />
        <!-- Optional: fallback icon if no avatar -->
        <v-icon v-else size="96" icon="mdi-account-circle" />
      </v-avatar>

      <v-card-title>{{ profile.displayName }}</v-card-title>
      <v-card-subtitle>{{ profile.email }}</v-card-subtitle>

      <v-card-actions class="py-4 justify-center">
        <v-btn
          rounded="xl"
          variant="tonal"
          color="error"
          prepend-icon="mdi-logout"
          :loading="auth.isSigningOut"
          @click="auth.signOut"
        >
          Sign out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
