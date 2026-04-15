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
  togglingId?: string | null
  loading?: boolean
}>()

const emit = defineEmits<{
  unlist: [id: string]
  makePublic: [id: string]
  edit: [id: string]
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
  <!-- Desktop -->
  <v-data-table
    v-if="mdAndUp"
    :headers="headers()"
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

  <!-- Mobile -->
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
          <template v-if="tab === 'pending'">
            <span class="text-caption text-medium-emphasis">{{ formatDate(item.created_at) }}</span>
          </template>

          <v-menu v-else location="bottom end">
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
      </v-list-item>
    </v-list>

    <StudioEmptyState v-else :icon="emptyIcon[tab]" :text="emptyText[tab]" />
  </template>

  <v-alert
    v-if="tabInfo[tab]"
    :text="tabInfo[tab]"
    density="compact"
    rounded="0"
    class="text-label-large text-disabled"
    style="background: transparent !important"
  />
</template>
