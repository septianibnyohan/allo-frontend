import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRockets } from '../useRockets'

describe('useRockets composable', () => {
  beforeEach(() => {
    // Mock the global fetch function
    vi.stubGlobal('fetch', vi.fn())
  })

  it('should initialize with default empty values', () => {
    const { rockets, isLoading, error, isLoaded } = useRockets()
    expect(rockets.value).toEqual([])
    expect(isLoading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(isLoaded.value).toBe(false)
  })

  it('should successfully fetch rockets list', async () => {
    const mockRockets = [
      { id: '1', name: 'Falcon 1', cost_per_launch: 6700000, country: 'Republic of the Marshall Islands', flickr_images: [], description: 'Falcon 1 desc' },
      { id: '2', name: 'Falcon 9', cost_per_launch: 50000000, country: 'United States', flickr_images: [], description: 'Falcon 9 desc' }
    ]

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRockets)
    })
    vi.stubGlobal('fetch', fetchMock)

    const { fetchRockets, rockets, isLoaded } = useRockets()
    await fetchRockets(true)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:6673/v4/rockets')
    expect(rockets.value).toEqual(mockRockets)
    expect(isLoaded.value).toBe(true)
  })

  it('should handle fetch errors gracefully', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    })
    vi.stubGlobal('fetch', fetchMock)

    const { fetchRockets, error, isLoaded } = useRockets()
    await fetchRockets(true)

    expect(error.value).toBe('Failed to fetch: 500 Internal Server Error')
    expect(isLoaded.value).toBe(false)
  })
})
