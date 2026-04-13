<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArtworkDraftStore } from '@/stores/artworkDraft'
import { useUploadRequest } from '@/composables/useUploadRequest'
import { useNotifier } from '@/composables/useNotifier'

const { notify } = useNotifier()
const router = useRouter()
const route = useRoute()
const draftStore = useArtworkDraftStore()
const { save: saveRequest, remove: removeRequest } = useUploadRequest()

// ── Form state ────────────────────────────────────────────────────────────────

const form = ref()

const fields = reactive({
  title: '',
  description: '',
  price: null as number | null,
  height: null as number | null,
  width: null as number | null,
  depth: null as number | null,
})

// ── Image state ───────────────────────────────────────────────────────────────

const files = ref<File[]>([])
const imageTouched = ref(false)
const savedImageUrl = ref<string | null>(null)
const saving = ref(false)
const savingDraft = ref(false)
const discarding = ref(false)

const imageError = computed(() => {
  if (!imageTouched.value) return null
  if (files.value.length === 0 && !savedImageUrl.value)
    return 'A reference photo is needed to begin the review.'
  return null
})

// ── Draft restore ─────────────────────────────────────────────────────────────

const activeDraftId = ref<string | null>(null)

onMounted(async () => {
  const draftId = route.query.draftId as string | undefined
  if (!draftId) return

  const match = draftStore.drafts.find((d) => d.id === draftId)
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
})

// ── Commission ────────────────────────────────────────────────────────────────

const COMMISSION_RATE = 0.3

const commission = computed(() =>
  fields.price ? Math.round(fields.price * COMMISSION_RATE) : null,
)

const artistReceives = computed(() =>
  fields.price ? Math.round(fields.price * (1 - COMMISSION_RATE)) : null,
)

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`

// ── Validation rules ──────────────────────────────────────────────────────────

const required = (v: unknown) => (v !== '' && v !== null && v !== undefined) || 'Required'
const positiveNumber = (v: unknown) => (v !== null && Number(v) > 0) || 'Must be greater than 0'

// ── Draft dialog ──────────────────────────────────────────────────────────────

const showDraftDialog = ref(false)

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

// ── Submit ────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  imageTouched.value = true
  const { valid } = await form.value.validate()
  if (!valid || (files.value.length === 0 && !savedImageUrl.value)) return

  saving.value = true
  try {
    await saveRequest(buildPayload('pending'))
    if (activeDraftId.value) draftStore.removeDraft(activeDraftId.value)
    router.back()
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to submit artwork', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-app-bar flat border="b">
    <v-btn icon="mdi-arrow-left" variant="text" @click="handleBack" />
    <v-app-bar-title class="font-weight-bold">New Artwork</v-app-bar-title>
    <template #append>
      <v-btn
        color="primary"
        variant="flat"
        class="mr-2"
        rounded="lg"
        @click="handleSubmit"
        :loading="saving"
      >
        Send to Curation
      </v-btn>
    </template>
  </v-app-bar>
  <v-main>
    <!-- ── Draft dialog ─────────────────────────────────────────────────────── -->
    <v-dialog v-model="showDraftDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pt-6 px-6 font-weight-bold">Save as draft?</v-card-title>
        <v-card-text class="px-6 text-medium-emphasis">
          You have unsaved work. Save it as a draft so you can come back to it later, or discard it.
        </v-card-text>
        <v-card-actions class="px-6 pb-6 gap-2">
          <v-btn
            variant="outlined"
            rounded="lg"
            @click="discardAndLeave"
            :loading="discarding"
            :disabled="savingDraft"
          >
            Discard
          </v-btn>

          <v-spacer />

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            @click="saveDraftAndLeave"
            :loading="savingDraft"
            :disabled="discarding"
          >
            Save Draft
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-form ref="form" @submit.prevent="handleSubmit">
            <!-- ── Artist's Reference ──────────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-1">Artist's Reference</div>
            <div class="text-title-small text-medium-emphasis mb-4">
              Please provide a photo of the work. This serves as our primary reference for
              identification and care until we take gallery shots.
            </div>

            <v-file-upload
              v-model="files"
              clearable
              density="compact"
              variant="compact"
              icon="mdi-camera-plus"
              title="Upload a reference photo"
              browse-text="Browse Images"
              inset-file-list
              accept="image/*"
              :disabled="saving"
              :error-messages="imageError"
              @update:model-value="imageTouched = true"
            />

            <v-divider class="my-8" />

            <!-- ── About the Work ─────────────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-4">About the Work</div>

            <v-text-field
              v-model="fields.title"
              label="What is this piece called?"
              variant="outlined"
              placeholder="e.g. Untitled No. 4"
              :rules="[required]"
              clearable
              :disabled="saving"
            />

            <v-textarea
              v-model="fields.description"
              label="The Story Behind the Work"
              variant="outlined"
              rows="3"
              auto-grow
              hint="Share your process, materials, or the inspiration for this piece."
              persistent-hint
              clearable
              :disabled="saving"
            />

            <v-divider class="my-8" />

            <!-- ── Price ──────────────────────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-4">Price</div>

            <v-row align="center">
              <v-col cols="12" sm="6">
                <v-number-input
                  v-model="fields.price"
                  inset
                  controlVariant="stacked"
                  label="Listing Price"
                  variant="outlined"
                  prefix="₹"
                  :rules="[required, positiveNumber]"
                  hint="The price shown to collectors."
                  persistent-hint
                  :min="1"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-card variant="outlined" class="border border-opacity-25" rounded="lg">
                  <v-list bg-color="transparent" class="py-0">
                    <v-list-item>
                      <v-list-item-title class="font-weight-bold"
                        >Artist Proceeds</v-list-item-title
                      >
                      <template #append>
                        <span
                          class="font-weight-bold"
                          :class="artistReceives ? 'text-success' : ''"
                        >
                          {{ artistReceives ? formatINR(artistReceives) : '—' }}
                        </span>
                      </template>
                    </v-list-item>
                    <v-divider />
                    <v-list-item>
                      <v-list-item-title>Society Contribution (30%)</v-list-item-title>
                      <template #append>
                        <span class="font-weight-medium">{{
                          commission ? formatINR(commission) : '—'
                        }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-8" />

            <!-- ── Physical Dimensions ────────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-1">Physical Dimensions</div>
            <div class="text-title-small text-medium-emphasis mb-4">In centimetres</div>

            <v-row density="comfortable">
              <v-col cols="4">
                <v-number-input
                  v-model="fields.height"
                  inset
                  controlVariant="stacked"
                  label="Height"
                  variant="outlined"
                  suffix="cm"
                  :rules="[required, positiveNumber]"
                  :min="1"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="4">
                <v-number-input
                  v-model="fields.width"
                  inset
                  controlVariant="stacked"
                  label="Width"
                  variant="outlined"
                  suffix="cm"
                  :rules="[required, positiveNumber]"
                  :min="1"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="4">
                <v-number-input
                  v-model="fields.depth"
                  inset
                  controlVariant="stacked"
                  label="Depth"
                  variant="outlined"
                  suffix="cm"
                  hint="Optional"
                  persistent-hint
                  :min="0"
                  :disabled="saving"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
