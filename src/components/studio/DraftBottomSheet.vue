<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useArtworkDraftStore } from '@/stores/artworkDraft'
import { useNotifier } from '@/composables/useNotifier'
import ArtworkThumbnail from './BaseThumbnail.vue'
import StudioEmptyState from './StudioEmptyState.vue'
import { useUploadRequest } from '@/composables/useUploadRequest'
import { formatPrice } from '@/lib/formatters'

const { remove } = useUploadRequest()

// ── Props / emits ──────────────────────────────────────────────────────────────

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}

// ── Dependencies ───────────────────────────────────────────────────────────────

const router = useRouter()
const draftStore = useArtworkDraftStore()
const { notify } = useNotifier()

// ── State ──────────────────────────────────────────────────────────────────────

const deletingId = ref<string | null>(null)

// ── Table headers — thumbnail embedded in title cell, matching panel style ─────

const headers = [
  { title: 'Artwork', key: 'title', align: 'start' as const },
  { title: 'Price', key: 'price', width: '140px' },
  { title: '', key: 'actions', sortable: false, align: 'end' as const, width: '60px' },
]

// ── Actions ────────────────────────────────────────────────────────────────────

function editDraft(id: string) {
  close()
  router.push({ name: 'add-artwork', query: { draftId: id } })
}

async function deleteDraft(id: string) {
  deletingId.value = id
  try {
    await remove(id)
    draftStore.removeDraft(id)
  } catch (e) {
    notify({ message: e instanceof Error ? e.message : 'Failed to delete draft', color: 'error' })
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    :max-width="!$vuetify.display.mobile ? '50%' : ''"
    max-height="70%"
    scrollable
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card>
      <template #title>Drafts</template>
      <template #append>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </template>

      <!-- Desktop: Table -->
      <v-data-table
        v-if="$vuetify.display.mdAndUp && draftStore.drafts.length"
        :headers="headers"
        :items="draftStore.drafts"
        hide-default-footer
        :items-per-page="-1"
        hover
      >
        <!-- Thumbnail + title in one cell, matching StandardPanel -->
        <template #[`item.title`]="{ item }">
          <div class="d-flex align-center ga-4 py-2">
            <ArtworkThumbnail :src="item.imageUrl" />
            <span class="text-body-2 font-weight-medium">{{ item.title || 'Untitled' }}</span>
          </div>
        </template>

        <template #[`item.price`]="{ item }">
          <span class="text-body-2 font-weight-medium">{{ formatPrice(item.price) }}</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <div class="d-flex ga-1">
            <v-tooltip text="Edit draft" location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  @click="editDraft(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Delete draft" location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
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
          :subtitle="formatPrice(item.price)"
        >
          <template #prepend>
            <ArtworkThumbnail :src="item.imageUrl" avatar class="mr-2" />
          </template>

          <template #title>
            <span class="text-body-2 font-weight-medium">{{ item.title || 'Untitled' }}</span>
          </template>

          <template #append>
            <v-tooltip text="Edit draft" location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
                  icon="mdi-pencil-outline"
                  variant="text"
                  size="small"
                  @click="editDraft(item.id)"
                />
              </template>
            </v-tooltip>

            <v-tooltip text="Delete draft" location="top">
              <template #activator="{ props: tooltipProps }">
                <v-btn
                  v-bind="tooltipProps"
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
