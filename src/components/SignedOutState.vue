<script setup lang="ts">
import { useSignIn } from '@/composables/useSignIn'
const { signIn, loading } = useSignIn()
</script>

<template>
  <v-empty-state
    icon="mdi-lock-outline"
    title="Sign in required"
    text="You need to be signed in to view this page"
    class="mt-16 ga-4"
  >
    <template #actions>
      <v-btn
        rounded="xl"
        variant="outlined"
        color="info"
        prepend-icon="mdi-google"
        :loading="loading"
        @click="signIn"
      >
        Sign in with Google
      </v-btn>
    </template>
  </v-empty-state>
</template>
