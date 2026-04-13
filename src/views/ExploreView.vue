<script setup lang="ts">
import { ref, computed } from 'vue'

type Medium = 'painting' | 'photography' | 'print' | 'sculpture' | 'digital'

interface ArtworkCard {
  id: string
  title: string
  image_urls: [string, ...string[]]
  medium: Medium
  price: number
  is_available: boolean
  artist: {
    username: string
  }
}

defineEmits<{ open: [id: string] }>()

// ── Dummy data ──────────────────────────────────────────────────────────────

const MEDIUMS: Medium[] = ['painting', 'photography', 'print', 'sculpture', 'digital']

const TITLES: string[] = [
  'Monsoon Reverie',
  'The Quiet Hour',
  'Urban Lattice',
  'Silt & Memory',
  'Threshold',
  'Ember Light',
  'Beneath the Canopy',
  'Salt Plain Study',
  'Crow Study No. 3',
  'Palimpsest',
  'The Unlit Room',
  'Drift',
  'Terracotta Noon',
  'Winter Passage',
  'Form After Rain',
  'Still With Fog',
  'Echo Chamber',
  'Between Tides',
  'Garden Ruin',
  'The Blue Distance',
  'Oxide and Ochre',
  'Broken Grid',
  'Long Exposure',
  'Dusk, Somewhere',
  'Residue',
  'Khayal',
  'Foliage Map',
  'Night Terrain',
  'Periphery',
  'The Seventh Field',
  'Lacuna',
  'Low Season',
  'Iron Shore',
  'Soft Architecture',
  'Overgrown',
  'Warm Geometry',
  'The Waiting',
  'Ripple Index',
  'Afternoon Haze',
  'Contour Lines',
  'After the Festival',
  'Mist Study',
  'Old Light',
  'Surface Tension',
  'Vanishing Point',
  'Ashram',
  'Scatter',
  'Peak Hour',
  'Red Vessel',
  'Somewhere in the Hills',
]

const ARTISTS: string[] = [
  'priya.menon',
  'arjun.das',
  'neha.kulkarni',
  'rohan.iyer',
  'leela.sharma',
  'vikram.nair',
  'anika.bose',
  'deepak.rawat',
  'sana.mirza',
  'tarun.chandra',
]

function makeDummy(): ArtworkCard[] {
  return TITLES.map((title, i) => ({
    id: `dummy-${i}`,
    title,
    image_urls: [`https://picsum.photos/id/${200 + i * 7}/600/600`] as [string],
    medium: MEDIUMS[i % MEDIUMS.length] as Medium,
    price: Math.round((Math.random() * 49 + 1) * 1000),
    is_available: i % 7 !== 0,
    artist: { username: ARTISTS[i % ARTISTS.length] as string },
  }))
}

const artworks = ref<ArtworkCard[]>(makeDummy())

// ── Grid size ───────────────────────────────────────────────────────────────

type GridSize = 'large' | 'small'

const gridSize = ref<GridSize>('large')

// cols value passed to v-col — fewer cols = bigger cells
const colCols = computed(() => (gridSize.value === 'large' ? 6 : 4))
const colSm = computed(() => (gridSize.value === 'large' ? 4 : 3))
const colMd = computed(() => (gridSize.value === 'large' ? 3 : 2))

// ── Toggle ──────────────────────────────────────────────────────────────────

const showAvailableOnly = ref(false)

const filteredArtworks = computed<ArtworkCard[]>(() =>
  showAvailableOnly.value ? artworks.value.filter((a) => a.is_available) : artworks.value,
)

// ── Touch support ───────────────────────────────────────────────────────────

const activeId = ref<string | null>(null)

function onCellClick(artwork: ArtworkCard): void {
  const isTouch = window.matchMedia('(hover: none)').matches
  if (!isTouch) return
  activeId.value = activeId.value === artwork.id ? null : artwork.id
}
</script>

<template>
  <v-app-bar>
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
    /></template>
    <template #append>
      <v-btn-toggle v-model="gridSize" mandatory variant="text" color="primary" class="mr-2">
        <v-btn value="large" icon="mdi-grid-large" />
        <v-btn value="small" icon="mdi-grid" />
      </v-btn-toggle>
    </template>
  </v-app-bar>

  <v-container fluid style="isolation: isolate">
    <v-row no-gutters>
      <v-col
        v-for="artwork in filteredArtworks"
        :key="artwork.id"
        :cols="colCols"
        :sm="colSm"
        :md="colMd"
      >
        <v-hover v-slot="{ isHovering, props }">
          <div
            v-bind="props"
            style="position: relative; cursor: pointer"
            @click="onCellClick(artwork)"
          >
            <v-img :src="artwork.image_urls[0]" :aspect-ratio="1" cover />

            <v-overlay
              :model-value="isHovering || activeId === artwork.id"
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
                    <span class="text-label-large">{{ artwork.artist.username }}</span>
                  </template>
                  <template #subtitle>
                    <span class="text-label-medium">
                      ₹{{ artwork.price.toLocaleString('en-IN') }}
                    </span>
                  </template>
                  <template #append>
                    <v-icon size="small">mdi-open-in-new</v-icon>
                  </template>
                </v-card>
              </div>
            </v-overlay>
          </div>
        </v-hover>
      </v-col>
    </v-row>

    <!-- Empty state -->
    <div
      v-if="filteredArtworks.length === 0"
      class="d-flex flex-column align-center py-16 text-medium-emphasis"
    >
      <v-icon size="56" class="mb-3">mdi-image-off-outline</v-icon>
      <p>No artworks available right now</p>
    </div>
  </v-container>
</template>
