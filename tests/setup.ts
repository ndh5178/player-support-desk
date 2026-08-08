import { enableAutoUnmount } from '@vue/test-utils'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { registerDefaultHandlers, server } from './mocks/server'

enableAutoUnmount(afterEach)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  registerDefaultHandlers()
})

afterAll(() => {
  server.close()
})
