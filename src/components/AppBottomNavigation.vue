<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()

const route = useRoute()

const items = ref([
  {
    title: 'Home',
    iconOutline: 'mdi-home-outline',
    iconFilled: 'mdi-home',
    to: { name: 'home' },
  },
  {
    title: 'Gallery',
    iconOutline: 'mdi-image-multiple-outline',
    iconFilled: 'mdi-image-multiple',
    to: { name: 'gallery' },
  },
  {
    title: 'Account',
    iconOutline: 'mdi-account-circle-outline',
    iconFilled: 'mdi-account-circle',
    to: { name: 'account' },
  },
])

const selected = ref<string>()

watch(
  () => route.name,
  (name) => {
    selected.value = name as string
  },
  { immediate: true },
)
</script>
<template>
  <v-bottom-navigation
    v-model="selected"
    v-if="$vuetify.display.mobile"
    :elevation="0"
    grow
    bg-color="background"
    class="border-t"
  >
    <v-btn
      v-for="item in items"
      :to="item.to"
      :key="item.title"
      :value="item.to.name"
      :exact="item.to.name === 'home'"
      min-width="0"
    >
      <template v-if="item.to.name === 'account' && auth.avatarUrl">
        <v-avatar size="24">
          <img
            :src="auth.avatarUrl"
            referrerpolicy="no-referrer"
            style="width: 24px; height: 24px; object-fit: cover; border-radius: 50%"
          />
        </v-avatar>
      </template>
      <template v-else>
        <v-icon>
          {{ selected === item.to.name ? item.iconFilled : item.iconOutline }}
        </v-icon>
        <span>{{ item.title }}</span>
      </template>
    </v-btn>
  </v-bottom-navigation>
</template>
