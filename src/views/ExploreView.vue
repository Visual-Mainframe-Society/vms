<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia' // ← NEW
import { useDisplay } from 'vuetify'
import { MasonryWall } from '@yeger/vue-masonry-wall'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'vue-router'
import { useExplorePreferences } from '@/stores/explore' // ← NEW

const router = useRouter()

// ── Types ────────────────────────────────────────────────────────────────────

interface ArtworkCard {
  id: string
  title: string
  image_urls: [string, ...string[]]
  price: number
  is_available: boolean
  profiles: { username: string }
}

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

const prefs = useExplorePreferences()
const { showAvailableOnly, gridSize } = storeToRefs(prefs)

// ── Grid size ────────────────────────────────────────────────────────────────

const { xs, smAndDown } = useDisplay()

const columnWidth = computed(() => (gridSize.value === 'large' ? 300 : 180))

// Responsive column counts
//   large:  mobile=1  tablet=2  desktop=3
//   small:  mobile=2  tablet=3  desktop=4
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

// ── Tap overlay ───────────────────────────────────────────────────────────────

const activeId = ref<string | null>(null)

function onCellClick(artwork: ArtworkCard): void {
  activeId.value = activeId.value === artwork.id ? null : artwork.id
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

  <v-container fluid class="pa-2" style="isolation: isolate">
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
          <div style="position: relative; cursor: pointer" @click="onCellClick(artwork)">
            <img
              :src="artwork.image_urls[0]"
              :alt="artwork.title"
              style="display: block; width: 100%; height: auto"
            />

            <v-overlay
              :model-value="activeId === artwork.id"
              contained
              :opacity="0.7"
              :content-props="{ style: 'width: 100%; height: 100%;' }"
            >
              <div class="d-flex flex-column justify-space-between h-100 w-100">
                <div>
                  <v-chip
                    v-if="!artwork.is_available"
                    color="info"
                    variant="outlined"
                    rounded="xl"
                    class="ma-2"
                  >
                    Sold
                  </v-chip>
                </div>

                <v-card color="transparent" elevation="0">
                  <template #title>
                    <span class="text-label-large">{{ artwork.profiles.username }}</span>
                  </template>
                  <template #subtitle>
                    <span class="text-label-medium">
                      ₹{{ artwork.price.toLocaleString('en-IN') }}
                    </span>
                  </template>
                  <template #append>
                    <v-btn
                      icon="mdi-open-in-new"
                      variant="text"
                      size="small"
                      @click.stop="
                        router.push({ name: 'artwork-detail', params: { id: artwork.id } })
                      "
                    ></v-btn>
                  </template>
                </v-card>
              </div>
            </v-overlay>
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
</template>
