import { ref, computed } from 'vue'

export interface Rocket {
  id: string
  name: string
  type?: string
  active?: boolean
  stages?: number
  boosters?: number
  cost_per_launch: number
  success_rate_pct?: number
  first_flight: string
  country: string
  company?: string
  flickr_images: string[]
  wikipedia?: string
  description: string
  isUserAdded?: boolean
}

// Global state shared across routes
const rockets = ref<Rocket[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const isLoaded = ref(false)

const BASE_URI = 'http://localhost:6673/v4'

export function useRockets() {
  const fetchRockets = async (force = false) => {
    if (isLoaded.value && !force) return

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${BASE_URI}/rockets`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }
      
      const data: Rocket[] = await response.json()
      const userAdded = rockets.value.filter(r => r.isUserAdded)
      
      rockets.value = [...userAdded, ...data]
      isLoaded.value = true
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching rocket data.'
      isLoaded.value = false
    } finally {
      isLoading.value = false
    }
  }

  const addRocket = async (rocket: Omit<Rocket, 'id' | 'isUserAdded'>) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${BASE_URI}/rockets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'spacex-key': 'allo-bank-spacex-key-2026'
        },
        body: JSON.stringify({
          ...rocket,
          type: 'rocket',
          company: 'SpaceX'
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to insert rocket: ${response.status} ${response.statusText}`)
      }

      // Reload to pull the newly added rocket from database
      await fetchRockets(true)
    } catch (err: any) {
      error.value = err.message || 'An error occurred while creating the rocket.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getRocketById = (id: string) => {
    return computed(() => rockets.value.find(r => r.id === id) || null)
  }

  const fetchRocketById = async (id: string) => {
    // Custom local rockets are kept in-memory
    if (id.startsWith('custom-')) {
      const custom = rockets.value.find(r => r.id === id)
      if (custom) return custom
      throw new Error(`Custom rocket with ID ${id} not found`)
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${BASE_URI}/rockets/${id}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch rocket detail: ${response.status} ${response.statusText}`)
      }
      const data: Rocket = await response.json()

      const idx = rockets.value.findIndex(r => r.id === id)
      if (idx !== -1) {
        rockets.value[idx] = { ...rockets.value[idx], ...data }
      } else {
        rockets.value.push(data)
      }
      return data
    } catch (err: any) {
      error.value = err.message || 'An error occurred while fetching rocket details.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    rockets,
    isLoading,
    error,
    isLoaded,
    fetchRockets,
    addRocket,
    getRocketById,
    fetchRocketById
  }
}
