<script setup lang="ts">
import { useDisplay } from 'vuetify'
import ArtworkThumbnail from './ArtworkThumbnail.vue'
import StudioEmptyState from './StudioEmptyState.vue'

interface Item {
  id: string
  title: string
  price: number | null
  image_urls: string[]
  created_at: string
}

const props = defineProps<{
  items: Item[]
  tab: 'public' | 'pending' | 'unlisted'
}>()

const emit = defineEmits<{
  unlist: [id: string]
  makePublic: [id: string]
}>()

const { mdAndUp } = useDisplay()

const formatPrice = (p: number | null) => (p == null ? '—' : `₹${p.toLocaleString('en-IN')}`)

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

function headers() {
  const base = [
    { title: 'Artwork', key: 'title', align: 'start' as const },
    { title: 'Price', key: 'price', width: '140px' },
    { title: 'Date', key: 'created_at', width: '160px' },
  ]
  if (props.tab === 'pending') return base
  return [
    ...base,
    { title: '', key: 'actions', sortable: false, align: 'end' as const, width: '60px' },
  ]
}

// Fixed: Using the specific union type as the key instead of generic 'string'
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
</script>

<template>
  <v-data-table
    v-if="mdAndUp"
    :headers="headers()"
    :items="items"
    :items-per-page="-1"
    hide-default-footer
    hover
  >
    <template #[`item.title`]="{ item }">
      <div class="d-flex align-center ga-4 py-2">
        <ArtworkThumbnail :src="item.image_urls[0]" />
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
      <v-tooltip
        v-if="tab === 'public' || tab === 'unlisted'"
        :text="tab === 'public' ? 'Hide from gallery' : 'Make visible in gallery'"
        location="bottom"
      >
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-if="tab === 'public'"
            v-bind="tooltipProps"
            icon="mdi-eye-off-outline"
            variant="text"
            size="small"
            color="warning"
            @click="emit('unlist', item.id)"
          />
          <v-btn
            v-else-if="tab === 'unlisted'"
            v-bind="tooltipProps"
            icon="mdi-eye-outline"
            variant="text"
            size="small"
            color="success"
            @click="emit('makePublic', item.id)"
          />
        </template>
      </v-tooltip>
    </template>

    <template #no-data>
      <StudioEmptyState :icon="emptyIcon[tab]" :text="emptyText[tab]" />
    </template>
  </v-data-table>

  <template v-else>
    <v-list v-if="items.length" lines="three">
      <v-list-item v-for="item in items" :key="item.id" :subtitle="formatPrice(item.price)">
        <template #prepend>
          <ArtworkThumbnail :src="item.image_urls[0]" avatar class="mr-2" />
        </template>

        <template #title>
          <span class="text-body-2 font-weight-medium">{{ item.title }}</span>
        </template>

        <template #append>
          <v-tooltip v-if="tab === 'public'" text="Hide from gallery" location="left">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon="mdi-eye-off-outline"
                variant="text"
                size="small"
                color="warning"
                @click="emit('unlist', item.id)"
              />
            </template>
          </v-tooltip>

          <v-tooltip v-else-if="tab === 'unlisted'" text="Make visible in gallery" location="left">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon="mdi-eye-outline"
                variant="text"
                size="small"
                color="success"
                @click="emit('makePublic', item.id)"
              />
            </template>
          </v-tooltip>

          <span v-else class="text-caption text-medium-emphasis">
            {{ formatDate(item.created_at) }}
          </span>
        </template>
      </v-list-item>
    </v-list>

    <StudioEmptyState v-else :icon="emptyIcon[tab]" :text="emptyText[tab]" />
  </template>
</template>
