import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getAuthSession,
  login as requestLogin,
  logout as requestLogout,
  setUnauthorizedHandler,
} from '../services/api'
import { ApiError } from '../types/api'
import type { Agent } from '../types/inquiry'

const MOCK_AGENT: Agent = {
  id: 'agent-001',
  name: '김서윤',
  team: 'Player Care',
}

export const useAuthStore = defineStore('auth', () => {
  const currentAgent = ref<Agent | null>(null)
  const isInitialized = ref(false)
  const isCheckingSession = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  const usesMockApi = import.meta.env.VITE_ENABLE_MOCKS !== 'false'
  const isAuthenticated = computed(() => currentAgent.value !== null)

  function clearSession(): void {
    currentAgent.value = null
  }

  setUnauthorizedHandler(clearSession)

  async function initializeSession(force = false): Promise<boolean> {
    if (isInitialized.value && !force) {
      return true
    }

    if (usesMockApi) {
      currentAgent.value = MOCK_AGENT
      isInitialized.value = true
      return true
    }

    isCheckingSession.value = true
    errorMessage.value = ''

    try {
      const session = await getAuthSession()
      currentAgent.value = session.authenticated && session.agent ? session.agent : null
      return true
    } catch {
      currentAgent.value = null
      errorMessage.value = '로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      return false
    } finally {
      isCheckingSession.value = false
      isInitialized.value = true
    }
  }

  async function login(username: string, password: string): Promise<boolean> {
    if (isSubmitting.value) {
      return false
    }

    if (usesMockApi) {
      currentAgent.value = MOCK_AGENT
      return true
    }

    // 로그아웃이나 세션 만료 뒤에는 기존 CSRF 토큰을 재사용하지 않고 새 토큰을 준비한다.
    const sessionReady = await initializeSession(true)
    if (!sessionReady) {
      return false
    }
    isSubmitting.value = true
    errorMessage.value = ''

    try {
      const session = await requestLogin({ username: username, password: password })
      currentAgent.value = session.agent ?? null
      return session.authenticated && currentAgent.value !== null
    } catch (error) {
      currentAgent.value = null
      errorMessage.value =
        error instanceof ApiError
          ? error.message
          : '로그인 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  async function logout(): Promise<boolean> {
    if (usesMockApi || isSubmitting.value) {
      return false
    }

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      await requestLogout()
      clearSession()
      // 새로고침하지 않아도 다음 로그인이 가능하도록 익명 세션의 CSRF 토큰을 다시 받는다.
      await initializeSession(true)
      return true
    } catch (error) {
      errorMessage.value =
        error instanceof ApiError
          ? error.message
          : '로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  function clearError(): void {
    errorMessage.value = ''
  }

  return {
    currentAgent: currentAgent,
    isInitialized: isInitialized,
    isCheckingSession: isCheckingSession,
    isSubmitting: isSubmitting,
    errorMessage: errorMessage,
    usesMockApi: usesMockApi,
    isAuthenticated: isAuthenticated,
    initializeSession: initializeSession,
    login: login,
    logout: logout,
    clearError: clearError,
  }
})
