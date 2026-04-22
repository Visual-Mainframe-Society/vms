<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'
import ArtworkThumbnail from './BaseThumbnail.vue'
import StudioEmptyState from './StudioEmptyState.vue'
import { formatPrice, formatDate } from '@/lib/formatters'
import type { PanelItem } from '@/types'

function getThumbnail(item: PanelItem): string | null {
  return 'image_url' in item ? item.image_url : (item.image_urls[0] ?? null)
}

const props = defineProps<{
  items: PanelItem[]
  tab: 'public' | 'pending' | 'unlisted'
  togglingId?: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  unlist: [id: string]
  makePublic: [id: string]
  edit: [id: string]
}>()

const { mdAndUp } = useDisplay()

const baseHeaders = [
  { title: 'Artwork', key: 'title', align: 'start' as const },
  { title: 'Price', key: 'price' },
]

const actionsHeader = {
  title: '',
  key: 'actions',
  sortable: false,
  align: 'end' as const,
}
const dateHeader = { title: 'Date', key: 'created_at' }

const headers = computed(() => {
  const isPending = props.tab === 'pending'

  if (mdAndUp.value) {
    // Desktop: thumbnail+title | price | date | actions(if not pending)
    return isPending ? [...baseHeaders, dateHeader] : [...baseHeaders, dateHeader, actionsHeader]
  }

  // Mobile: thumbnail+title | price | actions(if not pending)
  return isPending ? [...baseHeaders] : [...baseHeaders, actionsHeader]
})

const emptyIcon: Record<typeof props.tab, string> = {
  public: 'mdi-storefront-outline',
  pending: 'mdi-clock-outline',
  unlisted: 'mdi-eye-off-outline',
}

const emptyText: Record<typeof props.tab, string> = {
  public: 'No public artworks yet',
  pending: 'No submissions pending review',
  unlisted: 'No unlisted artworks',
}

const tabInfo: Partial<Record<typeof props.tab, string>> = {
  public:
    'Curated for the gallery. This work is now live for collectors and visible on your profile.',
  pending:
    'Under curatorial review. You will be notified once the Society has verified the submission.',
  unlisted:
    'Unlisted from public curation. The digital entry is hidden, though the link remains active. Physical status is unaffected.',
}
</script>

<template>
  <v-alert
    v-if="items.length && tabInfo[tab]"
    :text="tabInfo[tab]"
    density="compact"
    rounded="0"
    class="text-label-medium text-disabled pb-0 pt-3"
    style="background: transparent !important"
  />
  <v-data-table :headers="headers" :items="items" :items-per-page="10" :loading="loading" hover>
    <template #[`item.title`]="{ item }">
      <div class="d-flex align-center ga-4 py-2">
        <ArtworkThumbnail :src="getThumbnail(item)" />
        <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
      </div>
    </template>

    <template #[`item.price`]="{ item }">
      <span class="text-body-2 font-weight-medium">{{ formatPrice(item.price) }}</span>
    </template>

    <template #[`item.created_at`]="{ item }">
      <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.created_at) }}</span>
    </template>

    <template #[`item.actions`]="{ item }">
      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            :loading="togglingId === item.id"
          />
        </template>
        <v-list density="compact" min-width="160">
          <v-list-item
            prepend-icon="mdi-pencil-outline"
            title="Edit"
            @click="emit('edit', item.id)"
          />
          <v-list-item
            v-if="tab === 'public'"
            prepend-icon="mdi-eye-off-outline"
            title="Hide from gallery"
            @click="emit('unlist', item.id)"
          />
          <v-list-item
            v-else-if="tab === 'unlisted'"
            prepend-icon="mdi-eye-outline"
            title="Make public"
            @click="emit('makePublic', item.id)"
          />
        </v-list>
      </v-menu>
    </template>

    <template #no-data>
      <StudioEmptyState :icon="emptyIcon[tab]" :text="emptyText[tab]" />
    </template>
  </v-data-table>
</template>
