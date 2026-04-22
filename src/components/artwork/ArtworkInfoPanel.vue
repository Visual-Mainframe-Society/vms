<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice } from '@/lib/formatters'
import { useCartStore } from '@/stores/cart'
import { useNotifier } from '@/composables/useNotifier'
import type { ArtworkDetail } from '@/types'
import { useTimeAgo } from '@vueuse/core'

const postedAt = useTimeAgo(computed(() => props.artwork.created_at))

const props = defineProps<{ artwork: ArtworkDetail }>()

const router = useRouter()
const cart = useCartStore()
const { notify } = useNotifier()

const inCart = computed(() => cart.hasItem(props.artwork.id))

function buildCartItem() {
  return {
    artworkId: props.artwork.id,
    title: props.artwork.title,
    price: props.artwork.price,
    imageUrl: props.artwork.image_urls[0] ?? '',
    artistUsername: props.artwork.profiles.username,
    isAvailable: props.artwork.is_available,
  }
}

function addToCart() {
  cart.addItem(buildCartItem())
  notify({ message: 'Added to cart', color: 'success' })
}

function buyNow() {
  cart.addItem(buildCartItem())
  router.push('/cart')
}
</script>

<template>
  <div class="pa-5">
    <div class="d-flex align-start justify-space-between ga-3 mb-2">
      <h1 class="text-h5 font-weight-bold">{{ artwork.title }}</h1>
      <v-chip
        :color="artwork.is_available ? 'success' : 'error'"
        variant="tonal"
        size="small"
        label
        class="mt-1 flex-shrink-0"
      >
        {{ artwork.is_available ? 'Available' : 'Sold' }}
      </v-chip>
    </div>

    <p v-if="artwork.description" class="text-body-1 mb-1">{{ artwork.description }}</p>
    <p class="text-label-large text-disabled mb-6">{{ postedAt }}</p>
    <v-divider class="mb-5" />

    <span class="text-title-large font-weight-bold d-block mb-4 text-success">{{
      formatPrice(artwork.price)
    }}</span>

    <div v-if="artwork.is_available" class="d-flex flex-column flex-md-row ga-3 mb-2">
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        size="large"
        class="text-none flex-grow-1"
        prepend-icon="mdi-lightning-bolt"
        @click="buyNow"
      >
        Buy Now
      </v-btn>
      <v-btn
        :color="inCart ? 'success' : 'primary'"
        :variant="inCart ? 'tonal' : 'outlined'"
        rounded="lg"
        size="large"
        class="text-none flex-grow-1"
        :prepend-icon="inCart ? 'mdi-check' : 'mdi-cart-outline'"
        :disabled="inCart"
        @click="addToCart"
      >
        {{ inCart ? 'In Cart' : 'Add to Cart' }}
      </v-btn>
    </div>

    <v-divider class="my-5" />

    <p class="text-overline text-disabled mb-2">Artwork Details</p>
    <v-list density="compact" lines="two" class="pa-0">
      <v-list-item>
        <template #title>
          <span class="text-caption text-medium-emphasis">Medium</span>
        </template>
        <template #subtitle>
          <span class="text-body-2 text-high-emphasis text-capitalize">{{ artwork.medium }}</span>
        </template>
      </v-list-item>
      <v-list-item v-if="artwork.dimensions_cm">
        <template #title>
          <span class="text-caption text-medium-emphasis">Dimensions</span>
        </template>
        <template #subtitle>
          <span class="text-body-2 text-high-emphasis">
            {{ artwork.dimensions_cm.height }} × {{ artwork.dimensions_cm.width }}
            <span v-if="artwork.dimensions_cm.depth"> × {{ artwork.dimensions_cm.depth }}</span>
            cm
          </span>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>
