import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/reset.css'
import './assets/styles/tokens.css'
import './assets/styles/global.css'

// Mock이 활성화된 환경에서는 브라우저의 실제 네트워크 요청을 MSW가 가로채도록 준비한다.
// Worker가 준비되기 전에 앱을 마운트하면 첫 API 요청이 서버로 빠질 수 있다.
async function enableMocking() {
  if (import.meta.env.MODE === 'test' || import.meta.env.VITE_ENABLE_MOCKS === 'false') {
    return
  }

  const module = await import('./mocks/browser')
  const worker = module.worker

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

  // Pinia와 Router를 앱 전체에서 사용할 수 있게 등록한 뒤 #app 요소에 Vue를 연결한다.
  app.use(createPinia())
  app.use(router)
  app.mount('#app')
}

void bootstrap()
