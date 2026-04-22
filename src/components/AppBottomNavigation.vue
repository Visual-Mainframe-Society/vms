<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { useSignIn } from '@/composables/useSignIn'

const auth = useAuthStore()
const profile = useProfileStore()
const route = useRoute()
// loading is the shared module-level ref — reflects state from any sign-in button
const { signIn, loading } = useSignIn()

const selected = ref<string>()

const items = [
  { title: 'Home', iconOutline: 'mdi-home-outline', iconFilled: 'mdi-home', to: { name: 'home' } },
  {
    title: 'Explore',
    iconOutline: 'mdi-image-multiple-outline',
    iconFilled: 'mdi-image-multiple',
    to: { name: 'explore' },
  },
  { title: 'Cart', iconOutline: 'mdi-cart-outline', iconFilled: 'mdi-cart', to: { name: 'cart' } },
  { title: 'Studio', iconOutline: 'mdi-draw', iconFilled: 'mdi-draw', to: { name: 'studio' } },
]

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
    grow
    bg-color="background"
    class="border-t"
    color="primary"
  >
    <v-btn
      v-for="item in items"
      :key="item.title"
      :to="item.to"
      :value="item.to.name"
      min-width="0"
      :exact="item.to.name === 'home'"
      :disabled="loading"
    >
      <v-icon>
        {{ route.name === item.to.name ? item.iconFilled : item.iconOutline }}
      </v-icon>
      <span>{{ item.title }}</span>
    </v-btn>

    <v-btn
      v-if="auth.isSignedIn"
      :to="{ name: 'account' }"
      value="account"
      min-width="0"
      :disabled="loading"
    >
      <v-avatar v-if="profile.avatarUrl" size="24" class="mb-1">
        <v-img :src="profile.avatarUrl" cover />
      </v-avatar>
      <v-icon v-else>
        {{ route.name === 'account' ? 'mdi-account-circle' : 'mdi-account-circle-outline' }}
      </v-icon>
      <span>Account</span>
    </v-btn>

    <v-btn v-else @click="signIn" :disabled="loading" min-width="0" base-color="info">
      <v-icon :class="{ 'text-flashing': loading }">mdi-google</v-icon>
      <span>{{ loading ? '...' : 'Sign In' }}</span>
    </v-btn>
  </v-bottom-navigation>
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
    opacity: 0.3;
  }
}
</style>
