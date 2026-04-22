<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ProfileBasic } from '@/types'

defineProps<{
  profile: ProfileBasic
}>()

const router = useRouter()
</script>

<template>
  <v-toolbar flat color="background" density="compact">
    <template #default>
      <div class="d-flex align-center ga-2 flex-grow-1 overflow-hidden">
        <v-btn icon="mdi-arrow-left" @click="router.back()" class="flex-shrink-0" />
        <v-avatar size="24" class="flex-shrink-0">
          <v-img
            v-if="profile.avatar_url"
            referrerpolicy="no-referrer"
            :src="profile.avatar_url"
            cover
          />
          <v-icon v-else size="24">mdi-account-circle</v-icon>
        </v-avatar>
        <span class="font-weight-medium text-label-large text-truncate">{{
          profile.username
        }}</span>
      </div>
    </template>

    <template #append>
      <v-btn variant="text" class="text-info text-none flex-shrink-0">Follow</v-btn>
    </template>
  </v-toolbar>
</template>
