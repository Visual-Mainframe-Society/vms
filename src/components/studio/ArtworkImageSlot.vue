<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from 'vue'
import CropOverlay from './CropOverlay.vue'

const originalSrc = ref<Blob | null>(null)

const props = defineProps<{
  src: string | Blob | null
  readonly?: boolean
  showLeft?: boolean
  showRight?: boolean
}>()

const emit = defineEmits<{
  'update:src': [value: Blob]
  'swap:left': []
  'swap:right': []
  remove: []
}>()

// ── Refs ───────────────────────────────────────────────────────────────────
const inputRef = ref<HTMLInputElement | null>(null)
const cropOverlayOpen = ref(false)
const objectUrl = ref<string | null>(null)

const displayUrl = computed(() => {
  if (!props.src) return null
  return props.src instanceof Blob ? objectUrl.value : props.src
})

const isUrl = computed(() => typeof props.src === 'string')
const isBlob = computed(() => props.src instanceof Blob)
const hasImg = computed(() => props.src !== null)

// ── Object URL management ──────────────────────────────────────────────────
watch(
  () => props.src,
  (src) => {
    if (objectUrl.value) {
      URL.revokeObjectURL(objectUrl.value)
      objectUrl.value = null
    }
    if (src instanceof Blob) {
      objectUrl.value = URL.createObjectURL(src)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (objectUrl.value) URL.revokeObjectURL(objectUrl.value)
})

// ── Crop result ────────────────────────────────────────────────────────────
function onCropDone(blob: Blob) {
  emit('update:src', blob)
}

// ── File pick ──────────────────────────────────────────────────────────────
function onFilePicked(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    originalSrc.value = file
    emit('update:src', file)
  }
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <!--
    Dimensions are intentionally NOT set here.
    The parent v-carousel controls width/height; this card just fills it.
    Hardcoding px values here caused a mismatch on wide screens where the
    carousel's internal structure meant the card slightly overflowed and
    its bottom got clipped by overflow: hidden.
  -->
  <v-card
    style="width: 100%; height: 100%"
    flat
    class="rounded-lg position-relative overflow-hidden bg-surface-variant"
  >
    <!-- Readonly -->
    <template v-if="readonly">
      <v-img v-if="isUrl" :src="src as string" style="width: 100%; height: 100%" cover />
      <div v-else class="d-flex align-center justify-center fill-height">
        <v-icon icon="mdi-image-off-outline" color="medium-emphasis" size="48" />
      </div>
    </template>

    <template v-else>
      <!-- Empty state -->
      <div v-if="!hasImg" class="d-flex align-center justify-center fill-height">
        <v-btn
          icon="mdi-image-plus"
          variant="tonal"
          color="secondary"
          size="x-large"
          @click="inputRef?.click()"
        />
      </div>

      <!-- Display image -->
      <img
        v-if="hasImg && displayUrl"
        :src="displayUrl"
        style="display: block; width: 100%; height: 100%; object-fit: contain"
      />

      <!-- Controls overlay -->
      <template v-if="hasImg">
        <v-btn
          icon="mdi-delete-outline"
          size="small"
          rounded="lg"
          variant="flat"
          density="comfortable"
          class="position-absolute top-0 right-0 ma-2 opacity-50"
          style="z-index: 10"
          @click="emit('remove')"
        />

        <v-btn
          v-if="hasImg"
          density="comfortable"
          size="small"
          rounded="lg"
          class="position-absolute bottom-0 left-0 ma-2 opacity-50"
          icon="mdi-chevron-left"
          :disabled="!showLeft"
          @click="emit('swap:left')"
        />
        <v-btn
          v-if="hasImg"
          density="comfortable"
          size="small"
          rounded="lg"
          class="position-absolute bottom-0 right-0 ma-2 opacity-50"
          icon="mdi-chevron-right"
          :disabled="!showRight"
          @click="emit('swap:right')"
        />

        <v-btn
          v-if="isBlob"
          icon="mdi-crop"
          size="small"
          variant="flat"
          density="comfortable"
          rounded="lg"
          class="position-absolute top-0 left-0 ma-2 opacity-50"
          style="z-index: 10"
          @click="cropOverlayOpen = true"
        />
      </template>
    </template>
  </v-card>

  <!-- Decoupled crop overlay -->
  <CropOverlay v-model="cropOverlayOpen" :src="originalSrc" @done="onCropDone" />

  <input ref="inputRef" type="file" accept="image/*" style="display: none" @change="onFilePicked" />
</template>
