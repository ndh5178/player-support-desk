import { setupWorker } from 'msw/browser'

import { handlers } from './handlers'

// 등록한 REST 핸들러로 브라우저의 fetch 요청을 가로채는 Service Worker를 만든다.
export const worker = setupWorker(...handlers)
