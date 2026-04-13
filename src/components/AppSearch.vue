<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { VTextField } from 'vuetify/components'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const searchQuery = ref('')
const searchInput = ref<InstanceType<typeof VTextField> | null>(null)

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      await nextTick()
      searchInput.value?.focus()
    }
  },
)
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    color="background"
    temporary
    :width="Math.round($vuetify.display.width * 0.3)"
    :scrim="false"
  >
    <v-list nav>
      <v-list-item title="Search">
        <template #append>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="emit('update:modelValue', false)"
          />
        </template>
      </v-list-item>
    </v-list>
    <v-text-field
      ref="searchInput"
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      density="compact"
      variant="outlined"
      rounded="xl"
      hide-details
      clearable
      color="info"
      class="mx-3"
    />
  </v-navigation-drawer>
</template>
