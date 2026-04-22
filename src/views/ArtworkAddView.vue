<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useArtworkSubmission } from '@/composables/useArtworkSubmission'
import { calcArtistReceives, calcCommission } from '@/lib/constants'
import { formatPrice } from '@/lib/formatters'
import { required, positiveNumber } from '@/lib/rules'

const {
  fields,
  files,
  savedImageUrl,
  saving,
  savingDraft,
  discarding,
  showDraftDialog,
  restoreDraft,
  handleBack,
  saveDraftAndLeave,
  discardAndLeave,
  handleSubmit,
} = useArtworkSubmission()

// ── Form ref ──────────────────────────────────────────────────────────────────

const form = ref()

onMounted(restoreDraft)

// ── Image validation ──────────────────────────────────────────────────────────

const imageTouched = ref(false)

const imageError = computed(() => {
  if (!imageTouched.value) return null
  if (files.value.length === 0 && !savedImageUrl.value)
    return 'A reference photo is needed to begin the review.'
  return null
})

// ── Commission display ────────────────────────────────────────────────────────

const commission = computed(() => (fields.price ? calcCommission(fields.price) : null))
const artistReceives = computed(() => (fields.price ? calcArtistReceives(fields.price) : null))

// ── Submit ────────────────────────────────────────────────────────────────────

async function onSubmit() {
  imageTouched.value = true
  await handleSubmit(form.value)
}
</script>

<template>
  <v-app-bar flat border="b">
    <template #prepend>
      <v-btn icon="mdi-arrow-left" variant="text" @click="handleBack" />
    </template>
    <v-app-bar-title>
      <span class="font-weight-bold text-label-large text-medium-emphasis">NEW</span>
    </v-app-bar-title>
    <template #append>
      <v-btn
        color="primary"
        variant="flat"
        class="mr-2"
        rounded="lg"
        :loading="saving"
        @click="onSubmit"
      >
        Send to Curation
      </v-btn>
    </template>
  </v-app-bar>

  <v-main>
    <!-- ── Draft dialog ───────────────────────────────────────────────────── -->
    <v-dialog v-model="showDraftDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-title class="pt-6 px-6 font-weight-bold">Save as draft?</v-card-title>
        <v-card-text class="px-6 text-medium-emphasis">
          You have unsaved work. Save it as a draft so you can come back to it later, or discard it.
        </v-card-text>
        <v-card-actions class="px-6 pb-6 gap-2">
          <v-btn
            variant="outlined"
            rounded="lg"
            :loading="discarding"
            :disabled="savingDraft"
            @click="discardAndLeave"
          >
            Discard
          </v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="savingDraft"
            :disabled="discarding"
            @click="saveDraftAndLeave"
          >
            Save Draft
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-form ref="form" @submit.prevent="onSubmit">
            <!-- ── Artist's Reference ─────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-1">Artist's Reference</div>
            <div class="text-title-small text-medium-emphasis mb-4">
              Please provide a photo of the work. This serves as our primary reference for
              identification and care until we take gallery shots.
            </div>

            <v-file-upload
              v-model="files"
              clearable
              density="compact"
              variant="compact"
              icon="mdi-camera-plus"
              title="Add a photo"
              browse-text="Change"
              inset-file-list
              accept="image/*"
              :disabled="saving"
              :error-messages="imageError"
              @update:model-value="imageTouched = true"
            />

            <v-divider class="my-8" />

            <!-- ── About the Work ─────────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-4">About the Work</div>

            <v-text-field
              v-model="fields.title"
              label="What is this piece called?"
              variant="outlined"
              placeholder="e.g. Untitled No. 4"
              :rules="[required]"
              clearable
              :disabled="saving"
            />

            <v-textarea
              v-model="fields.description"
              label="The Story Behind the Work"
              variant="outlined"
              rows="3"
              auto-grow
              hint="Share your process, materials, or the inspiration for this piece."
              persistent-hint
              clearable
              :disabled="saving"
            />

            <v-divider class="my-8" />

            <!-- ── Price ──────────────────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-4">Price</div>

            <v-row align="center">
              <v-col cols="12" sm="6">
                <v-number-input
                  v-model="fields.price"
                  inset
                  controlVariant="stacked"
                  label="Listing Price"
                  variant="outlined"
                  prefix="₹"
                  :rules="[required, positiveNumber]"
                  hint="The price shown to collectors."
                  persistent-hint
                  :min="1"
                  :disabled="saving"
                />
              </v-col>

              <v-col cols="12" sm="6">
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
                          {{ commission ? formatPrice(commission) : '—' }}
                        </span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-8" />

            <!-- ── Physical Dimensions ────────────────────────────────────── -->
            <div class="text-title-medium font-weight-bold mb-1">Physical Dimensions</div>
            <div class="text-title-small text-medium-emphasis mb-4">In centimetres</div>

            <v-row density="comfortable">
              <v-col cols="4">
                <v-number-input
                  v-model="fields.height"
                  inset
                  controlVariant="stacked"
                  label="Height"
                  variant="outlined"
                  suffix="cm"
                  :rules="[required, positiveNumber]"
                  :min="1"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="4">
                <v-number-input
                  v-model="fields.width"
                  inset
                  controlVariant="stacked"
                  label="Width"
                  variant="outlined"
                  suffix="cm"
                  :rules="[required, positiveNumber]"
                  :min="1"
                  :disabled="saving"
                />
              </v-col>
              <v-col cols="4">
                <v-number-input
                  v-model="fields.depth"
                  inset
                  controlVariant="stacked"
                  label="Depth"
                  variant="outlined"
                  suffix="cm"
                  hint="Optional"
                  persistent-hint
                  :min="0"
                  :disabled="saving"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
