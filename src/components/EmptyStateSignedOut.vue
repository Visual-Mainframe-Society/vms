<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSignIn } from '@/composables/useSignIn'

const { signIn, loading } = useSignIn()
const route = useRoute()

const context = computed(() => {
  // Check if we are on any admin-related page first via meta or name
  if (route.meta.requiresAdmin || route.name?.toString().startsWith('admin')) {
    return {
      title: 'Admin Control Center',
      text: 'Please sign in with an administrator account to access the review queue and system settings.',
    }
  }

  switch (route.name) {
    case 'notifications':
      return {
        title: 'Stay in the loop',
        text: 'Join the conversation! Sign in to see your latest alerts and interactions.',
      }
    case 'studio':
      return {
        title: 'Ready to create?',
        text: 'Step into your creative space to manage your projects and artwork.',
      }
    case 'account':
      return {
        title: 'Make it yours',
        text: 'Sign in to access your personal settings and customize your experience.',
      }
    default:
      return {
        title: 'Let’s get you started',
        text: 'Sign in to unlock the full experience and explore everything we have to offer.',
      }
  }
})
</script>

<template>
  <v-container>
    <v-empty-state
      icon="mdi-account-circle-outline"
      :title="context.title"
      :text="context.text"
      class="mt-16 ga-4"
    >
      <template #actions>
        <v-btn
          rounded="xl"
          variant="outlined"
          color="info"
          prepend-icon="mdi-google"
          :loading="loading"
          :disabled="loading"
          @click="signIn"
        >
          Continue with Google
        </v-btn>
      </template>
    </v-empty-state>
  </v-container>
</template>
