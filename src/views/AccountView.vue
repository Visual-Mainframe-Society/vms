<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabaseClient'
import SignedOutState from '@/components/SignedOutState.vue'

const auth = useAuthStore()

async function signOut() {
  await supabase.auth.signOut()
}
</script>

<template>
  <v-container>
    <SignedOutState v-if="!auth.isSignedIn" />
    <template v-else>
      <v-card class="text-center" color="background" elevation="0">
        <v-avatar size="96" class="my-4">
          <img
            v-if="auth.avatarUrl"
            :src="auth.avatarUrl"
            referrerpolicy="no-referrer"
            style="width: 96px; height: 96px; object-fit: cover; border-radius: 50%"
          />
        </v-avatar>
        <v-card-title>{{ auth.fullName }}</v-card-title>
        <v-card-subtitle>{{ auth.email }}</v-card-subtitle>
        <v-card-actions class="py-4 justify-center">
          <v-btn
            rounded="xl"
            variant="tonal"
            color="error"
            prepend-icon="mdi-logout"
            @click="signOut"
          >
            Sign out
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-container>
</template>
