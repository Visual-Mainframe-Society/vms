import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { ArtworkDraft } from '@/types'

export const useArtworkDraftStore = defineStore(
  'artworkDraft',
  () => {
    const drafts = ref<ArtworkDraft[]>([])
    const hydrated = ref(false)

    async function syncFromSupabase(artistId: string) {
      if (hydrated.value) return

      const { data } = await supabase
        .from('upload_requests')
        .select('id, title, description, price, dimensions_cm, image_url')
        .eq('artist_id', artistId)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false })

      drafts.value = (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? '',
        price: row.price,
        height: row.dimensions_cm?.height ?? null,
        width: row.dimensions_cm?.width ?? null,
        depth: row.dimensions_cm?.depth ?? null,
        imageUrl: row.image_url,
      }))

      hydrated.value = true
    }

    function upsertDraft(data: ArtworkDraft) {
      const idx = drafts.value.findIndex((d) => d.id === data.id)
      if (idx !== -1) drafts.value[idx] = data
      else drafts.value.push(data)
    }

    function removeDraft(id: string) {
      drafts.value = drafts.value.filter((d) => d.id !== id)
    }

    function clear() {
      drafts.value = []
      hydrated.value = false
    }

    return { drafts, hydrated, syncFromSupabase, upsertDraft, removeDraft, clear }
  },
  { persist: true },
)
