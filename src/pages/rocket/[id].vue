<template>
  <v-container class="py-8 px-4" max-width="1000">
    <v-row class="mb-6">
      <v-col>
        <v-btn
          prepend-icon="mdi-arrow-left"
          variant="text"
          class="text-none px-0 font-weight-bold text-grey-lighten-1"
          @click="goBack"
        >
          Back to fleet
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="isLoading && !rocket" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
        class="mb-4"
      />
      <span class="text-body-1 text-grey">Loading rocket details...</span>
    </div>

    <v-card
      v-else-if="!rocket && isLoaded"
      variant="outlined"
      rounded="xl"
      class="pa-8 text-center border-dashed border-error mx-auto max-w-600"
    >
      <v-icon icon="mdi-rocket-outline" color="error" size="64" class="mb-4" />
      <h2 class="text-h5 font-weight-bold text-white mb-2">Rocket Not Found</h2>
      <p class="text-body-1 text-grey-lighten-1 mb-6">
        The rocket with ID "{{ rocketId }}" could not be found. It may have been removed or does not exist.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        class="text-none px-6 font-weight-bold"
        rounded="lg"
        @click="goBack"
      >
        Return to Dashboard
      </v-btn>
    </v-card>

    <v-card v-else-if="rocket" rounded="xl" overflow="hidden" class="bg-surface-dark border-subtle" theme="dark">
      <v-img
        :src="displayImageUrl"
        @error="handleImageError"
        height="400"
        cover
        class="align-end text-white"
        gradient="to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.9) 100%"
      >
        <template #placeholder>
          <v-row class="fill-height ma-0" align="center" justify="center">
            <v-progress-circular indeterminate color="grey" />
          </v-row>
        </template>
        
        <v-container class="px-6 pb-6">
          <div class="d-flex flex-wrap align-center gap-2 mb-2">
            <v-chip
              v-if="rocket.isUserAdded"
              color="amber-darken-2"
              size="small"
              class="font-weight-bold"
              variant="flat"
            >
              Custom
            </v-chip>
            <v-chip
              :color="rocket.active ? 'success' : 'grey'"
              size="small"
              class="font-weight-bold text-uppercase"
              variant="flat"
            >
              {{ rocket.active ? 'Active' : 'Inactive' }}
            </v-chip>
          </div>
          <h1 class="text-h2 font-weight-black text-shadow">{{ rocket.name }}</h1>
        </v-container>
      </v-img>

      <v-card-text class="pa-6">
        <v-row>
          <v-col cols="12" md="8">
            <h3 class="text-h5 font-weight-bold text-white mb-3">Overview</h3>
            <p class="text-body-1 text-grey-lighten-1 leading-relaxed mb-6">
              {{ rocket.description }}
            </p>

            <v-divider class="my-6" opacity="0.1" />

            <h3 class="text-h5 font-weight-bold text-white mb-4">Technical Details</h3>
            <v-row>
              <v-col cols="6" sm="4" class="pb-4">
                <div class="text-caption text-grey">STAGES</div>
                <div class="text-h6 font-weight-bold text-white">{{ rocket.stages ?? 'N/A' }}</div>
              </v-col>
              <v-col cols="6" sm="4" class="pb-4">
                <div class="text-caption text-grey">BOOSTERS</div>
                <div class="text-h6 font-weight-bold text-white">{{ rocket.boosters ?? 'N/A' }}</div>
              </v-col>
              <v-col cols="6" sm="4" class="pb-4">
                <div class="text-caption text-grey">SUCCESS RATE</div>
                <div class="text-h6 font-weight-bold text-white">
                  {{ rocket.success_rate_pct ? `${rocket.success_rate_pct}%` : 'N/A' }}
                </div>
              </v-col>
              <v-col cols="6" sm="4" class="pb-4" v-if="rocket.wikipedia">
                <div class="text-caption text-grey">WIKIPEDIA</div>
                <div class="text-body-1 mt-1">
                  <a :href="rocket.wikipedia" target="_blank" class="text-primary font-weight-bold decoration-none">
                    Article <v-icon icon="mdi-open-in-new" size="x-small" />
                  </a>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" md="4">
            <v-card variant="flat" color="surface-variant" rounded="lg" class="pa-5">
              <h3 class="text-h6 font-weight-bold text-white mb-4">Quick Specs</h3>
              
              <div class="d-flex justify-space-between py-2 border-bottom-subtle">
                <span class="text-body-2 text-grey">Cost per launch</span>
                <span class="text-body-2 font-weight-bold text-white">{{ formatCostFull(rocket.cost_per_launch) }}</span>
              </div>

              <div class="d-flex justify-space-between py-2 border-bottom-subtle">
                <span class="text-body-2 text-grey">Country</span>
                <span class="text-body-2 font-weight-bold text-white">{{ rocket.country }}</span>
              </div>

              <div class="d-flex justify-space-between py-2">
                <span class="text-body-2 text-grey">First Flight</span>
                <span class="text-body-2 font-weight-bold text-white">{{ formatDate(rocket.first_flight) }}</span>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div v-if="rocket.flickr_images && rocket.flickr_images.length > 1" class="mt-8">
          <v-divider class="mb-6" opacity="0.1" />
          <h3 class="text-h5 font-weight-bold text-white mb-4">Gallery</h3>
          <v-row>
            <v-col
              v-for="(img, idx) in rocket.flickr_images.slice(1)"
              :key="idx"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card rounded="lg" overflow="hidden">
                <v-img :src="img" height="200" cover class="bg-grey-darken-4">
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey" />
                    </v-row>
                  </template>
                </v-img>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRockets } from '@/composables/useRockets'

const route = useRoute()
const router = useRouter()
const { getRocketById, fetchRocketById, isLoading, isLoaded } = useRockets()

const rocketId = computed(() => (route.params as any).id as string)
const rocket = getRocketById(rocketId.value)

import fallbackUrl from '@/assets/rocket_placeholder.png'

const getInitialImageUrl = () => {
  if (rocket.value && rocket.value.flickr_images && rocket.value.flickr_images.length > 0 && rocket.value.flickr_images[0]) {
    return rocket.value.flickr_images[0]
  }
  return fallbackUrl
}

// Fallback to local custom image if details don't contain pictures
const displayImageUrl = ref(fallbackUrl)

watch(rocket, (newRocket) => {
  if (newRocket) {
    displayImageUrl.value = getInitialImageUrl()
  }
}, { immediate: true })

const handleImageError = () => {
  displayImageUrl.value = fallbackUrl
}

onMounted(async () => {
  try {
    await fetchRocketById(rocketId.value)
  } catch (err) {
    console.error('Failed to load rocket details:', err)
  }
})

const goBack = () => {
  router.push('/')
}

const formatCostFull = (cost: number) => {
  if (!cost) return '$0'
  return `$${cost.toLocaleString()}`
}

// Format date string to e.g. June 14, 2026
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A'
  try {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateStr).toLocaleDateString('en-US', options)
  } catch (_) {
    return dateStr
  }
}
</script>

<style scoped>
.max-w-600 {
  max-width: 600px;
}

.leading-relaxed {
  line-height: 1.7;
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.border-bottom-subtle {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.border-error {
  border-color: rgba(var(--v-theme-error), 0.5) !important;
}

.text-shadow {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
}

.decoration-none {
  text-decoration: none;
}

.decoration-none:hover {
  text-decoration: underline;
}
</style>
