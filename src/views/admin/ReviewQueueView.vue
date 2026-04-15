<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import { useNotifier } from '@/composables/useNotifier'
import ArtworkThumbnail from '@/components/studio/ArtworkThumbnail.vue'
import SubmissionReviewSheet from '@/components/SubmissionReviewSheet.vue'

const { notify } = useNotifier()

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Submission {
  id: string
  artist_id: string
  title: string
  description: string | null
  medium: 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'
  price: number | null
  dimensions_cm: { height: number; width: number; depth?: number } | null
  weight_kg: number | null
  image_url: string | null
  notes: string | null
  created_at: string
}

// ── State ─────────────────────────────────────────────────────────────────────

const submissions = ref<Submission[]>([])
const loading = ref(false)
const selected = ref<Submission | null>(null)
const showSheet = ref(false)

// ── Table ─────────────────────────────────────────────────────────────────────

const headers = [
  { title: 'Artwork', key: 'title', align: 'start' as const },
  { title: 'Price', key: 'price' },
  { title: 'Submitted', key: 'created_at' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const },
]

const formatPrice = (p: number | null) => (p == null ? '—' : `₹${p.toLocaleString('en-IN')}`)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

// ── Data ──────────────────────────────────────────────────────────────────────

async function fetchQueue() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('upload_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    if (error) throw error
    submissions.value = data
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to load queue', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchQueue)

// ── Actions ───────────────────────────────────────────────────────────────────

function openReview(submission: Submission) {
  selected.value = submission
  showSheet.value = true
}

function onApproved(id: string) {
  submissions.value = submissions.value.filter((s) => s.id !== id)
}

function onRejected(id: string) {
  submissions.value = submissions.value.filter((s) => s.id !== id)
}
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col md="10">
        <v-card variant="flat" border :rounded="$vuetify.display.mobile ? 0 : 'lg'">
          <v-data-table
            :headers="headers"
            :items="submissions"
            :loading="loading"
            :items-per-page="-1"
            hide-default-footer
            hover
          >
            <template #[`item.title`]="{ item }">
              <div class="d-flex align-center ga-4 py-2">
                <ArtworkThumbnail :src="item.image_url" />
                <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
              </div>
            </template>

            <template #[`item.price`]="{ item }">
              <span class="text-body-2 font-weight-medium">{{ formatPrice(item.price) }}</span>
            </template>

            <template #[`item.created_at`]="{ item }">
              <span class="text-body-2 text-medium-emphasis">{{
                formatDate(item.created_at)
              }}</span>
            </template>

            <template #[`item.actions`]="{ item }">
              <v-btn variant="text" size="small" icon="mdi-arrow-right" @click="openReview(item)" />
            </template>

            <template #no-data>
              <div class="d-flex flex-column align-center py-12 text-medium-emphasis">
                <v-icon size="40" class="mb-3">mdi-check-circle-outline</v-icon>
                <span class="text-body-2">No pending submissions</span>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <SubmissionReviewSheet
    v-model="showSheet"
    :submission="selected"
    @approved="onApproved"
    @rejected="onRejected"
  />
</template>
