// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { Session, Subscription } from '@supabase/supabase-js'
import { useProfileStore } from './profile'
import { useArtworkDraftStore } from './artworkDraft'
import { useCartStore } from './cart'
import { useNotifier } from '@/composables/useNotifier'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const ready = ref(false)
  const isSigningOut = ref(false)
  let authSubscription: Subscription | null = null

  const isSignedIn = computed(() => !!session.value)
  const user = computed(() => session.value?.user ?? null)
  const email = computed(() => user.value?.email ?? null)

  function init() {
    authSubscription?.unsubscribe()

    supabase.auth.getSession().then(({ data }) => {
      session.value = data.session
      ready.value = true
    })

    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      session.value = newSession
    })
    authSubscription = data.subscription
  }

  function dispose() {
    authSubscription?.unsubscribe()
    authSubscription = null
  }

  async function signOut() {
    if (isSigningOut.value) return

    const { notify } = useNotifier()
    isSigningOut.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      session.value = null

      useProfileStore().clear()
      useArtworkDraftStore().clear()
      useCartStore().clear()
    } catch (err) {
      console.error('Sign out failed:', err)
      notify({ message: err instanceof Error ? err.message : 'Sign out failed', color: 'error' })
      throw err
    } finally {
      isSigningOut.value = false
    }
  }

  return {
    session,
    ready,
    isSignedIn,
    isSigningOut,
    init,
    dispose,
    user,
    email,
    signOut,
  }
})
