<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { MasonryWall } from '@yeger/vue-masonry-wall'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import type { ArtworkCard } from '@/types'
import { useExplorePreferences } from '@/composables/useExplorePreferences'

const { showAvailableOnly, gridSize } = useExplorePreferences()

const router = useRouter()

interface SkeletonItem {
  id: number
  height: number
}

// ── State ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

const artworks = ref<ArtworkCard[]>([])
const page = ref(0)
const initialLoading = ref(true)
const exhausted = ref(false)
const error = ref(false)

// ── Preferences store ────────────────────────────────────────────────────────

// ── Grid size ────────────────────────────────────────────────────────────────

const { xs, smAndDown } = useDisplay()

const columnWidth = computed(() => (gridSize.value === 'large' ? 300 : 180))

const minColumns = computed(() =>
  gridSize.value === 'large' ? (xs.value ? 1 : 2) : xs.value ? 2 : 2,
)

const maxColumns = computed(() => {
  if (gridSize.value === 'large') {
    if (xs.value) return 1
    if (smAndDown.value) return 2
    return 3
  } else {
    if (xs.value) return 2
    if (smAndDown.value) return 3
    return 4
  }
})

// ── Image preloader ───────────────────────────────────────────────────────────

function preloadImages(rows: ArtworkCard[]): Promise<void> {
  return Promise.all(
    rows.map(
      (artwork) =>
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = artwork.image_urls[0]
        }),
    ),
  ).then(() => undefined)
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchPage(): Promise<ArtworkCard[]> {
  const from = page.value * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('artworks')
    .select('id, title, image_urls, price, is_available, profiles(username)')
    .eq('is_listed', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (showAvailableOnly.value) query = query.eq('is_available', true)

  const { data, error: sbError } = await query
  if (sbError) throw sbError

  return (data ?? []) as unknown as ArtworkCard[]
}

async function loadMore(): Promise<'ok' | 'empty' | 'error'> {
  if (exhausted.value) return 'empty'

  try {
    const rows = await fetchPage()
    await preloadImages(rows)
    artworks.value = [...artworks.value, ...rows]

    if (rows.length < PAGE_SIZE) {
      exhausted.value = true
      return 'empty'
    }

    page.value++
    return 'ok'
  } catch {
    error.value = true
    return 'error'
  }
}

// ── Init & reset ──────────────────────────────────────────────────────────────

async function reset(): Promise<void> {
  page.value = 0
  artworks.value = []
  exhausted.value = false
  error.value = false
  initialLoading.value = true
  await loadMore()
  initialLoading.value = false
}

reset()
watch(showAvailableOnly, reset)

// ── Bottom sheet ──────────────────────────────────────────────────────────────

const sheet = ref(false)
const selectedArtwork = ref<ArtworkCard | null>(null)

function openSheet(artwork: ArtworkCard): void {
  selectedArtwork.value = artwork
  sheet.value = true
}

function navigateToDetail(): void {
  if (!selectedArtwork.value) return
  sheet.value = false
  router.push({ name: 'artwork-detail', params: { id: selectedArtwork.value.id } })
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

const skeletonItems: SkeletonItem[] = [260, 340, 200, 420, 280, 310, 380, 230].map(
  (height, id) => ({ id, height }),
)
</script>

<template>
  <v-app-bar scroll-behavior="hide" scroll-threshold="120">
    <template #prepend>
      <v-switch
        v-model="showAvailableOnly"
        label="Available only"
        inset
        color="info"
        base-color="primary"
        hide-details
        density="compact"
        class="ml-2"
      />
    </template>
    <template #append>
      <v-btn-toggle
        :model-value="gridSize"
        mandatory
        variant="text"
        color="primary"
        class="mr-2"
        @update:model-value="
          (val) => {
            if (val === 'large' || val === 'small') gridSize = val
          }
        "
      >
        <v-btn value="large" icon="mdi-grid-large" />
        <v-btn value="small" icon="mdi-grid" />
      </v-btn-toggle>
    </template>
  </v-app-bar>

  <v-container fluid class="pa-2">
    <!-- Initial skeleton -->
    <MasonryWall
      v-if="initialLoading"
      :items="skeletonItems"
      :column-width="columnWidth"
      :gap="8"
      :min-columns="minColumns"
      :max-columns="maxColumns"
    >
      <template #default="{ item }: { item: SkeletonItem }">
        <v-skeleton-loader type="image" :height="item.height" />
      </template>
    </MasonryWall>

    <!-- Error -->
    <div v-else-if="error" class="d-flex flex-column align-center py-16 text-medium-emphasis">
      <v-icon size="56" class="mb-3">mdi-alert-circle-outline</v-icon>
      <p class="mb-4">Something went wrong</p>
      <v-btn variant="tonal" @click="reset">Try again</v-btn>
    </div>

    <!-- Empty -->
    <div
      v-else-if="artworks.length === 0"
      class="d-flex flex-column align-center py-16 text-medium-emphasis"
    >
      <v-icon size="56" class="mb-3">mdi-image-off-outline</v-icon>
      <p>No artworks available right now</p>
    </div>

    <!-- Grid -->
    <v-infinite-scroll
      v-else
      :height="undefined"
      mode="intersect"
      @load="({ done }) => loadMore().then(done)"
    >
      <MasonryWall
        :items="artworks"
        :column-width="columnWidth"
        :gap="8"
        :min-columns="minColumns"
        :max-columns="maxColumns"
      >
        <template #default="{ item: artwork }: { item: ArtworkCard }">
          <div v-ripple style="cursor: pointer; overflow: hidden" @click="openSheet(artwork)">
            <img
              :src="artwork.image_urls[0]"
              :alt="artwork.title"
              style="display: block; width: 100%; height: auto"
            />
          </div>
        </template>
      </MasonryWall>

      <template #empty>
        <div class="d-flex justify-center py-4 text-disabled">
          <span class="text-body-small">You've seen it all</span>
        </div>
      </template>
    </v-infinite-scroll>
  </v-container>

  <!-- Artwork bottom sheet -->
  <v-bottom-sheet v-model="sheet" :max-width="!$vuetify.display.mobile ? '50% ' : '100%'">
    <v-card v-if="selectedArtwork" rounded="t-xl" elevation="0">
      <div style="width: 100%; aspect-ratio: 4 / 5; overflow: hidden; position: relative">
        <img
          :src="selectedArtwork.image_urls[0]"
          aria-hidden="true"
          style="
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            filter: blur(24px) brightness(0.7);
            transform: scale(1.1);
          "
        />
        <img
          :src="selectedArtwork.image_urls[0]"
          :alt="selectedArtwork.title"
          style="position: relative; display: block; width: 100%; height: 100%; object-fit: contain"
        />
      </div>

      <v-card-item class="pt-5 pb-2">
        <template #prepend>
          <div>
            <v-card-title class="text-title-medium pa-0">
              {{ selectedArtwork.title }}
            </v-card-title>
            <v-card-subtitle class="text-body-medium pa-0 mt-1">
              {{ selectedArtwork.profiles.username }}
            </v-card-subtitle>
          </div>
        </template>
        <template #append>
          <div class="d-flex flex-column align-end ga-1">
            <v-chip
              v-if="!selectedArtwork.is_available"
              color="error"
              variant="flat"
              size="small"
              label
            >
              <v-icon start>mdi-close-circle-outline</v-icon>
              Sold
            </v-chip>
            <span class="text-title-medium">
              ₹{{ selectedArtwork.price.toLocaleString('en-IN') }}
            </span>
          </div>
        </template>
      </v-card-item>

      <v-card-actions class="px-4 pb-6">
        <v-btn icon="mdi-close" variant="tonal" @click="sheet = false" />
        <v-btn
          class="flex-grow-1"
          variant="tonal"
          append-icon="mdi-open-in-new"
          color="info"
          size="large"
          @click="navigateToDetail"
        >
          View artwork
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-bottom-sheet>
</template>
