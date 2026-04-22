import { useLocalStorage } from '@vueuse/core'

export function useExplorePreferences() {
  const showAvailableOnly = useLocalStorage('explore-available-only', false)
  const gridSize = useLocalStorage<'large' | 'small'>('explore-grid-size', 'large')
  return { showAvailableOnly, gridSize }
}
