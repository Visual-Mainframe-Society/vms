import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArtworkDraftStore } from '@/stores/artworkDraft'
import { useUploadRequest } from '@/composables/useUploadRequest'
import { useNotifier } from '@/composables/useNotifier'

export function useArtworkSubmission() {
  const router = useRouter()
  const route = useRoute()
  const draftStore = useArtworkDraftStore()
  const { save: saveRequest, remove: removeRequest } = useUploadRequest()
  const { notify } = useNotifier()

  // ── Form state ──────────────────────────────────────────────────────────────

  const fields = reactive({
    title: '',
    description: '',
    price: null as number | null,
    height: null as number | null,
    width: null as number | null,
    depth: null as number | null,
  })

  const files = ref<File[]>([])
  const savedImageUrl = ref<string | null>(null)
  const activeDraftId = ref<string | null>(null)

  // ── Loading states ──────────────────────────────────────────────────────────

  const saving = ref(false)
  const savingDraft = ref(false)
  const discarding = ref(false)
  const showDraftDialog = ref(false)

  // ── Draft restore ───────────────────────────────────────────────────────────

  async function restoreDraft() {
    const id = route.query.draftId as string | undefined
    if (!id) return

    const match = draftStore.drafts.find((d) => d.id === id)
    if (!match) return

    activeDraftId.value = match.id
    Object.assign(fields, {
      title: match.title,
      description: match.description,
      price: match.price,
      height: match.height,
      width: match.width,
      depth: match.depth,
    })
    savedImageUrl.value = match.imageUrl

    if (match.imageUrl) {
      try {
        const res = await fetch(match.imageUrl)
        const blob = await res.blob()
        const filename = match.imageUrl.split('/').pop() ?? 'reference'
        files.value = [new File([blob], filename, { type: blob.type })]
      } catch {
        // fetch failed — savedImageUrl still set so composable won't re-upload
      }
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function hasData() {
    return (
      fields.title ||
      fields.description ||
      fields.price ||
      fields.height ||
      fields.width ||
      files.value.length > 0 ||
      savedImageUrl.value
    )
  }

  function buildPayload(status: 'draft' | 'pending') {
    return {
      draftId: activeDraftId.value,
      title: fields.title.trim(),
      description: fields.description.trim() || null,
      price: fields.price,
      dimensions_cm:
        fields.height && fields.width
          ? {
              height: fields.height,
              width: fields.width,
              ...(fields.depth ? { depth: fields.depth } : {}),
            }
          : null,
      imageFile: files.value[0] ?? null,
      existingImageUrl: savedImageUrl.value,
      status,
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  function handleBack() {
    if (hasData()) showDraftDialog.value = true
    else router.back()
  }

  async function saveDraftAndLeave() {
    savingDraft.value = true
    try {
      const { id, imageUrl } = await saveRequest(buildPayload('draft'))
      draftStore.upsertDraft({
        id,
        title: fields.title,
        description: fields.description,
        price: fields.price,
        height: fields.height,
        width: fields.width,
        depth: fields.depth,
        imageUrl,
      })
    } catch (e) {
      notify({ message: e instanceof Error ? e.message : 'Failed to save draft', color: 'error' })
    } finally {
      savingDraft.value = false
      showDraftDialog.value = false
      router.back()
    }
  }

  async function discardAndLeave() {
    if (activeDraftId.value) {
      discarding.value = true
      try {
        await removeRequest(activeDraftId.value)
        draftStore.removeDraft(activeDraftId.value)
      } catch (e) {
        notify({
          message: e instanceof Error ? e.message : 'Failed to discard draft',
          color: 'error',
        })
      } finally {
        discarding.value = false
      }
    }
    showDraftDialog.value = false
    router.back()
  }

  // handleSubmit takes the form ref so validation stays in the view layer
  async function handleSubmit(form: { validate: () => Promise<{ valid: boolean }> }) {
    const { valid } = await form.validate()
    if (!valid || (files.value.length === 0 && !savedImageUrl.value)) return false

    saving.value = true
    try {
      await saveRequest(buildPayload('pending'))
      if (activeDraftId.value) draftStore.removeDraft(activeDraftId.value)
      router.back()
      return true
    } catch (e) {
      notify({
        message: e instanceof Error ? e.message : 'Failed to submit artwork',
        color: 'error',
      })
      return false
    } finally {
      saving.value = false
    }
  }

  return {
    // State
    fields,
    files,
    savedImageUrl,
    activeDraftId,
    // Loading
    saving,
    savingDraft,
    discarding,
    showDraftDialog,
    // Actions
    restoreDraft,
    handleBack,
    saveDraftAndLeave,
    discardAndLeave,
    handleSubmit,
  }
}
