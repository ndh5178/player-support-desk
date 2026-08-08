import { setupServer } from 'msw/node'

import { handlers } from '@/mocks/handlers'

export const server = setupServer()

export function registerDefaultHandlers(): void {
  for (const handler of handlers) {
    server.use(handler)
  }
}

registerDefaultHandlers()
