// stores/profile.ts
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from './auth'
import type { Database } from '@/types/database'
import { useArtworkDraftStore } from './artworkDraft'

type Profile = Database['public']['Tables']['profiles']['Row']

function extractMessage(e: unknown, fallback: string): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string')
    return e.message
  return fallback
}

export const useProfileStore = defineStore(
  'profile',
  () => {
    const authStore = useAuthStore()

    const profile = ref<Profile | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const ready = ref(!!profile.value) // true if hydrated from cache, false if fresh

    const isAdmin = computed(() => profile.value?.is_admin ?? false)
    const isArtist = computed(() => profile.value?.is_artist ?? false)

    const displayName = computed(
      () => profile.value?.full_name ?? authStore.user?.email?.split('@')[0] ?? 'User',
    )
    const avatarUrl = computed(() => profile.value?.avatar_url ?? null)
    const email = computed(() => authStore.user?.email ?? null)

    async function load(userId: string) {
      loading.value = true
      error.value = null
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (err) throw err
        profile.value = data
        const draftStore = useArtworkDraftStore()
        await draftStore.syncFromSupabase(userId)
      } catch (e) {
        error.value = extractMessage(e, 'Failed to load profile')
      } finally {
        loading.value = false
      }
    }

    async function updateProfile(updates: Database['public']['Tables']['profiles']['Update']) {
      if (!authStore.user) throw new Error('Not authenticated')

      loading.value = true
      error.value = null
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', authStore.user.id)
          .select()
          .single()
        if (err) throw err
        profile.value = data
        return data
      } catch (e) {
        error.value = extractMessage(e, 'Failed to update profile')
        throw e
      } finally {
        loading.value = false
      }
    }

    function clear() {
      profile.value = null
      error.value = null
      loading.value = false
      ready.value = false
    }

    watch(
      () => authStore.user,
      async (user) => {
        if (user) await load(user.id)
        else clear()
        ready.value = true
      },
      { immediate: true },
    )

    return {
      profile,
      loading,
      error,
      ready,
      isAdmin,
      isArtist,
      displayName,
      avatarUrl,
      email,
      load,
      updateProfile,
      clear,
    }
  },
  {
    persist: {
      pick: ['profile'], // only persist the raw profile object
    },
  },
)
