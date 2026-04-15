<script setup lang="ts">
import { computed } from 'vue'
import { RectangleStencil } from 'vue-advanced-cropper'

const props = defineProps<{
  image: object
  coordinates: { width: number; height: number; left: number; top: number }
  stencilCoordinates: { width: number; height: number; left: number; top: number }
  transitions?: { enabled: boolean; time: number; timingFunction: string }
  aspectRatio?: number
  minAspectRatio?: number
  maxAspectRatio?: number
  showGrid?: boolean
}>()

const emit = defineEmits(['move', 'moveEnd', 'resize', 'resizeEnd'])

const style = computed(() => {
  const { height, width, left, top } = props.stencilCoordinates
  const s: Record<string, string> = {
    position: 'absolute',
    width: `${width}px`,
    height: `${height}px`,
    transform: `translate(${left}px, ${top}px)`,
  }
  if (props.transitions?.enabled) {
    s.transition = `${props.transitions.time}ms ${props.transitions.timingFunction}`
  }
  return s
})

function aspectRatios() {
  return {
    minimum: props.aspectRatio ?? props.minAspectRatio,
    maximum: props.aspectRatio ?? props.maxAspectRatio,
  }
}

defineExpose({ aspectRatios })
</script>

<template>
  <div :style="style">
    <RectangleStencil
      v-bind="$props"
      :stencil-coordinates="{ ...stencilCoordinates, left: 0, top: 0 }"
      @move="emit('move', $event)"
      @move-end="emit('moveEnd')"
      @resize="emit('resize', $event)"
      @resize-end="emit('resizeEnd')"
    />
    <div v-if="showGrid" class="grid-overlay" aria-hidden="true">
      <div class="grid-line v" style="left: 33.33%" />
      <div class="grid-line v" style="left: 66.66%" />
      <div class="grid-line h" style="top: 33.33%" />
      <div class="grid-line h" style="top: 66.66%" />
    </div>
  </div>
</template>

<style scoped>
.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.grid-line {
  position: absolute;
  background: rgba(255, 255, 255, 0.5);
}
.grid-line.v {
  top: 0;
  bottom: 0;
  width: 2px;
}
.grid-line.h {
  left: 0;
  right: 0;
  height: 2px;
}
</style>
