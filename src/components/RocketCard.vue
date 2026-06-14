<template>
  <v-card
    class="rocket-card h-100 d-flex flex-column"
    elevation="2"
    rounded="xl"
    theme="dark"
    @click="navigateToDetail"
  >
    <v-img
      :src="displayImageUrl"
      @error="handleImageError"
      height="220"
      cover
      class="align-end text-white position-relative"
      gradient="to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%"
    >
      <template #placeholder>
        <v-row
          class="fill-height ma-0"
          align="center"
          justify="center"
        >
          <v-progress-circular
            indeterminate
            color="grey-lighten-1"
          />
        </v-row>
      </template>

      <div class="position-absolute top-0 right-0 ma-3 d-flex gap-2">
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

      <v-card-title class="text-h5 font-weight-bold pb-2 text-shadow">
        {{ rocket.name }}
      </v-card-title>
    </v-img>

    <v-card-text class="flex-grow-1 pt-4 pb-2">
      <p class="text-body-2 text-grey-lighten-1 mb-4 line-clamp-3">
        {{ rocket.description || 'No description provided.' }}
      </p>

      <v-divider class="mb-4" opacity="0.1" />

      <div class="d-flex justify-space-between align-center text-caption text-grey">
        <div>
          <v-icon icon="mdi-earth" size="small" class="me-1" />
          <span>{{ rocket.country }}</span>
        </div>
        <div>
          <v-icon icon="mdi-currency-usd" size="small" class="me-1" />
          <span class="font-weight-bold text-grey-lighten-2">{{ formatCost(rocket.cost_per_launch) }}</span>
        </div>
      </div>
    </v-card-text>

    <v-card-actions class="px-4 pb-4 pt-0">
      <v-btn
        color="primary"
        variant="text"
        append-icon="mdi-arrow-right"
        class="text-none px-0 font-weight-bold"
      >
        View Details
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Rocket } from '@/composables/useRockets'

const props = defineProps<{
  rocket: Rocket
}>()

const router = useRouter()

import fallbackUrl from '@/assets/rocket_placeholder.png'

const getInitialImageUrl = () => {
  if (props.rocket.flickr_images && props.rocket.flickr_images.length > 0 && props.rocket.flickr_images[0]) {
    return props.rocket.flickr_images[0]
  }
  return fallbackUrl
}

// Fallback to local asset if no image exists or if load fails
const displayImageUrl = ref(getInitialImageUrl())

watch(() => props.rocket.flickr_images, () => {
  displayImageUrl.value = getInitialImageUrl()
}, { deep: true })

const handleImageError = () => {
  displayImageUrl.value = fallbackUrl
}

// Format cost to e.g. $50M
const formatCost = (cost: number) => {
  if (!cost) return '$0'
  if (cost >= 1_000_000) {
    return `$${(cost / 1_000_000).toFixed(1)}M`
  }
  return `$${cost.toLocaleString()}`
}

const navigateToDetail = () => {
  router.push(`/rocket/${props.rocket.id}`)
}
</script>

<style scoped>
.rocket-card {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  overflow: hidden;
}

.rocket-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5) !important;
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  height: 4.5em;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}
</style>
