import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)

  const isSignedIn = computed(() => !!session.value)

  function init() {
    supabase.auth.getSession().then(({ data }) => {
      session.value = data.session
    })
    supabase.auth.onAuthStateChange((_, newSession) => {
      session.value = newSession
    })
  }

  const user = computed(() => session.value?.user ?? null)
  const avatarUrl = computed(() => {
    const url = user.value?.user_metadata?.avatar_url as string | null
    return url ? `${url}?sz=24` : null
  })
  const fullName = computed(() => user.value?.user_metadata?.full_name as string | null)
  const email = computed(() => user.value?.email ?? null)

  return { session, isSignedIn, init, user, avatarUrl, fullName, email }
})
