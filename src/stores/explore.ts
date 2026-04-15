import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExplorePreferences = defineStore(
  'explorePreferences',
  () => {
    const showAvailableOnly = ref(false)
    const gridSize = ref<'large' | 'small'>('large')
    return { showAvailableOnly, gridSize }
  },
  { persist: true },
)
