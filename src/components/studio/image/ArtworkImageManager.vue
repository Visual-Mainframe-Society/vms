<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useDisplay } from 'vuetify'
import ArtworkImageSlot from './ArtworkImageSlot.vue'

// ── Display ───────────────────────────────────────────────────────────────────

const { smAndDown } = useDisplay()

// ── Props ─────────────────────────────────────────────────────────────────────

const props = defineProps<{
  adminImageUrl: string | null
  artistImageUrls: string[]
}>()

// ── Types ─────────────────────────────────────────────────────────────────────

type ArtistSlot = { type: 'url'; url: string } | { type: 'blob'; blob: Blob } | { type: 'empty' }

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ARTIST_IMAGES = 5

// ── State ─────────────────────────────────────────────────────────────────────

const activeIndex = ref(0) // 0 = admin slot, 1+ = artist slots
const artistSlots = ref<ArtistSlot[]>([])

// ── Init ──────────────────────────────────────────────────────────────────────

watch(
  () => props.artistImageUrls,
  (urls) => {
    artistSlots.value = urls.map((url): ArtistSlot => ({ type: 'url', url }))
    ensureEmptySlot()
  },
  { immediate: true },
)

watch(artistSlots, ensureEmptySlot, { deep: true })

function ensureEmptySlot() {
  if (artistSlots.value.length < MAX_ARTIST_IMAGES && artistSlots.value.at(-1)?.type !== 'empty') {
    artistSlots.value.push({ type: 'empty' })
  }
}

// ── Slot management ───────────────────────────────────────────────────────────

function updateSlot(artistIndex: number, blob: Blob) {
  artistSlots.value[artistIndex] = { type: 'blob', blob }
}

function removeSlot(artistIndex: number) {
  artistSlots.value.splice(artistIndex, 1)
  ensureEmptySlot()
  activeIndex.value = Math.min(activeIndex.value, totalSlots.value - 1)
}

function swapSlots(i: number, j: number) {
  const s = artistSlots.value
  if (i < 0 || j < 0 || i >= s.length || j >= s.length) return
  const temp = s[i] as ArtistSlot
  s[i] = s[j] as ArtistSlot
  s[j] = temp
}

function canSwapLeft(i: number): boolean {
  if (i <= 0) return false
  return artistSlots.value[i - 1]?.type !== 'empty'
}

function canSwapRight(i: number): boolean {
  const next = artistSlots.value[i + 1]
  return !!next && next.type !== 'empty'
}

function handleSwapLeft(i: number) {
  swapSlots(i, i - 1)
  activeIndex.value = i
}

function handleSwapRight(i: number) {
  swapSlots(i, i + 1)
  activeIndex.value = i + 2
}

// Total slot count (used by removeSlot clamp)
const totalSlots = computed(() => 1 + artistSlots.value.length)

// ── getChanges ────────────────────────────────────────────────────────────────

function getChanges(): {
  toDelete: string[]
  toUpload: Array<{ blob: Blob; position: number }>
  finalUrls: Array<string | null>
} {
  const toUpload: Array<{ blob: Blob; position: number }> = []
  const artistFinalUrls: Array<string | null> = []

  for (let i = 0; i < artistSlots.value.length; i++) {
    const slot = artistSlots.value[i]
    if (!slot) continue

    if (slot.type === 'url') {
      artistFinalUrls.push(slot.url)
    } else if (slot.type === 'blob') {
      const position = artistFinalUrls.length + 1
      toUpload.push({ blob: slot.blob, position })
      artistFinalUrls.push(null)
    }
    // empty slots are skipped
  }

  const currentArtistUrls = artistFinalUrls.filter((u): u is string => u !== null)
  const toDelete = props.artistImageUrls.filter((url) => !currentArtistUrls.includes(url))
  const finalUrls: Array<string | null> = [props.adminImageUrl, ...artistFinalUrls]

  return { toDelete, toUpload, finalUrls }
}

defineExpose({ getChanges })
</script>

<template>
  <div
    class="d-flex flex-column align-center"
    :style="smAndDown ? 'width: 100%' : 'width: 264px; margin-left: auto; margin-right: auto'"
  >
    <!--
      Ratio enforcer — this div is the single source of truth for the 4:5 box.
      aspect-ratio on a plain div is reliable; v-carousel ignores it because
      Vuetify manages carousel height internally. The carousel just fills this box.
    -->
    <div :style="smAndDown ? 'width: 100%; aspect-ratio: 4 / 5' : 'width: 264px; height: 330px'">
      <v-carousel
        v-model="activeIndex"
        :show-arrows="false"
        hide-delimiters
        height="100%"
        style="width: 100%"
      >
        <!-- Admin slot — always first, readonly -->
        <v-carousel-item>
          <ArtworkImageSlot :src="adminImageUrl" :readonly="true" />
        </v-carousel-item>

        <!-- Artist slots -->
        <v-carousel-item v-for="(slot, i) in artistSlots" :key="i">
          <ArtworkImageSlot
            :src="slot.type === 'empty' ? null : slot.type === 'url' ? slot.url : slot.blob"
            :show-left="canSwapLeft(i)"
            :show-right="canSwapRight(i)"
            @update:src="updateSlot(i, $event)"
            @swap:left="handleSwapLeft(i)"
            @swap:right="handleSwapRight(i)"
            @remove="removeSlot(i)"
          />
        </v-carousel-item>
      </v-carousel>
    </div>

    <!-- Custom radio-dot navigation — sits flush below the carousel, no mystery gap -->
    <v-radio-group v-model="activeIndex" inline hide-details class="mt-3">
      <v-radio
        v-for="i in Array.from({ length: totalSlots }, (_, idx) => idx)"
        :key="i"
        :value="i"
        density="compact"
      />
    </v-radio-group>
  </div>
</template>
