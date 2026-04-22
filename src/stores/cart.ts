// stores/cart.ts
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import type { CartItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = useLocalStorage<CartItem[]>('vms-cart', [])

  function addItem(item: CartItem) {
    if (hasItem(item.artworkId)) return
    items.value.push(item)
  }

  function removeItem(artworkId: string) {
    items.value = items.value.filter((i) => i.artworkId !== artworkId)
  }

  function hasItem(artworkId: string) {
    return items.value.some((i) => i.artworkId === artworkId)
  }

  function clear() {
    items.value = []
  }

  return { items, addItem, removeItem, hasItem, clear }
})
