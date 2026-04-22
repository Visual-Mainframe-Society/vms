<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAsyncState } from '@vueuse/core'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { useArtworkDraftStore } from '@/stores/artworkDraft'
import { useNotifier } from '@/composables/useNotifier'
import type { PanelArtwork, PanelUploadRequest } from '@/types'
import PanelArtworkList from '../components/studio/ArtworkPanelList.vue'
import PanelArtwworkRejected from '../components/studio/ArtworkPanelRejected.vue'
import DraftsBottomSheet from '@/components/studio/DraftBottomSheet.vue'

const auth = useAuthStore()
const draftStore = useArtworkDraftStore()
const router = useRouter()
const { notify } = useNotifier()

// ── State ─────────────────────────────────────────────────────────────────────

const tab = ref('public')
const showDrafts = ref(false)
const togglingId = ref<string | null>(null)

const artworks = ref<PanelArtwork[]>([])
const pendingRequests = ref<PanelUploadRequest[]>([])
const rejectedRequests = ref<PanelUploadRequest[]>([])

// ── Fetch ─────────────────────────────────────────────────────────────────────

const { isLoading } = useAsyncState(
  async () => {
    const artistId = auth.user?.id
    if (!artistId) return

    const [artworksRes, requestsRes] = await Promise.all([
      supabase
        .from('artworks')
        .select('id, artist_id, title, description, price, image_urls, is_listed, created_at')
        .eq('artist_id', artistId)
        .order('created_at', { ascending: false }),
      supabase
        .from('upload_requests')
        .select('id, title, price, image_url, notes, status, created_at')
        .eq('artist_id', artistId)
        .in('status', ['pending', 'disapproved'])
        .order('created_at', { ascending: false }),
    ])

    if (artworksRes.error) throw artworksRes.error
    if (requestsRes.error) throw requestsRes.error

    artworks.value = artworksRes.data
    pendingRequests.value = (requestsRes.data ?? []).filter((r) => r.status === 'pending')
    rejectedRequests.value = (requestsRes.data ?? []).filter((r) => r.status === 'disapproved')
  },
  undefined,
  {
    onError(e) {
      notify({ message: e instanceof Error ? e.message : 'Failed to load studio', color: 'error' })
    },
  },
)

// ── Derived ───────────────────────────────────────────────────────────────────

const publicArtworks = computed(() => artworks.value.filter((a) => a.is_listed))
const unlistedArtworks = computed(() => artworks.value.filter((a) => !a.is_listed))

const tabs = computed(() => [
  { value: 'public', label: 'Public', badge: publicArtworks.value.length, badgeColor: 'success' },
  { value: 'pending', label: 'Pending', badge: pendingRequests.value.length, badgeColor: 'info' },
  {
    value: 'unlisted',
    label: 'Unlisted',
    badge: unlistedArtworks.value.length,
    badgeColor: 'warning',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    badge: rejectedRequests.value.length,
    badgeColor: 'error',
  },
])

// ── Actions ───────────────────────────────────────────────────────────────────

async function setListed(id: string, listed: boolean) {
  togglingId.value = id
  try {
    const { error } = await supabase.from('artworks').update({ is_listed: listed }).eq('id', id)
    if (error) throw error
    const artwork = artworks.value.find((a) => a.id === id)
    if (artwork) artwork.is_listed = listed
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to update artwork', color: 'error' })
  } finally {
    togglingId.value = null
  }
}

function openEdit(id: string) {
  router.push({ name: 'edit-artwork', params: { id } })
}
</script>

<template>
  <v-app-bar flat border="b">
    <v-app-bar-title>
      <span class="font-weight-bold text-label-large text-medium-emphasis">Studio</span>
    </v-app-bar-title>
    <template #append>
      <v-btn
        variant="text"
        prepend-icon="mdi-file-edit-outline"
        class="text-none mr-1"
        rounded="lg"
        :disabled="!draftStore.drafts.length"
        @click="showDrafts = true"
      >
        Drafts
        <v-badge
          v-if="draftStore.drafts.length"
          :content="draftStore.drafts.length"
          color="warning"
          inline
        />
      </v-btn>

      <v-tooltip text="Submit a new artwork for review" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="primary"
            variant="flat"
            prepend-icon="mdi-plus"
            class="text-none mr-3"
            rounded="lg"
            :to="{ name: 'add-artwork' }"
          >
            Add Artwork
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </v-app-bar>

  <v-container :class="$vuetify.display.mobile ? 'pa-0' : 'py-6'">
    <v-row justify="center">
      <v-col md="10">
        <v-card variant="flat" border :rounded="$vuetify.display.mobile ? 0 : 'lg'">
          <v-tabs v-model="tab" color="primary" align-tabs="start" center-active>
            <v-tab v-for="t in tabs" :key="t.value" :value="t.value" class="text-none" rounded="0">
              {{ t.label }}
              <v-badge v-if="t.badge" :color="t.badgeColor" :content="t.badge" inline />
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="tab">
            <v-window-item value="public">
              <PanelArtworkList
                :loading="isLoading"
                :items="publicArtworks"
                :toggling-id="togglingId"
                tab="public"
                @unlist="setListed($event, false)"
                @make-public="setListed($event, true)"
                @edit="openEdit"
              />
            </v-window-item>

            <v-window-item value="pending">
              <PanelArtworkList :loading="isLoading" :items="pendingRequests" tab="pending" />
            </v-window-item>

            <v-window-item value="unlisted">
              <PanelArtworkList
                :loading="isLoading"
                :items="unlistedArtworks"
                :toggling-id="togglingId"
                tab="unlisted"
                @unlist="setListed($event, false)"
                @make-public="setListed($event, true)"
                @edit="openEdit"
              />
            </v-window-item>

            <v-window-item value="rejected">
              <PanelArtwworkRejected :loading="isLoading" :items="rejectedRequests" />
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <DraftsBottomSheet v-model="showDrafts" />
</template>
