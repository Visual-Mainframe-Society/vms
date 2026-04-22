<script setup lang="ts">
import { ref } from 'vue'
import { formatTimeAgo } from '@vueuse/core'
import type { ArtworkComment } from '@/types'

defineProps<{
  modelValue: boolean
  comments: ArtworkComment[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  post: [content: string]
}>()

const newComment = ref('')

function submit() {
  const trimmed = newComment.value.trim()
  if (!trimmed) return
  emit('post', trimmed)
  newComment.value = ''
}
</script>

<template>
  <v-bottom-sheet
    :model-value="modelValue"
    max-height="70dvh"
    :max-width="$vuetify.display.mdAndUp ? '50%' : '100%'"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card rounded="t-xl">
      <v-card-title class="d-flex align-center justify-space-between px-4 py-3">
        <span class="text-body-1 font-weight-bold">
          Comments
          <span v-if="comments.length" class="text-medium-emphasis font-weight-regular">
            ({{ comments.length }})
          </span>
        </span>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-divider />

      <v-sheet max-height="50dvh" class="overflow-y-auto">
        <v-list v-if="comments.length" lines="two">
          <v-list-item v-for="comment in comments" :key="comment.id" class="px-4 py-2">
            <template #prepend>
              <v-avatar size="32" class="mr-2 align-self-start mt-1">
                <v-img
                  v-if="comment.profiles.avatar_url"
                  referrerpolicy="no-referrer"
                  :src="comment.profiles.avatar_url"
                  cover
                />
                <v-icon v-else size="32">mdi-account-circle</v-icon>
              </v-avatar>
            </template>
            <template #title>
              <span class="font-weight-bold text-body-2 mr-1">{{ comment.profiles.username }}</span>
              <span class="text-body-2">{{ comment.content }}</span>
            </template>
            <template #subtitle>
              <span class="text-caption">{{ formatTimeAgo(new Date(comment.created_at)) }}</span>
            </template>
          </v-list-item>
        </v-list>

        <v-card-text v-else class="text-center text-medium-emphasis py-10">
          No comments yet. Be the first.
        </v-card-text>
      </v-sheet>

      <v-divider />

      <v-list-item class="px-3 py-2">
        <v-text-field
          v-model="newComment"
          placeholder="Add a comment…"
          variant="plain"
          density="compact"
          hide-details
          single-line
          @keyup.enter="submit"
        />
        <template #append>
          <v-btn
            variant="text"
            color="primary"
            size="small"
            class="text-none"
            :disabled="!newComment.trim()"
            @click="submit"
          >
            Post
          </v-btn>
        </template>
      </v-list-item>
    </v-card>
  </v-bottom-sheet>
</template>
