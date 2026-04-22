import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'

export function useArtworkActions(artworkId: string) {
  const authStore = useAuthStore()

  // ── Like ────────────────────────────────────────────────────────────────────

  const liked = ref(false)
  const liking = ref(false)

  // ── Save ────────────────────────────────────────────────────────────────────

  const saved = ref(false)
  const saving = ref(false)

  // ── Initial fetch ───────────────────────────────────────────────────────────

  onMounted(async () => {
    if (!authStore.user) return

    const [{ data: likeData }, { data: saveData }] = await Promise.all([
      supabase
        .from('likes')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', authStore.user.id)
        .maybeSingle(),
      supabase
        .from('saved_items')
        .select('id')
        .eq('artwork_id', artworkId)
        .eq('user_id', authStore.user.id)
        .maybeSingle(),
    ])

    liked.value = !!likeData
    saved.value = !!saveData
  })

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function toggleLike(): Promise<boolean> {
    if (!authStore.user) return false
    if (liking.value) return false

    liking.value = true
    const wasLiked = liked.value
    liked.value = !wasLiked

    const { error } = wasLiked
      ? await supabase
          .from('likes')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', authStore.user.id)
      : await supabase.from('likes').insert({ artwork_id: artworkId, user_id: authStore.user.id })

    if (error) {
      console.error('[useArtworkActions] toggleLike', error)
      liked.value = wasLiked
    }

    liking.value = false
    return !error
  }

  async function toggleSave(): Promise<boolean> {
    if (!authStore.user) return false
    if (saving.value) return false

    saving.value = true
    const wasSaved = saved.value
    saved.value = !wasSaved

    const { error } = wasSaved
      ? await supabase
          .from('saved_items')
          .delete()
          .eq('artwork_id', artworkId)
          .eq('user_id', authStore.user.id)
      : await supabase
          .from('saved_items')
          .insert({ artwork_id: artworkId, user_id: authStore.user.id })

    if (error) {
      console.error('[useArtworkActions] toggleSave', error)
      saved.value = wasSaved
    }

    saving.value = false
    return !error
  }

  return { liked, liking, saved, saving, toggleLike, toggleSave }
}
