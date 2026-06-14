<template>
  <v-container class="py-8 px-4" max-width="1200">
    <v-row align="center" justify="space-between" class="mb-8">
      <v-col cols="12" md="6">
        <h1 class="text-h3 font-weight-black text-white d-flex align-center">
          <v-icon icon="mdi-rocket-launch-outline" class="me-3 text-primary" size="large" />
          SpaceX Rockets
        </h1>
        <p class="text-subtitle-1 text-grey-lighten-1 mt-2">
          Explore the SpaceX fleet and add custom rockets to the lineup.
        </p>
      </v-col>
      <v-col cols="12" md="auto">
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          rounded="xl"
          class="text-none font-weight-bold px-6 shadow-glow"
          @click="isAddDialogOpen = true"
        >
          Add Rocket
        </v-btn>
      </v-col>
    </v-row>

    <v-card rounded="xl" class="pa-4 mb-8 bg-surface-dark border-subtle" elevation="1">
      <v-row dense align="center">
        <v-col cols="12" sm="8" md="9">
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search rockets by name..."
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="primary"
            hide-details
            clearable
          />
        </v-col>

        <v-col cols="12" sm="4" md="3">
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            label="Filter by Status"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            color="primary"
            hide-details
          />
        </v-col>
      </v-row>
    </v-card>

    <div v-if="isLoading && filteredRockets.length === 0" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        width="6"
        class="mb-4"
      />
      <span class="text-body-1 text-grey">Retrieving rocket data...</span>
    </div>

    <v-card
      v-else-if="error && filteredRockets.length === 0"
      color="error-container"
      variant="outlined"
      rounded="xl"
      class="pa-8 text-center mx-auto max-w-600"
    >
      <v-icon icon="mdi-alert-circle-outline" color="error" size="64" class="mb-4" />
      <h2 class="text-h5 font-weight-bold text-white mb-2">Failed to load rockets</h2>
      <p class="text-body-1 text-grey-lighten-1 mb-6">
        {{ error }}
      </p>
      <v-btn
        color="error"
        prepend-icon="mdi-reload"
        variant="flat"
        class="text-none px-6 font-weight-bold"
        rounded="lg"
        @click="retryFetch"
      >
        Retry Connection
      </v-btn>
    </v-card>

    <div v-else>
      <v-row v-if="filteredRockets.length > 0">
        <v-col
          v-for="rocket in filteredRockets"
          :key="rocket.id"
          cols="12"
          sm="6"
          md="4"
          class="pb-6"
        >
          <RocketCard :rocket="rocket" />
        </v-col>
      </v-row>

      <v-card
        v-else
        variant="outlined"
        rounded="xl"
        class="pa-12 text-center border-dashed border-subtle"
      >
        <v-icon icon="mdi-rocket-outline" color="grey-darken-1" size="64" class="mb-4" />
        <h3 class="text-h6 font-weight-bold text-white mb-1">No rockets found</h3>
        <p class="text-body-2 text-grey">
          Try adjusting your search terms or status filters.
        </p>
      </v-card>
    </div>

    <AddRocketDialog v-model="isAddDialogOpen" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRockets } from '@/composables/useRockets'
import RocketCard from '@/components/RocketCard.vue'
import AddRocketDialog from '@/components/AddRocketDialog.vue'

const { rockets, isLoading, error, fetchRockets } = useRockets()

const searchQuery = ref('')
const selectedStatus = ref('All')
const isAddDialogOpen = ref(false)

const statusOptions = ['All', 'Active', 'Inactive']

onMounted(() => {
  fetchRockets()
})

const retryFetch = () => {
  fetchRockets(true)
}

// Filter the fleet list by search query and active status
const filteredRockets = computed(() => {
  return rockets.value.filter(rocket => {
    const matchesSearch = !searchQuery.value || 
      rocket.name.toLowerCase().includes(searchQuery.value.toLowerCase())

    let matchesStatus = true
    if (selectedStatus.value === 'Active') {
      matchesStatus = !!rocket.active
    } else if (selectedStatus.value === 'Inactive') {
      matchesStatus = !rocket.active
    }

    return matchesSearch && matchesStatus
  })
})
</script>

<style scoped>
.max-w-600 {
  max-width: 600px;
}

.border-subtle {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.border-dashed {
  border-style: dashed !important;
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(var(--v-theme-primary), 0.4);
}
</style>
