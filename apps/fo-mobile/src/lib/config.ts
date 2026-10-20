// Android emulator reaches the host via 10.0.2.2; set these in .env.local per device.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080/api/v1'
export const WEB_BASE_URL = process.env.EXPO_PUBLIC_WEB_BASE_URL ?? 'http://localhost:5174'
export const DEV_AUTH_TOKEN = process.env.EXPO_PUBLIC_DEV_AUTH_TOKEN
// Serve fixtures from src/mock until push-be v2 endpoints exist.
export const API_MOCK = process.env.EXPO_PUBLIC_API_MOCK === '1'
