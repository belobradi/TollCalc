// geolocation.js - Utility for getting user's current location
import { reverseToShortAddress } from './utils.js'

/**
 * Get the user's current position using the Geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<{lat: number, lon: number}>} - User's current coordinates
 */
export function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'))
      return
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    }

    const mergedOptions = { ...defaultOptions, ...options }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
      },
      (error) => {
        let message = 'Unknown location error'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case error.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        reject(new Error(message))
      },
      mergedOptions
    )
  })
}

/**
 * Get current position and reverse geocode to readable address
 * @returns {Promise<{lat: number, lon: number, address: string}>}
 */
export async function getCurrentLocationWithAddress() {
  const position = await getCurrentPosition()
  const address = await reverseToShortAddress([position.lat, position.lon])
  return {
    ...position,
    address
  }
}

/**
 * Check if geolocation is available and permissions are granted
 * @returns {Promise<boolean>}
 */
export async function checkGeolocationAvailability() {
  if (!navigator.geolocation) {
    return false
  }

  // Check if permissions API is available
  if (navigator.permissions) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return permission.state === 'granted' || permission.state === 'prompt'
    } catch {
      // Permissions API may not be supported, fall back to trying geolocation
      return true
    }
  }

  return true
}

/**
 * Request location permission by attempting to get current position
 * @returns {Promise<boolean>} - true if permission granted, false otherwise
 */
export async function requestLocationPermission() {
  try {
    await getCurrentPosition({ timeout: 5000 })
    return true
  } catch (error) {
    console.warn('Location permission request failed:', error.message)
    return false
  }
}