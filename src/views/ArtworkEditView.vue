<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAsyncState } from '@vueuse/core'
import { useRouteParams } from '@vueuse/router'
import { supabase } from '@/lib/supabaseClient'
import { useNotifier } from '@/composables/useNotifier'
import { calcArtistReceives, calcCommission } from '@/lib/constants'
import { formatPrice } from '@/lib/formatters'
import { required, positiveNumber } from '@/lib/rules'
import type { ArtworkEditable } from '@/types'
import ArtworkImageManager from '@/components/studio/image/ArtworkImageManager.vue'

const router = useRouter()
const { notify } = useNotifier()
const id = useRouteParams('id')

// ── Form state ────────────────────────────────────────────────────────────────

const form = ref()
const managerRef = ref<InstanceType<typeof ArtworkImageManager> | null>(null)
const title = ref('')
const description = ref('')
const price = ref<number | null>(null)
const saving = ref(false)

// ── Fetch ─────────────────────────────────────────────────────────────────────

const { state: artwork, isLoading } = useAsyncState(
  async () => {
    const { data, error } = await supabase
      .from('artworks')
      .select('id, artist_id, title, description, price, image_urls, is_listed, created_at')
      .eq('id', id.value as string)
      .single()

    if (error) throw error
    return data as ArtworkEditable
  },
  null,
  {
    onSuccess(data) {
      if (!data) return
      title.value = data.title
      description.value = data.description ?? ''
      price.value = data.price
    },
    onError(e) {
      notify({ message: e instanceof Error ? e.message : 'Failed to load artwork', color: 'error' })
      router.back()
    },
  },
)

// ── Derived ───────────────────────────────────────────────────────────────────

const adminImageUrl = computed(() => artwork.value?.image_urls[0] ?? null)
const artistImageUrls = computed(() => artwork.value?.image_urls.slice(1) ?? [])
const artistReceives = computed(() => (price.value ? calcArtistReceives(price.value) : null))

// ── Helpers ───────────────────────────────────────────────────────────────────

function urlToStoragePath(url: string): string {
  return url.split('/storage/v1/object/public/artworks/')[1] ?? ''
}

// ── Save ──────────────────────────────────────────────────────────────────────

async function save() {
  if (!artwork.value) return
  const { valid } = await form.value.validate()
  if (!valid) return

  saving.value = true
  const uploadedPaths: string[] = []

  try {
    const { toDelete, toUpload, finalUrls } = await managerRef.value!.getChanges()

    if (toDelete.length) {
      const paths = toDelete.map(urlToStoragePath).filter(Boolean)
      await supabase.storage.from('artworks').remove(paths)
    }

    for (const { blob, position } of toUpload) {
      const ext = blob.type.split('/')[1] ?? 'jpg'
      const filename = `${crypto.randomUUID()}.${ext}`
      const path = `${artwork.value.artist_id}/${artwork.value.id}/gallery/${filename}`
      const { error } = await supabase.storage.from('artworks').upload(path, blob)
      if (error) throw error
      uploadedPaths.push(path)
      const { data } = supabase.storage.from('artworks').getPublicUrl(path)
      finalUrls[position] = data.publicUrl
    }

    const imageUrls = finalUrls.filter((u): u is string => typeof u === 'string')

    const { error } = await supabase
      .from('artworks')
      .update({
        title: title.value.trim(),
        description: description.value.trim() || null,
        price: price.value!,
        image_urls: imageUrls,
      })
      .eq('id', artwork.value.id)

    if (error) throw error

    notify({ message: 'Artwork updated', color: 'success' })
    router.back()
  } catch (e) {
    if (uploadedPaths.length) {
      await supabase.storage
        .from('artworks')
        .remove(uploadedPaths)
        .catch(() => {})
    }
    notify({ message: e instanceof Error ? e.message : 'Failed to save artwork', color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <v-app-bar flat border="b">
    <template #prepend>
      <v-btn icon="mdi-arrow-left" variant="text" :disabled="saving" @click="router.back()" />
    </template>
    <v-app-bar-title>
      <span class="font-weight-bold">Edit Artwork</span>
    </v-app-bar-title>
    <template #append>
      <v-btn
        color="primary"
        variant="flat"
        rounded="lg"
        class="text-none mr-3"
        :loading="saving"
        :disabled="isLoading"
        @click="save"
      >
        Update Artwork
      </v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <v-container
      v-if="isLoading"
      class="d-flex justify-center align-center"
      style="min-height: 60vh"
    >
      <v-progress-circular indeterminate color="primary" />
    </v-container>

    <v-container v-else-if="artwork" class="py-4">
      <v-card variant="flat" border rounded="lg">
        <v-card-text class="pa-0" style="overflow: hidden">
          <v-row no-gutters>
            <v-col
              cols="12"
              md="5"
              class="d-flex flex-column align-center justify-center pa-4"
              :style="
                $vuetify.display.mdAndUp
                  ? 'border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))'
                  : ''
              "
            >
              <div class="text-title-medium font-weight-bold mb-1 align-self-start">
                Visual Storytelling
              </div>
              <div class="text-body-2 text-medium-emphasis mb-4 align-self-start">
                Your official gallery photo is fixed. Share more of your story by adding detail
                shots or behind-the-scenes views below.
              </div>
              <ArtworkImageManager
                ref="managerRef"
                :admin-image-url="adminImageUrl"
                :artist-image-urls="artistImageUrls"
              />
            </v-col>

            <v-col cols="12" md="7">
              <v-container class="py-4">
                <v-form ref="form">
                  <div class="text-title-medium font-weight-bold mb-3">About the Work</div>

                  <v-text-field
                    v-model="title"
                    label="What is this piece called?"
                    variant="outlined"
                    placeholder="e.g. Untitled No. 4"
                    :rules="[required]"
                    :disabled="saving"
                  />

                  <v-textarea
                    v-model="description"
                    label="The Story Behind the Work"
                    variant="outlined"
                    rows="2"
                    auto-grow
                    hint="Share your process, materials, or the inspiration for this piece."
                    persistent-hint
                    :disabled="saving"
                    clearable
                  />

                  <v-divider class="my-2" />

                  <div class="text-title-medium font-weight-bold mb-3">Pricing</div>

                  <v-number-input
                    v-model="price"
                    inset
                    control-variant="stacked"
                    label="Listing Price"
                    variant="outlined"
                    prefix="₹"
                    :rules="[required, positiveNumber]"
                    hint="The price shown to collectors."
                    persistent-hint
                    :min="1"
                    :disabled="saving"
                    class="mb-3"
                  />

                  <v-card variant="outlined" class="border border-opacity-25" rounded="lg">
                    <v-list bg-color="transparent" class="py-0">
                      <v-list-item>
                        <v-list-item-title class="font-weight-bold"
                          >Artist Proceeds</v-list-item-title
                        >
                        <template #append>
                          <span
                            class="font-weight-bold"
                            :class="artistReceives ? 'text-success' : ''"
                          >
                            {{ artistReceives ? formatPrice(artistReceives) : '—' }}
                          </span>
                        </template>
                      </v-list-item>
                      <v-divider />
                      <v-list-item>
                        <v-list-item-title>Society Contribution (30%)</v-list-item-title>
                        <template #append>
                          <span class="font-weight-medium">
                            {{ price ? formatPrice(calcCommission(price)) : '—' }}
                          </span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </v-form>
              </v-container>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>
