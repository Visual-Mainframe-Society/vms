<script setup lang="ts">
import { computed } from 'vue'
import { useObjectUrl, useFileDialog } from '@vueuse/core'
import CropOverlay from './CropOverlay.vue'

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

// ── Blob → object URL (auto-revoked by VueUse) ────────────────────────────────

const blobSrc = computed(() => (props.src instanceof Blob ? props.src : null))
const objectUrl = useObjectUrl(blobSrc)

const displayUrl = computed(() => {
  if (!props.src) return null
  return props.src instanceof Blob ? objectUrl.value : props.src
})

const isBlob = computed(() => props.src instanceof Blob)
const hasImg = computed(() => props.src !== null)

// ── File picker ───────────────────────────────────────────────────────────────

const { open: openFilePicker, onChange } = useFileDialog({
  accept: 'image/*',
  multiple: false,
})

onChange((files) => {
  const file = files?.[0]
  if (file) emit('update:src', file)
})

// ── Crop overlay ──────────────────────────────────────────────────────────────

const cropOverlayOpen = defineModel<boolean>('cropOpen', { default: false })
const originalSrc = computed(() => (props.src instanceof Blob ? props.src : null))

function onCropDone(blob: Blob) {
  emit('update:src', blob)
}
</script>

<template>
  <v-card
    style="width: 100%; height: 100%"
    flat
    class="rounded-lg position-relative overflow-hidden bg-surface-variant"
  >
    <!-- Readonly -->
    <template v-if="readonly">
      <v-img v-if="typeof src === 'string'" :src="src" style="width: 100%; height: 100%" cover />
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
          @click="openFilePicker()"
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
          density="comfortable"
          size="small"
          rounded="lg"
          class="position-absolute bottom-0 left-0 ma-2 opacity-50"
          icon="mdi-chevron-left"
          :disabled="!showLeft"
          @click="emit('swap:left')"
        />
        <v-btn
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

  <CropOverlay v-model="cropOverlayOpen" :src="originalSrc" @done="onCropDone" />
</template>
