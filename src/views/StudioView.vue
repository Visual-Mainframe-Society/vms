<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { useArtworkDraftStore } from '@/stores/artworkDraft'
import { useNotifier } from '@/composables/useNotifier'
import StandardPanel from '../components/studio/StandardPanel.vue'
import RejectedPanel from '../components/studio/RejectedPanel.vue'
import DraftsBottomSheet from '@/components/studio/DraftsBottomSheet.vue'

const auth = useAuthStore()
const draftStore = useArtworkDraftStore()
const router = useRouter()
const { notify } = useNotifier()

// ── Types ─────────────────────────────────────────────────────────────────────

interface PanelUploadRequest {
  id: string
  title: string
  price: number | null
  image_urls: string[]
  notes: string | null
  created_at: string
}

interface PanelArtwork {
  id: string
  artist_id: string
  title: string
  description: string | null
  price: number
  image_urls: string[]
  is_listed: boolean
  created_at: string
}

// ── State ─────────────────────────────────────────────────────────────────────

const tab = ref('public')
const showDrafts = ref(false)
const loading = ref(false)
const togglingId = ref<string | null>(null)

const pendingRequests = ref<PanelUploadRequest[]>([])
const rejectedRequests = ref<PanelUploadRequest[]>([])
const artworks = ref<PanelArtwork[]>([])

// ── Fetch ─────────────────────────────────────────────────────────────────────

async function fetchStudioData() {
  const artistId = auth.user?.id
  if (!artistId) return

  loading.value = true
  try {
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

    const rawPending = (requestsRes.data ?? []).filter((r) => r.status === 'pending')
    const rawRejected = (requestsRes.data ?? []).filter((r) => r.status === 'disapproved')

    const mapRequest = (r: (typeof rawPending)[0]): PanelUploadRequest => ({
      id: r.id,
      title: r.title,
      price: r.price,
      image_urls: r.image_url ? [r.image_url] : [],
      notes: r.notes,
      created_at: r.created_at,
    })

    pendingRequests.value = rawPending.map(mapRequest)
    rejectedRequests.value = rawRejected.map(mapRequest)
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to load studio', color: 'error' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchStudioData)

// ── Derived ───────────────────────────────────────────────────────────────────

const publicArtworks = computed(() => artworks.value.filter((a) => a.is_listed))
const unlistedArtworks = computed(() => artworks.value.filter((a) => !a.is_listed))

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

// ── Tab config ────────────────────────────────────────────────────────────────

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
</script>

<template>
  <v-app-bar flat border="b">
    <v-app-bar-title>
      <span class="font-weight-bold">Studio</span>
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
        <v-card
          variant="flat"
          border
          :rounded="$vuetify.display.mobile ? 0 : 'lg'"
          :loading="loading && !$vuetify.display.mdAndUp"
        >
          <v-tabs v-model="tab" color="primary" align-tabs="start">
            <v-tab v-for="t in tabs" :key="t.value" :value="t.value" class="text-none" rounded="0">
              {{ t.label }}
              <v-badge v-if="t.badge" :color="t.badgeColor" :content="t.badge" inline />
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="tab">
            <v-window-item value="public">
              <StandardPanel
                :loading="loading"
                :items="publicArtworks"
                :toggling-id="togglingId"
                tab="public"
                @unlist="setListed($event, false)"
                @make-public="setListed($event, true)"
                @edit="openEdit"
              />
            </v-window-item>

            <v-window-item value="pending">
              <StandardPanel :loading="loading" :items="pendingRequests" tab="pending" />
            </v-window-item>

            <v-window-item value="unlisted">
              <StandardPanel
                :loading="loading"
                :items="unlistedArtworks"
                :toggling-id="togglingId"
                tab="unlisted"
                @unlist="setListed($event, false)"
                @make-public="setListed($event, true)"
                @edit="openEdit"
              />
            </v-window-item>

            <v-window-item value="rejected">
              <RejectedPanel :loading="loading" :items="rejectedRequests" />
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <DraftsBottomSheet v-model="showDrafts" />
</template>
