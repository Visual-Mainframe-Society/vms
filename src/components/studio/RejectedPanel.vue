<script setup lang="ts">
import { useDisplay } from 'vuetify'
import ArtworkThumbnail from './ArtworkThumbnail.vue'
import StudioEmptyState from './StudioEmptyState.vue'

interface RejectedItem {
  id: string
  title: string
  image_urls: string[]
  notes: string | null
  created_at: string
}

defineProps<{ items: RejectedItem[]; loading?: boolean }>()

const { mdAndUp } = useDisplay()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

const headers = [
  { title: 'Artwork', key: 'title', align: 'start' as const },
  { title: 'Reason', key: 'notes' },
  { title: 'Submitted', key: 'created_at', width: '160px' },
]
</script>

<template>
  <!-- Desktop -->
  <v-data-table
    v-if="mdAndUp"
    :headers="headers"
    :items="items"
    :items-per-page="-1"
    :loading="loading"
    hide-default-footer
    hover
  >
    <template #[`item.title`]="{ item }">
      <div class="d-flex align-center ga-4 py-2">
        <ArtworkThumbnail :src="item.image_urls[0]" />
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

  <!-- Mobile -->
  <template v-else>
    <v-list v-if="items.length" lines="three">
      <v-list-item v-for="item in items" :key="item.id" :subtitle="item.notes ?? '—'">
        <template #prepend>
          <ArtworkThumbnail :src="item.image_urls[0]" avatar class="mr-2" />
        </template>

        <template #title>
          <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
        </template>

        <template #append>
          <span class="text-caption text-medium-emphasis">{{ formatDate(item.created_at) }}</span>
        </template>
      </v-list-item>
    </v-list>

    <StudioEmptyState v-else icon="mdi-check-circle-outline" text="No rejected submissions" />
  </template>

  <v-alert
    text="Returned for revision. Please review the curator’s feedback and update the work for resubmission."
    density="compact"
    rounded="0"
    class="text-label-large text-disabled"
    style="background: transparent !important"
  />
</template>
