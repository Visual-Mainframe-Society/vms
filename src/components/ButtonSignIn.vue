<script setup lang="ts">
import { useSignIn } from '@/composables/useSignIn'

const { signIn, loading } = useSignIn()
</script>

<template>
  <v-btn
    color="info"
    prepend-icon="mdi-google"
    rounded="md"
    class="text-none ma-2"
    :loading="loading"
    :disabled="loading"
    @click="signIn"
  >
    Continue with Google
  </v-btn>
</template>
