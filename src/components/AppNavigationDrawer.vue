<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSignIn } from '@/composables/useSignIn'
import AppSearch from '@/components/AppSearch.vue'

const auth = useAuthStore()
const route = useRoute()
const { signIn, loading } = useSignIn()

const searchOpen = ref(false)

const items = ref([
  { title: 'Home', iconOutline: 'mdi-home-outline', iconFilled: 'mdi-home', to: { name: 'home' } },
  {
    title: 'Explore',
    iconOutline: 'mdi-image-multiple-outline',
    iconFilled: 'mdi-image-multiple',
    to: { name: 'explore' },
  },
  { title: 'Cart', iconOutline: 'mdi-cart-outline', iconFilled: 'mdi-cart', to: { name: 'cart' } },
  {
    title: 'Notifications',
    iconOutline: 'mdi-bell-outline',
    iconFilled: 'mdi-bell',
    to: { name: 'notifications' },
  },
  {
    title: 'Studio',
    iconOutline: 'mdi-draw',
    iconFilled: 'mdi-draw',
    to: { name: 'studio' },
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
    searchOpen.value = false
  },
  { immediate: true },
)
</script>

<template>
  <AppSearch v-model="searchOpen" />
  <v-navigation-drawer v-if="!$vuetify.display.xs" permanent rail :expand-on-hover="!searchOpen">
    <v-list nav>
      <v-list-item title="Visual Mainframe Society">
        <template #prepend>
          <v-icon icon="custom:vms" class="opacity-100" />
        </template>
      </v-list-item>

      <v-list-item
        prepend-icon="mdi-magnify"
        title="Search"
        rounded="xl"
        @click="searchOpen = true"
      />

      <template v-for="(item, i) in items" :key="i">
        <v-list-item
          v-if="item.to.name !== 'account'"
          :to="item.to"
          :title="item.title"
          :exact="item.to.name === 'home'"
          rounded="xl"
        >
          <template #prepend>
            <v-icon>{{ route.name === item.to.name ? item.iconFilled : item.iconOutline }}</v-icon>
          </template>
        </v-list-item>
      </template>

      <v-list-item v-if="auth.isSignedIn" title="Account" :to="{ name: 'account' }" rounded="xl">
        <template #prepend>
          <v-avatar v-if="auth.avatarUrl" size="24">
            <img
              :src="auth.avatarUrl"
              referrerpolicy="no-referrer"
              style="width: 24px; height: 24px; object-fit: cover; border-radius: 50%"
            />
          </v-avatar>
          <v-icon v-else>{{
            route.name === 'account' ? 'mdi-account-circle' : 'mdi-account-circle-outline'
          }}</v-icon>
        </template>
      </v-list-item>

      <v-list-item v-else rounded="xl" @click="signIn" base-color="info" :disabled="loading">
        <template #prepend>
          <v-icon class="opacity-100">mdi-google</v-icon>
        </template>
        <template #title>
          <span :class="loading ? 'text-flashing' : ''">{{
            loading ? 'Signing in...' : 'Sign in'
          }}</span>
        </template>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.text-flashing {
  animation: flash 1s ease-in-out infinite;
}
@keyframes flash {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.2;
  }
}
</style>
