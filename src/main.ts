import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/reset.css'
import './assets/styles/tokens.css'
import './assets/styles/global.css'

async function enableMocking() {
  if (import.meta.env.MODE === 'test' || import.meta.env.VITE_ENABLE_MOCKS === 'false') {
    return
  }

  const { worker } = await import('./mocks/browser')

  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  })
}

async function bootstrap() {
  await enableMocking()

  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

void bootstrap()
