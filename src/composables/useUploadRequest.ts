import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'

export interface SavePayload {
  draftId: string | null
  title: string
  description: string | null
  price: number | null
  dimensions_cm: { height: number; width: number; depth?: number } | null
  imageFile: File | null
  existingImageUrl: string | null
  status: 'draft' | 'pending'
}

export interface SaveResult {
  id: string
  imageUrl: string | null
}

export function useUploadRequest() {
  const auth = useAuthStore()

  async function uploadImage(file: File, artistId: string, requestId: string): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${artistId}/${requestId}/reference.${ext}`
    const { error } = await supabase.storage.from('artworks').upload(path, file, { upsert: true })
    if (error) throw error
    return supabase.storage.from('artworks').getPublicUrl(path).data.publicUrl
  }

  async function save(payload: SavePayload): Promise<SaveResult> {
    const artistId = auth.user?.id
    if (!artistId) throw new Error('Not authenticated')

    const row = {
      artist_id: artistId,
      title: payload.title,
      description: payload.description,
      medium: 'painting' as const,
      price: payload.price,
      dimensions_cm: payload.dimensions_cm,
      status: payload.status,
    }

    // ── Update existing draft ─────────────────────────────────────────────
    if (payload.draftId) {
      let imageUrl = payload.existingImageUrl
      if (payload.imageFile) {
        imageUrl = await uploadImage(payload.imageFile, artistId, payload.draftId)
      }
      const { data, error } = await supabase
        .from('upload_requests')
        .update({ ...row, image_url: imageUrl })
        .eq('id', payload.draftId)
        .eq('artist_id', artistId)
        .select('id')
        .single()
      if (error) throw error
      return { id: data.id, imageUrl }
    }

    // ── Insert new row as draft (artist UPDATE policy requires status='draft') ──
    const { data, error } = await supabase
      .from('upload_requests')
      .insert({ ...row, status: 'draft' })
      .select('id')
      .single()
    if (error) throw error

    // ── Upload image into the correct path using the real row id ──────────
    let imageUrl: string | null = null
    if (payload.imageFile) {
      imageUrl = await uploadImage(payload.imageFile, artistId, data.id)
    }

    // ── Single update: set image_url and promote to final status ──────────
    // Row is still 'draft' here so the artist UPDATE policy passes.
    // image_url and status are written atomically, so the row is never
    // 'pending' without its image_url.
    const { error: updateError } = await supabase
      .from('upload_requests')
      .update({ image_url: imageUrl, status: payload.status })
      .eq('id', data.id)
      .eq('artist_id', artistId)
    if (updateError) throw updateError

    return { id: data.id, imageUrl }
  }

  async function remove(draftId: string): Promise<void> {
    const artistId = auth.user?.id
    if (!artistId) throw new Error('Not authenticated')

    // 1. Delete the entire storage folder for this draft
    const folderPath = `${artistId}/${draftId}`
    const { data: files } = await supabase.storage.from('artworks').list(folderPath)

    if (files?.length) {
      const paths = files.map((f) => `${folderPath}/${f.name}`)
      await supabase.storage.from('artworks').remove(paths)
    }

    // 2. Delete the database row
    const { error } = await supabase
      .from('upload_requests')
      .delete()
      .eq('id', draftId)
      .eq('artist_id', artistId)

    if (error) throw error
  }

  return { save, remove }
}
