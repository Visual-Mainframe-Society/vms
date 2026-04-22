<script setup lang="ts">
import { ref } from 'vue'
import { useShare, useClipboard } from '@vueuse/core'
import { useNotifier } from '@/composables/useNotifier'
import { useArtworkActions } from '@/composables/useArtworkActions'
import { formatCount } from '@/lib/formatters'
import BtnSignIn from '@/components/ButtonSignIn.vue'

const props = defineProps<{
  artworkId: string
  artworkTitle: string
  commentCount: number
}>()

const emit = defineEmits<{
  comment: []
}>()

// ── Actions ───────────────────────────────────────────────────────────────────

const { liked, liking, saved, saving, toggleLike, toggleSave } = useArtworkActions(props.artworkId)

// ── Menu state (UI only) ──────────────────────────────────────────────────────

const loginMenu = ref(false)
const saveMenu = ref(false)

async function onToggleLike() {
  const handled = await toggleLike()
  if (!handled) loginMenu.value = true
}

async function onToggleSave() {
  const handled = await toggleSave()
  if (!handled) saveMenu.value = true
}

// ── Share ─────────────────────────────────────────────────────────────────────

const { share, isSupported: shareSupported } = useShare()
const { copy } = useClipboard()
const { notify } = useNotifier()

async function handleShare() {
  const url = window.location.href
  if (shareSupported.value) {
    await share({ title: props.artworkTitle, url })
  } else {
    copy(url)
    notify({ message: 'Link copied to clipboard', color: 'info' })
  }
}
</script>

<template>
  <div class="px-2 pt-1 flex-shrink-0">
    <div class="d-flex align-center">
      <v-menu v-model="loginMenu" :close-on-content-click="false" location="bottom start">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="liked !== undefined ? undefined : menuProps"
            :icon="liked ? 'mdi-heart' : 'mdi-heart-outline'"
            :color="liked ? 'error' : undefined"
            :loading="liking"
            variant="text"
            @click="onToggleLike"
          />
        </template>
        <BtnSignIn />
      </v-menu>

      <div class="d-flex align-center">
        <v-btn icon="mdi-comment-outline" variant="text" @click="emit('comment')" />
        <span v-if="commentCount > 0" class="text-body-2">{{ formatCount(commentCount) }}</span>
      </div>

      <v-btn icon="mdi-share-variant-outline" variant="text" @click="handleShare" />

      <v-spacer />

      <v-menu v-model="saveMenu" :close-on-content-click="false" location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="saved !== undefined ? undefined : menuProps"
            :icon="saved ? 'mdi-bookmark' : 'mdi-bookmark-outline'"
            :loading="saving"
            variant="text"
            @click="onToggleSave"
          />
        </template>
        <BtnSignIn />
      </v-menu>
    </div>
  </div>
</template>
