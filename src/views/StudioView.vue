<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'
import { useArtworkDraftStore } from '@/stores/artworkDraft'
import { useNotifier } from '@/composables/useNotifier'
import StandardPanel from '../components/studio/StandardPanel.vue'
import RejectedPanel from '../components/studio/RejectedPanel.vue'
import ArtworkThumbnail from '../components/studio/ArtworkThumbnail.vue'

const router = useRouter()
const draftStore = useArtworkDraftStore()
const { notify } = useNotifier()

// ── Types ─────────────────────────────────────────────────────────────────────

interface UploadRequest {
  id: string
  title: string
  price: number | null
  image_urls: string[]
  status: 'pending' | 'disapproved'
  notes: string | null
  created_at: string
}

interface Artwork {
  id: string
  title: string
  price: number
  image_urls: string[]
  is_listed: boolean
  created_at: string
}

// ── State ─────────────────────────────────────────────────────────────────────

const tab = ref('public')

const pendingRequests = ref<UploadRequest[]>([
  {
    id: 'req-1',
    title: 'Monsoon Reverie',
    price: 12000,
    image_urls: ['https://picsum.photos/id/200/600/600'],
    status: 'pending',
    notes: null,
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'req-2',
    title: 'Urban Lattice',
    price: 8500,
    image_urls: ['https://picsum.photos/id/214/600/600'],
    status: 'pending',
    notes: null,
    created_at: '2026-04-05T14:30:00Z',
  },
])

const rejectedRequests = ref<UploadRequest[]>([
  {
    id: 'req-3',
    title: 'Threshold',
    price: 5000,
    image_urls: ['https://picsum.photos/id/214/600/600'],
    status: 'disapproved',
    notes: 'Image quality insufficient.',
    created_at: '2026-03-20T09:00:00Z',
  },
])

const artworks = ref<Artwork[]>([
  {
    id: 'art-1',
    title: 'Silt & Memory',
    price: 15000,
    image_urls: ['https://picsum.photos/id/221/600/600'],
    is_listed: true,
    created_at: '2026-03-15T12:00:00Z',
  },
  {
    id: 'art-2',
    title: 'Ember Light',
    price: 32000,
    image_urls: ['https://picsum.photos/id/228/600/600'],
    is_listed: true,
    created_at: '2026-03-10T11:00:00Z',
  },
  {
    id: 'art-3',
    title: 'Drift',
    price: 7500,
    image_urls: ['https://picsum.photos/id/235/600/600'],
    is_listed: false,
    created_at: '2026-02-28T16:00:00Z',
  },
])

// ── Derived ───────────────────────────────────────────────────────────────────

const publicArtworks = computed(() => artworks.value.filter((a) => a.is_listed))
const unlistedArtworks = computed(() => artworks.value.filter((a) => !a.is_listed))

// ── Actions ───────────────────────────────────────────────────────────────────

function unlist(id: string) {
  const a = artworks.value.find((a) => a.id === id)
  if (a) a.is_listed = false
}

function makePublic(id: string) {
  const a = artworks.value.find((a) => a.id === id)
  if (a) a.is_listed = true
}

// ── Tab config ────────────────────────────────────────────────────────────────

const tabs = computed(() => [
  {
    value: 'public',
    label: 'Public',
    badge: publicArtworks.value.length,
    badgeColor: 'success',
    tooltip: 'Artworks visible to buyers',
  },
  {
    value: 'pending',
    label: 'Pending',
    badge: pendingRequests.value.length,
    badgeColor: 'info',
    tooltip: 'Submissions awaiting admin review',
  },
  {
    value: 'unlisted',
    label: 'Unlisted',
    badge: unlistedArtworks.value.length,
    badgeColor: 'warning',
    tooltip: 'Approved artworks hidden from the gallery',
  },
  {
    value: 'rejected',
    label: 'Rejected',
    badge: rejectedRequests.value.length,
    badgeColor: 'error',
    tooltip: 'Submissions that did not pass review',
  },
])

// ── Drafts ────────────────────────────────────────────────────────────────────

const showDrafts = ref(false)
const deletingId = ref<string | null>(null)

const draftHeaders = [
  { title: '', key: 'image', sortable: false },
  { title: 'Title', key: 'title' },
  { title: 'Price', key: 'price' },
  { title: '', key: 'actions', sortable: false, align: 'end' },
] as const

const formatINR = (n: number) => `₹${n.toLocaleString('en-IN')}`

function editDraft(id: string) {
  showDrafts.value = false
  router.push({ name: 'add-artwork', query: { draftId: id } })
}

async function deleteDraft(id: string) {
  deletingId.value = id
  try {
    const { error } = await supabase.from('upload_requests').delete().eq('id', id)
    if (error) throw error
    draftStore.removeDraft(id)
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to delete draft', color: 'error' })
  } finally {
    deletingId.value = null
  }
}
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
    <v-card variant="flat" border :rounded="$vuetify.display.mobile ? 0 : 'lg'">
      <!-- Tabs -->
      <v-tabs v-model="tab" color="primary" align-tabs="start">
        <v-tooltip v-for="t in tabs" :key="t.value" :text="t.tooltip" location="bottom">
          <template #activator="{ props }">
            <v-tab v-bind="props" :value="t.value" class="text-none" rounded="0">
              {{ t.label }}
              <v-badge v-if="t.badge" :color="t.badgeColor" :content="t.badge" inline />
            </v-tab>
          </template>
        </v-tooltip>
      </v-tabs>

      <v-divider />

      <!-- Windows -->
      <v-window v-model="tab">
        <v-window-item value="public">
          <StandardPanel
            :items="publicArtworks"
            tab="public"
            @unlist="unlist"
            @make-public="makePublic"
          />
        </v-window-item>

        <v-window-item value="pending">
          <StandardPanel :items="pendingRequests" tab="pending" />
        </v-window-item>

        <v-window-item value="unlisted">
          <StandardPanel
            :items="unlistedArtworks"
            tab="unlisted"
            @unlist="unlist"
            @make-public="makePublic"
          />
        </v-window-item>

        <v-window-item value="rejected">
          <RejectedPanel :items="rejectedRequests" />
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>

  <!-- ── Drafts bottom sheet ──────────────────────────────────────────────── -->
  <v-bottom-sheet
    v-model="showDrafts"
    :max-width="!$vuetify.display.mobile ? '50%' : ''"
    max-height="70%"
  >
    <v-card>
      <template #title>Drafts</template>
      <template #append>
        <v-btn icon="mdi-close" variant="text" @click="showDrafts = false" />
      </template>

      <!-- Desktop: Table -->
      <v-data-table
        v-if="$vuetify.display.mdAndUp && draftStore.drafts.length"
        :headers="draftHeaders"
        :items="draftStore.drafts"
        hide-default-footer
        :items-per-page="-1"
        hover
      >
        <template #[`item.image`]="{ item }">
          <ArtworkThumbnail :src="item.imageUrl" />
        </template>

        <template #[`item.title`]="{ item }">
          <span class="font-weight-medium">{{ item.title || 'Untitled' }}</span>
        </template>

        <template #[`item.price`]="{ item }">
          <span class="text-body-2">{{ item.price ? formatINR(item.price) : '—' }}</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-1">
            <v-tooltip text="Edit draft" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  @click="editDraft(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Delete draft" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  variant="text"
                  size="small"
                  color="error"
                  :loading="deletingId === item.id"
                  @click="deleteDraft(item.id)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>

      <!-- Mobile: List -->
      <v-list v-else-if="!$vuetify.display.mdAndUp && draftStore.drafts.length" lines="three">
        <v-list-item
          v-for="item in draftStore.drafts"
          :key="item.id"
          :subtitle="item.price ? formatINR(item.price) : '—'"
        >
          <template #prepend>
            <ArtworkThumbnail :src="item.imageUrl" avatar class="mr-2" />
          </template>

          <template #title>
            <span class="font-weight-medium">{{ item.title || 'Untitled' }}</span>
          </template>

          <template #append>
            <v-tooltip text="Edit draft" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  @click="editDraft(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Delete draft" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete-outline"
                  variant="text"
                  size="small"
                  color="error"
                  :loading="deletingId === item.id"
                  @click="deleteDraft(item.id)"
                />
              </template>
            </v-tooltip>
          </template>
        </v-list-item>
      </v-list>

      <!-- Empty state -->
      <StudioEmptyState v-else icon="mdi-file-edit-outline" text="No drafts saved" />
    </v-card>
  </v-bottom-sheet>
</template>
