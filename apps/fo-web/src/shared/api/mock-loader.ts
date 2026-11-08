import { mockBuild } from '../lib/bridge'

export const loadMock = () => (mockBuild ? import('./mock') : Promise.reject(new Error('mock is not in this build')))
