<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useSignIn } from '@/composables/useSignIn'
const auth = useAuthStore()
const { signIn, loading } = useSignIn()
</script>

<template>
  <v-app-bar color="background" class="border-b">
    <template #prepend>
      <v-app-bar-nav-icon :ripple="false" style="cursor: default; pointer-events: none">
        <v-icon icon="custom:vms" />
      </v-app-bar-nav-icon>
      <v-app-bar-title v-if="!$vuetify.display.mobile"> Visual Mainframe Society </v-app-bar-title>
    </template>

    <v-text-field
      placeholder="Search"
      prepend-inner-icon="mdi-magnify"
      :class="!$vuetify.display.mobile ? 'mx-16 px-16' : ''"
      density="compact"
      variant="outlined"
      rounded="xl"
      color="info"
      hide-details
      single-line
    />
    <template #append>
      <v-btn v-if="auth.isSignedIn" icon="mdi-bell-outline" />
      <v-btn icon="mdi-shopping-outline" />
      <v-btn
        v-if="!auth.isSignedIn"
        prepend-icon="mdi-google"
        text="Sign in"
        variant="tonal"
        @click="signIn"
        :loading="loading"
      />
    </template>
  </v-app-bar>
</template>
