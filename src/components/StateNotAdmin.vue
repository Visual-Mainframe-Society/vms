<script setup lang="ts">
import { useSignIn } from '@/composables/useSignIn'

const { signIn, loading } = useSignIn()
</script>

<template>
  <v-container>
    <v-empty-state
      icon="mdi-shield-off-outline"
      title="Access denied"
      text="This account does not have admin privileges."
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
          Sign in with a different account
        </v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>
