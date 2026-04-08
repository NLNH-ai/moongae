export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

export const routerMode = import.meta.env.VITE_ROUTER_MODE ?? 'browser'

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
