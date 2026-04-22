<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import ArtworkThumbnail from './BaseThumbnail.vue'
import StudioEmptyState from './StudioEmptyState.vue'
import { formatDate } from '@/lib/formatters'

import type { PanelUploadRequest } from '@/types'

defineProps<{ items: PanelUploadRequest[]; loading?: boolean }>()

const { mdAndUp } = useDisplay()

const headers = computed(() => {
  const base = [
    { title: 'Artwork', key: 'title', align: 'start' as const },
    { title: 'Reason', key: 'notes' },
  ]
  if (!mdAndUp.value) return base
  return [...base, { title: 'Submitted', key: 'created_at' }]
})
</script>

<template>
  <v-alert
    v-if="items.length"
    text="Returned for revision. Please review the curator's feedback and update the work for resubmission."
    density="compact"
    rounded="0"
    class="text-label-medium text-disabled pb-0 pt-3"
    style="background: transparent !important"
  />
  <v-data-table :headers="headers" :items="items" :items-per-page="10" :loading="loading" hover>
    <template #[`item.title`]="{ item }">
      <div class="d-flex align-center ga-4 py-2">
        <ArtworkThumbnail :src="item.image_url" />
        <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
      </div>
    </template>

    <template #[`item.notes`]="{ item }">
      <div class="d-flex align-center ga-2">
        <v-icon color="error" size="16">mdi-alert-circle-outline</v-icon>
        <span class="text-body-2 text-medium-emphasis">{{ item.notes ?? '—' }}</span>
      </div>
    </template>

    <template #[`item.created_at`]="{ item }">
      <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.created_at) }}</span>
    </template>

    <template #no-data>
      <StudioEmptyState icon="mdi-check-circle-outline" text="No rejected submissions" />
    </template>
  </v-data-table>
</template>
