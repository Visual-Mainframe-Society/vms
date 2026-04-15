<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

interface Artwork {
  id: string
  title: string
  price: number
  profiles: { username: string }
}

const route = useRoute()
const artwork = ref<Artwork | null>(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  const { data, error: sbError } = await supabase
    .from('artworks')
    .select('id, title, price, profiles(username)')
    .eq('id', route.params.id as string)
    .single()

  if (sbError) {
    error.value = true
  } else {
    artwork.value = data as unknown as Artwork
  }

  loading.value = false
})
</script>

<template>
  <v-container class="py-8">
    <v-skeleton-loader v-if="loading" type="heading, text" />

    <div v-else-if="error" class="text-medium-emphasis">Failed to load artwork.</div>

    <p v-else-if="artwork">
      <strong>{{ artwork.profiles.username }}</strong> is selling <em>{{ artwork.title }}</em> for
      ₹{{ artwork.price.toLocaleString('en-IN') }}.
    </p>
  </v-container>
</template>
