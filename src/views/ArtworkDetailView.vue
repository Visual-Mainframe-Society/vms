<script setup lang="ts">
import { ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useAsyncState } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { supabase } from '@/lib/supabaseClient'
import type { ArtworkDetail } from '@/types'
import ArtworkCarousel from '@/components/artwork/ArtworkCarousel.vue'
import ArtworkArtistHeader from '@/components/artwork/ArtworkArtistHeader.vue'
import ArtworkActionBar from '@/components/artwork/ArtworkActionBar.vue'
import ArtworkInfoPanel from '@/components/artwork/ArtworkInfoPanel.vue'
import ArtworkCommentsSheet from '@/components/artwork/ArtworkCommentsSheet.vue'

const { mdAndUp } = useDisplay()
const id = useRouteParams('id')
const currentImage = ref(0)
const commentsOpen = ref(false)

const {
  state: artwork,
  isLoading,
  error,
} = useAsyncState(async () => {
  const { data, error } = await supabase
    .from('artworks')
    .select(`
      id, title, description, price, medium,
      dimensions_cm, image_urls, created_at, is_available,
      profiles ( username, full_name, avatar_url ),
      comments ( id, content, created_at, profiles ( username, avatar_url ) )
    `)
    .eq('id', id.value as string)
    .single()

  if (error) throw error
  return data as unknown as ArtworkDetail
}, null)
</script>

<template>
  <!-- ── Loading ─────────────────────────────────────────── -->
  <v-container v-if="isLoading" max-width="480" class="pa-4">
    <v-card rounded="lg" elevation="1">
      <v-skeleton-loader type="list-item-avatar" />
      <v-skeleton-loader type="image" />
      <v-skeleton-loader type="list-item-three-line" />
    </v-card>
  </v-container>

  <!-- ── Error ───────────────────────────────────────────── -->
  <v-container v-else-if="error" max-width="480" class="pa-4">
    <v-card rounded="lg" elevation="1">
      <v-card-text class="text-center pa-8">
        <v-icon size="56" color="error" class="mb-3">mdi-image-broken-variant</v-icon>
        <p class="text-body-1 text-medium-emphasis">Failed to load artwork.</p>
      </v-card-text>
    </v-card>
  </v-container>

  <!-- ── Main ────────────────────────────────────────────── -->
  <template v-else-if="artwork">
    <div
      :class="mdAndUp ? 'd-flex' : 'd-flex flex-column'"
      :style="
        mdAndUp
          ? 'height: calc(100dvh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px)); overflow: hidden;'
          : ''
      "
    >
      <!-- ── LEFT / MOBILE · content column ───────────────── -->
      <div
        class="d-flex flex-column"
        :style="mdAndUp ? 'flex: 1 1 0; height: 100%; overflow-y: auto;' : ''"
      >
        <ArtworkArtistHeader :profile="artwork.profiles" />

        <v-divider />

        <!-- Mobile-only inline carousel -->
        <div
          v-if="!mdAndUp"
          style="
            width: 100%;
            aspect-ratio: 4 / 5;
            overflow: hidden;
            flex-shrink: 0;
            background-color: rgb(var(--v-theme-surface-variant));
          "
        >
          <ArtworkCarousel v-model="currentImage" :image-urls="artwork.image_urls" />
        </div>

        <ArtworkActionBar
          :artwork-title="artwork.title"
          :artwork-id="artwork.id"
          :comment-count="artwork.comments.length"
          @comment="commentsOpen = true"
        />

        <v-divider />

        <ArtworkInfoPanel :artwork="artwork" />
      </div>

      <!-- ── RIGHT · Desktop carousel panel ───────────────── -->
      <div
        v-if="mdAndUp"
        :style="{
          width: 'calc((100dvh - var(--v-layout-top, 0px) - var(--v-layout-bottom, 0px)) * 4 / 5)',
          height: '100%',
          flexShrink: 0,
          overflow: 'hidden',
          borderLeft: 'thin solid rgba(var(--v-border-color), var(--v-border-opacity))',
          backgroundColor: 'rgb(var(--v-theme-surface-variant))',
        }"
      >
        <ArtworkCarousel v-model="currentImage" :image-urls="artwork.image_urls" />
      </div>
    </div>

    <ArtworkCommentsSheet
      v-model="commentsOpen"
      :comments="artwork.comments"
      @post="
        (content) => {
          /* TODO: persist comment */
        }
      "
    />
  </template>
</template>
