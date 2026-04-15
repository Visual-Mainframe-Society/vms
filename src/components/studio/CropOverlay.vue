<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import GridStencil from './GridStencil.vue'

const props = defineProps<{
  modelValue: boolean
  src: string | Blob | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  done: [blob: Blob]
}>()

const cropperRef = ref<InstanceType<typeof Cropper> | null>(null)
const imgUrl = ref<string | null>(null)
const cropperKey = ref(0)
const cropMode = ref<'free' | '4:5'>('4:5')
const imageAspect = ref('1 / 1')
const showGrid = ref(true)
let blobUrl: string | null = null

const stencilProps = computed(() => (cropMode.value === '4:5' ? { aspectRatio: 4 / 5 } : {}))

watch(
  () => props.modelValue,
  (open) => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      blobUrl = null
    }
    imgUrl.value = null

    if (!open || !props.src) return

    cropMode.value = '4:5'
    cropperKey.value++

    const src = props.src
    const url = src instanceof Blob ? URL.createObjectURL(src) : src
    if (src instanceof Blob) blobUrl = url

    const img = new Image()
    img.onload = () => {
      imageAspect.value = `${img.naturalWidth} / ${img.naturalHeight}`
      imgUrl.value = url
    }
    img.src = url
  },
)

watch(cropMode, () => {
  cropperKey.value++
})

function close() {
  emit('update:modelValue', false)
}

function onDone() {
  const result = cropperRef.value?.getResult()
  result?.canvas?.toBlob(
    (blob) => {
      if (blob) emit('done', blob)
      close()
    },
    'image/jpeg',
    0.95,
  )
}
</script>

<template>
  <v-dialog :model-value="modelValue" @update:model-value="close" fullscreen>
    <v-sheet color="background">
      <v-container fluid class="d-flex flex-column" style="height: 100dvh">
        <!-- Top bar -->
        <v-toolbar color="background" density="compact">
          <v-toolbar-title
            class="text-caption text-medium-emphasis font-weight-medium text-uppercase"
          >
            Crop Image
          </v-toolbar-title>
          <v-btn icon="mdi-close" @click="close" />
        </v-toolbar>

        <!-- Cropper -->
        <v-sheet
          color="background"
          class="flex-1-1 d-flex align-center justify-center overflow-hidden"
          style="min-height: 0"
        >
          <div
            v-if="imgUrl"
            :style="`aspect-ratio: ${imageAspect}; max-width: 100%; max-height: 100%; overflow: hidden`"
          >
            <Cropper
              :stencil-component="GridStencil"
              :key="cropperKey"
              ref="cropperRef"
              :src="imgUrl"
              :stencil-props="{ ...stencilProps, showGrid }"
              style="width: 100%; height: 100%"
            />
          </div>
        </v-sheet>

        <!-- Bottom bar -->
        <v-toolbar color="background">
          <v-btn :icon="showGrid ? 'mdi-grid' : 'mdi-grid-off'" @click="showGrid = !showGrid" />
          <v-btn-toggle v-model="cropMode" mandatory variant="flat" color="primary">
            <v-btn value="free" :text="$vuetify.display.xs ? 'Free' : 'Freeform'" />
            <v-btn value="4:5" text="4:5" />
          </v-btn-toggle>
          <v-spacer />

          <v-btn
            v-if="$vuetify.display.mdAndDown"
            icon="mdi-check"
            variant="flat"
            color="primary"
            @click="onDone"
          />
          <v-btn
            v-else
            text="Done"
            size="large"
            append-icon="mdi-check"
            variant="flat"
            color="primary"
            @click="onDone"
          />
        </v-toolbar>
      </v-container>
    </v-sheet>
  </v-dialog>
</template>
