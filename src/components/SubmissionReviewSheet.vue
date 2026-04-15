<script setup lang="ts">
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useNotifier } from '@/composables/useNotifier'
import type { Submission } from '@/views/admin/ReviewQueueView.vue'

// ── Props / emits ──────────────────────────────────────────────────────────────

const props = defineProps<{
  modelValue: boolean
  submission: Submission | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  approved: [id: string]
  rejected: [id: string]
}>()

const { notify } = useNotifier()

// ── State ─────────────────────────────────────────────────────────────────────

const imageFiles = ref<File[]>([])
const approving = ref(false)
const rejecting = ref(false)
const rejectReason = ref('')
const showRejectForm = ref(false)

const canApprove = computed(() => imageFiles.value.length > 0)
const canReject = computed(() => rejectReason.value.trim().length > 0)

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatPrice = (p: number | null) => (p == null ? '—' : `₹${p.toLocaleString('en-IN')}`)

const formatDimensions = (d: Submission['dimensions_cm']) => {
  if (!d) return '—'
  return `${d.height} × ${d.width}${d.depth ? ` × ${d.depth}` : ''} cm`
}

const mediumLabel: Record<Submission['medium'], string> = {
  painting: 'Painting',
  photography: 'Photography',
  print: 'Print',
  sculpture: 'Sculpture',
  digital: 'Digital',
}

// ── Actions ────────────────────────────────────────────────────────────────────

function close() {
  emit('update:modelValue', false)
  imageFiles.value = []
  rejectReason.value = ''
  showRejectForm.value = false
}

async function uploadGalleryImages(artistId: string, requestId: string): Promise<string[]> {
  const urls: string[] = []
  let i = 0
  for (const file of imageFiles.value) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${artistId}/${requestId}/gallery/${i}.${ext}`
    const { error } = await supabase.storage.from('artworks').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('artworks').getPublicUrl(path)
    urls.push(data.publicUrl)
    i++
  }
  return urls
}

async function approve() {
  if (!props.submission || !canApprove.value) return
  approving.value = true
  try {
    const urls = await uploadGalleryImages(props.submission.artist_id, props.submission.id)
    const { error } = await supabase.rpc('approve_upload_request', {
      request_id: props.submission.id,
      artwork_image_urls: urls,
    })
    if (error) throw error
    notify({ message: 'Artwork approved and listed', color: 'success' })
    emit('approved', props.submission.id)
    close()
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to approve', color: 'error' })
  } finally {
    approving.value = false
  }
}

async function reject() {
  if (!props.submission || !canReject.value) return
  rejecting.value = true
  try {
    const { error } = await supabase
      .from('upload_requests')
      .update({ status: 'disapproved', notes: rejectReason.value.trim() })
      .eq('id', props.submission.id)
    if (error) throw error
    notify({ message: 'Submission rejected', color: 'warning' })
    emit('rejected', props.submission.id)
    close()
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to reject', color: 'error' })
  } finally {
    rejecting.value = false
  }
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" fullscreen>
    <v-sheet color="background" class="d-flex flex-column" style="height: 100vh; overflow: hidden">
      <!-- Toolbar -->
      <v-toolbar color="background" border="b" :elevation="0">
        <template #prepend>
          <v-btn icon="mdi-arrow-left" :disabled="approving || rejecting" @click="close" />
        </template>

        <v-toolbar-title
          v-if="$vuetify.display.smAndUp"
          class="text-uppercase text-medium-emphasis text-label-large"
        >
          Review Submission
        </v-toolbar-title>

        <template #append>
          <div class="d-flex align-center ga-2 mr-2">
            <template v-if="!showRejectForm">
              <v-btn
                variant="tonal"
                color="error"
                :disabled="approving || rejecting"
                @click="showRejectForm = true"
              >
                Reject
              </v-btn>
              <v-btn
                variant="flat"
                color="success"
                rounded="pill"
                :loading="approving"
                :disabled="!canApprove || rejecting"
                @click="approve"
              >
                Approve &amp; Publish
              </v-btn>
            </template>

            <template v-else>
              <v-btn
                variant="text"
                class="text-none"
                :disabled="approving || rejecting"
                @click="showRejectForm = false"
              >
                Cancel
              </v-btn>
              <v-btn
                variant="flat"
                color="error"
                rounded="pill"
                class="text-none"
                :loading="rejecting"
                :disabled="!canReject || approving"
                @click="reject"
              >
                Confirm Rejection
              </v-btn>
            </template>
          </div>
        </template>
      </v-toolbar>

      <!-- Body -->
      <div v-if="submission" class="flex-1-1 overflow-y-auto">
        <v-row no-gutters style="min-height: 100%">
          <!-- Left panel: reference image + meta -->
          <v-col
            cols="12"
            md="4"
            lg="3"
            class="bg-surface pa-6 d-flex flex-column ga-6"
            :style="
              $vuetify.display.mdAndUp
                ? 'border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))'
                : 'border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))'
            "
          >
            <div>
              <div class="text-overline text-medium-emphasis mb-3">Artist's Reference</div>
              <v-img
                v-if="submission.image_url"
                :src="submission.image_url"
                :aspect-ratio="1"
                cover
                rounded="lg"
                class="border"
              />
              <v-empty-state
                v-else
                icon="mdi-image-off-outline"
                text="No reference image"
                class="border rounded-lg"
              />
            </div>

            <v-divider />

            <div>
              <div class="text-overline text-medium-emphasis mb-1">Submission ID</div>
              <div
                class="text-caption text-medium-emphasis text-truncate"
                style="font-family: monospace"
              >
                {{ submission.id }}
              </div>
            </div>
          </v-col>

          <!-- Right panel: detail / reject form -->
          <v-col cols="12" md="8" lg="9">
            <div class="py-4 px-6 px-md-8 mx-auto">
              <!-- Reject form -->
              <template v-if="showRejectForm">
                <h2 class="text-h5 font-weight-bold text-error mb-4">Reject Submission</h2>
                <v-alert type="error" variant="tonal" border="start" class="mb-6">
                  Rejecting this artwork will notify the artist. Please provide a clear,
                  constructive reason.
                </v-alert>
                <v-textarea
                  v-model="rejectReason"
                  label="Rejection Reason"
                  placeholder="e.g. Dimensions don't match the reference aspect ratio."
                  variant="outlined"
                  rows="6"
                  auto-grow
                  :disabled="rejecting"
                />
              </template>

              <!-- Artwork detail -->
              <template v-else>
                <h2 class="text-h4 font-weight-black mb-8">{{ submission.title }}</h2>

                <v-row class="mb-8" dense>
                  <v-col cols="12" sm="4">
                    <div class="text-overline text-medium-emphasis">Medium</div>
                    <div class="text-h6">{{ mediumLabel[submission.medium] }}</div>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <div class="text-overline text-medium-emphasis">Listed Price</div>
                    <div class="text-h6">{{ formatPrice(submission.price) }}</div>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <div class="text-overline text-medium-emphasis">Dimensions</div>
                    <div class="text-h6">{{ formatDimensions(submission.dimensions_cm) }}</div>
                  </v-col>
                </v-row>

                <template v-if="submission.description">
                  <div class="text-overline text-medium-emphasis mb-2">Artist Description</div>
                  <v-sheet rounded="lg" border class="pa-4 text-body-1 mb-8">
                    {{ submission.description }}
                  </v-sheet>
                </template>

                <v-divider class="mb-8" />

                <div class="text-h6 font-weight-bold mb-4">Gallery Photography</div>

                <v-file-upload
                  v-model="imageFiles"
                  clearable
                  multiple
                  density="compact"
                  variant="outlined"
                  title="Add image here"
                  icon="mdi-camera-plus"
                  accept="image/*"
                  inset-file-list
                  :disabled="approving"
                />

                <v-alert
                  v-if="imageFiles.length === 0"
                  type="info"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                  text="At least one gallery image is required before you can approve."
                />
              </template>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- Empty state if no submission passed -->
      <div v-else class="flex-1-1 d-flex align-center justify-center">
        <v-empty-state icon="mdi-file-question-outline" text="No submission selected." />
      </div>
    </v-sheet>
  </v-dialog>
</template>
