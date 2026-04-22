<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import { useAsyncState } from '@vueuse/core'
import { supabase } from '@/lib/supabaseClient'
import { useNotifier } from '@/composables/useNotifier'
import { formatPrice, formatDate } from '@/lib/formatters'
import type { Submission } from '@/types'
import ArtworkThumbnail from '@/components/studio/ArtworkThumbnail.vue'
import SubmissionReviewSheet from '@/components/SubmissionReviewSheet.vue'

const { notify } = useNotifier()
const { mdAndUp } = useDisplay()

// ── Fetch ─────────────────────────────────────────────────────────────────────

const { state: submissions, isLoading } = useAsyncState(
  async () => {
    const { data, error } = await supabase
      .from('upload_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data as Submission[]
  },
  [],
  {
    onError(e) {
      notify({ message: e instanceof Error ? e.message : 'Failed to load queue', color: 'error' })
    },
  },
)

// ── Sheet ─────────────────────────────────────────────────────────────────────

const selected = ref<Submission | null>(null)
const showSheet = ref(false)

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

// ── Table headers ─────────────────────────────────────────────────────────────

const titleHeader = { title: 'Artwork', key: 'title', align: 'start' as const }
const priceHeader = { title: 'Price', key: 'price' }
const dateHeader = { title: 'Submitted', key: 'created_at' }
const actionsHeader = {
  title: '',
  key: 'actions',
  sortable: false,
  align: 'end' as const,
  width: '60px',
}

const headers = computed(() =>
  mdAndUp.value
    ? [titleHeader, priceHeader, dateHeader, actionsHeader]
    : [titleHeader, dateHeader, actionsHeader],
)
</script>

<template>
  <v-container>
    <v-row justify="center">
      <v-col md="10">
        <v-card variant="flat" border :rounded="$vuetify.display.mobile ? 0 : 'lg'">
          <v-data-table
            :headers="headers"
            :items="submissions"
            :loading="isLoading"
            :items-per-page="10"
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
